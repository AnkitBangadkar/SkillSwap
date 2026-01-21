import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { Listing } from '../types';

// ============================================
// Configuration
// ============================================

// Models in order of preference (try first, fallback to next)
const MODEL_PRIORITY = [
  'gemini-1.5-flash',      // Most stable text-only model
] as const;

// Parse API keys from env (comma-separated for multiple keys)
function getApiKeys(): string[] {
  const keyString = import.meta.env.VITE_GEMINI_API_KEY || '';
  return keyString
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k !== '' && k !== 'your_gemini_api_key');
}

const API_KEYS = getApiKeys();
const MAX_RETRIES_PER_MODEL = 2;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Track current API key index for rotation
let currentKeyIndex = 0;

// Check if Gemini is configured
export const isGeminiConfigured = (): boolean => {
  // Temporarily disable AI to prevent image errors
  return false; // API_KEYS.length > 0;
};

// Get current API key
function getCurrentApiKey(): string {
  return API_KEYS[currentKeyIndex] || '';
}

// Rotate to next API key, returns true if rotated, false if no more keys
function rotateApiKey(): boolean {
  if (currentKeyIndex < API_KEYS.length - 1) {
    currentKeyIndex++;
    console.log(`Rotating to API key ${currentKeyIndex + 1}/${API_KEYS.length}`);
    return true;
  }
  return false;
}

// Reset API key rotation
function resetApiKeyRotation(): void {
  currentKeyIndex = 0;
}

// Create a new client with current API key
function createClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getCurrentApiKey());
}

// ============================================
// Error Types & Handling
// ============================================

export type GeminiErrorType = 
  | 'rate_limit'
  | 'invalid_api_key'
  | 'model_not_found'
  | 'network_error'
  | 'content_filter'
  | 'unknown';

export interface GeminiError {
  type: GeminiErrorType;
  message: string;
  retryable: boolean;
  shouldRotateKey: boolean;
  shouldTryNextModel: boolean;
  retryAfter?: number;
}

/**
 * Parse error from Gemini API and determine error type
 */
function parseGeminiError(error: unknown): GeminiError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const messageLC = errorMessage.toLowerCase();
  
  // Rate limit errors (429) - try next key or model
  if (messageLC.includes('429') || messageLC.includes('quota') || 
      messageLC.includes('rate limit') || messageLC.includes('resource exhausted')) {
    return {
      type: 'rate_limit',
      message: 'AI is currently busy. Please try again in a moment.',
      retryable: true,
      shouldRotateKey: true,
      shouldTryNextModel: true,
      retryAfter: 2000,
    };
  }
  
  // Invalid API key - try next key
  if (messageLC.includes('api key not valid') || messageLC.includes('invalid api key') || 
      messageLC.includes('api_key_invalid') || messageLC.includes('permission denied')) {
    return {
      type: 'invalid_api_key',
      message: 'AI configuration error. Please contact support.',
      retryable: false,
      shouldRotateKey: true,
      shouldTryNextModel: false,
    };
  }
  
  // Model not found (404) - try next model
  if (messageLC.includes('not found') || messageLC.includes('404') || 
      messageLC.includes('not supported') || messageLC.includes('does not exist')) {
    return {
      type: 'model_not_found',
      message: 'AI model unavailable. Trying alternative...',
      retryable: false,
      shouldRotateKey: false,
      shouldTryNextModel: true,
    };
  }
  
  // Content filter / safety issues - don't retry
  if (messageLC.includes('safety') || messageLC.includes('blocked') || messageLC.includes('harm')) {
    return {
      type: 'content_filter',
      message: 'Content was filtered for safety reasons.',
      retryable: false,
      shouldRotateKey: false,
      shouldTryNextModel: false,
    };
  }
  
  // Network errors - retry with same config
  if (messageLC.includes('fetch') || messageLC.includes('network') || 
      messageLC.includes('econnrefused') || messageLC.includes('timeout') || 
      messageLC.includes('connection')) {
    return {
      type: 'network_error',
      message: 'Network error. Please check your connection.',
      retryable: true,
      shouldRotateKey: false,
      shouldTryNextModel: false,
    };
  }
  
  // Unknown error - retry then try next model
  return {
    type: 'unknown',
    message: 'AI request failed. Please try again.',
    retryable: true,
    shouldRotateKey: false,
    shouldTryNextModel: true,
  };
}

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Try to generate content with a specific model
 */
async function tryGenerateWithModel(
  modelName: string,
  prompt: string,
  operationName: string
): Promise<string | null> {
  const client = createClient();
  let model: GenerativeModel;
  
  try {
    // Use text-only configuration for all models
    const modelConfig = {
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };
    
    model = client.getGenerativeModel(modelConfig);
  } catch (error) {
    console.error(`${operationName}: Failed to get model ${modelName}:`, error);
    return null;
  }

  for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      const geminiError = parseGeminiError(error);
      
      console.warn(`${operationName} [${modelName}] attempt ${attempt + 1} failed:`, {
        type: geminiError.type,
        message: geminiError.message,
        originalError: error instanceof Error ? error.message : String(error),
      });

      // Try rotating API key if suggested
      if (geminiError.shouldRotateKey && rotateApiKey()) {
        console.log(`${operationName}: Trying with next API key...`);
        return tryGenerateWithModel(modelName, prompt, operationName);
      }

      // If should try next model, return null to signal model switch
      if (geminiError.shouldTryNextModel) {
        return null;
      }

      // If retryable, wait and retry
      if (geminiError.retryable && attempt < MAX_RETRIES_PER_MODEL - 1) {
        const delay = geminiError.retryAfter || (INITIAL_RETRY_DELAY * Math.pow(2, attempt));
        console.log(`${operationName}: Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Non-retryable error
      return null;
    }
  }

  return null;
}

/**
 * Main wrapper for AI calls with model fallback and API key rotation
 */
async function withModelFallback<T>(
  promptGenerator: () => string,
  responseParser: (text: string) => T,
  fallback: T,
  operationName: string = 'AI operation'
): Promise<T> {
  if (!isGeminiConfigured()) {
    console.warn(`${operationName}: Gemini not configured (no valid API keys), returning fallback`);
    return fallback;
  }

  // Reset key rotation for each new operation
  resetApiKeyRotation();

  for (const modelName of MODEL_PRIORITY) {
    console.log(`${operationName}: Trying model ${modelName}...`);
    
    try {
      const prompt = promptGenerator();
      const result = await tryGenerateWithModel(modelName, prompt, operationName);
      
      if (result !== null) {
        console.log(`${operationName}: Success with model ${modelName}`);
        return responseParser(result);
      }
      
      // Reset key rotation before trying next model
      resetApiKeyRotation();
      console.log(`${operationName}: Model ${modelName} failed, trying next...`);
    } catch (error) {
      console.error(`${operationName}: Unexpected error with ${modelName}:`, error);
    }
  }

  console.warn(`${operationName}: All models exhausted, returning fallback`);
  return fallback;
}

// ============================================
// Generate Match Explanation
// ============================================

export async function generateMatchExplanation(
  listing1: Listing,
  listing2: Listing
): Promise<string | null> {
  return withModelFallback(
    () => {
      // Clean descriptions to remove any potential image URLs or references
      const cleanDesc1 = listing1.description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.png|image\.jpg|image\.jpeg|image\.gif/gi, '[image]')
        .slice(0, 200);

      const cleanDesc2 = listing2.description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.png|image\.jpg|image\.jpeg|image\.gif/gi, '[image]')
        .slice(0, 200);

      return `You are helping students on a campus skill-sharing platform.

Given two student skill listings, explain briefly why they are compatible for a skill exchange.

IMPORTANT: Only process text content. Do not attempt to read or analyze any images.

Listing A (${listing1.type === 'offer' ? 'Offering' : 'Looking for'}):
- Title: ${listing1.title.slice(0, 100)}
- Description: ${cleanDesc1}
- Skills/Topics: ${listing1.tags.slice(0, 5).join(', ')}
- Posted by: ${listing1.userName}

Listing B (${listing2.type === 'offer' ? 'Offering' : 'Looking for'}):
- Title: ${listing2.title.slice(0, 100)}
- Description: ${cleanDesc2}
- Skills/Topics: ${listing2.tags.slice(0, 5).join(', ')}
- Posted by: ${listing2.userName}

Write a friendly, encouraging explanation (1-2 sentences, max 30 words) about why these students would be great skill exchange partners. Focus on complementary skills and potential collaboration.`;
    },
    (text) => text,
    null,
    'generateMatchExplanation'
  );
}

// ============================================
// Generate Tag Suggestions
// ============================================

export async function generateTagSuggestions(
  title: string,
  description: string
): Promise<string[]> {
  return withModelFallback(
    () => {
      // Clean the description to remove any potential image URLs or references
      const cleanDescription = description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.png|image\.jpg|image\.jpeg|image\.gif/gi, '[image]')
        .slice(0, 300); // Limit description length

      return `You are helping a student tag their skill listing on a campus skill-sharing platform.

IMPORTANT: Only process text content. Do not attempt to read or analyze any images.

Based on the following listing, suggest 3-5 relevant skill tags.

Title: ${title.slice(0, 100)}
Description: ${cleanDescription}

Return ONLY a comma-separated list of tags. Tags should be common skill names like: Python, JavaScript, Guitar, Photography, Spanish, Calculus, etc.

Example output: Python, Machine Learning, Data Science`;
    },
    (text) => {
      const tags = text
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && tag.length < 30);
      return tags.slice(0, 5);
    },
    [],
    'generateTagSuggestions'
  );
}

// ============================================
// Generate Conversation Starters
// ============================================

const DEFAULT_CONVERSATION_STARTERS = [
  "What specific topics would you like to cover?",
  "How much experience do you have with this skill?",
  "Would you prefer online or in-person sessions?",
];

export async function generateConversationStarters(
  listing: Listing
): Promise<string[]> {
  return withModelFallback(
    () => {
      // Clean the description to remove any potential image URLs or references
      const cleanDescription = listing.description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.png|image\.jpg|image\.jpeg|image\.gif/gi, '[image]')
        .slice(0, 200); // Limit description length

      return `You are helping students start a conversation about skill exchange on a campus platform.

A student is about to message someone about this listing:
- Title: ${listing.title.slice(0, 100)}
- Type: ${listing.type === 'offer' ? 'Someone is offering to teach' : 'Someone is looking to learn'}
- Description: ${cleanDescription}
- Topics: ${listing.tags.slice(0, 5).join(', ')}

IMPORTANT: Only process text content. Do not attempt to read or analyze any images.

Generate 3 short, friendly conversation starter messages (max 15 words each) that would be appropriate to send.

Return each starter on a new line without numbering or bullets.`;
    },
    (text) => {
      const starters = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.length < 100);
      return starters.slice(0, 3);
    },
    DEFAULT_CONVERSATION_STARTERS,
    'generateConversationStarters'
  );
}

// ============================================
// Generate Listing Description Enhancement
// ============================================

export async function enhanceListingDescription(
  title: string,
  type: 'offer' | 'request',
  tags: string[],
  currentDescription: string
): Promise<string | null> {
  return withModelFallback(
    () => {
      // Aggressively clean the current description to remove any potential image references
      const cleanDescription = currentDescription
        // Remove all URLs
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        // Remove image file references
        .replace(/image\.(png|jpg|jpeg|gif|bmp|svg|webp)/gi, '[image]')
        // Remove markdown image syntax
        .replace(/!\[.*?\]\(.*?\)/g, '[image]')
        // Remove HTML image tags
        .replace(/<img[^>]*>/gi, '[image]')
        // Remove base64 image data
        .replace(/data:image\/[^;]+;base64,[^\s]+/g, '[image]')
        // Remove any remaining image-related words
        .replace(/\b(png|jpg|jpeg|gif|bmp|svg|webp|image|photo|picture)\b/gi, '[media]')
        // Limit length and remove extra whitespace
        .slice(0, 300)
        .trim();

      const cleanTitle = title
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .slice(0, 100)
        .trim();

      const cleanTags = tags.slice(0, 5).join(', ');

      return `You are helping a student improve their skill listing description on a campus skill-sharing platform.

CRITICAL INSTRUCTIONS:
- ONLY process text content
- DO NOT attempt to read, analyze, or interpret any images
- IGNORE any image references, URLs, or media content
- Focus solely on the text description provided

Current listing details:
- Title: ${cleanTitle}
- Type: ${type === 'offer' ? 'Offering a skill' : 'Looking to learn'}
- Topics: ${cleanTags}
- Current description: "${cleanDescription}"

TASK: Improve this description to be more engaging and informative. Keep it casual and friendly (2-3 sentences, max 100 words). Include what makes this a great opportunity for skill exchange.

IMPORTANT: Return ONLY the improved text description. No explanations, no formatting, no additional text.`;
    },
    (text) => {
      // Clean the response to ensure it's just text
      return text
        .replace(/[""]/g, '"') // Normalize quotes
        .replace(/['']/g, "'") // Normalize apostrophes
        .trim();
    },
    null,
    'enhanceListingDescription'
  );
}
