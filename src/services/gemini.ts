import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Listing } from '../types';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Check if Gemini is configured
export const isGeminiConfigured = (): boolean => {
  return API_KEY !== '' && API_KEY !== 'your_gemini_api_key';
};

// Lazy initialization of the client
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

// ============================================
// Generate Match Explanation
// ============================================

export async function generateMatchExplanation(
  listing1: Listing,
  listing2: Listing
): Promise<string | null> {
  if (!isGeminiConfigured()) {
    return null;
  }

  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are helping students on a campus skill-sharing platform.

Given two student skill listings, explain briefly why they are compatible for a skill exchange.

Listing A (${listing1.type === 'offer' ? 'Offering' : 'Looking for'}):
- Title: ${listing1.title}
- Description: ${listing1.description}
- Skills/Topics: ${listing1.tags.join(', ')}
- Posted by: ${listing1.userName}

Listing B (${listing2.type === 'offer' ? 'Offering' : 'Looking for'}):
- Title: ${listing2.title}
- Description: ${listing2.description}
- Skills/Topics: ${listing2.tags.join(', ')}
- Posted by: ${listing2.userName}

Write a friendly, encouraging explanation (1-2 sentences, max 30 words) about why these students would be great skill exchange partners. Focus on complementary skills and potential collaboration.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// ============================================
// Generate Tag Suggestions
// ============================================

export async function generateTagSuggestions(
  title: string,
  description: string
): Promise<string[]> {
  if (!isGeminiConfigured()) {
    return [];
  }

  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are helping a student tag their skill listing on a campus skill-sharing platform.

Based on the following listing, suggest 3-5 relevant skill tags.

Title: ${title}
Description: ${description}

Return ONLY a comma-separated list of tags. Tags should be common skill names like: Python, JavaScript, Guitar, Photography, Spanish, Calculus, etc.

Example output: Python, Machine Learning, Data Science`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse comma-separated tags
    const tags = text
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length < 30);
    
    return tags.slice(0, 5);
  } catch (error) {
    console.error('Gemini API error:', error);
    return [];
  }
}

// ============================================
// Generate Conversation Starters
// ============================================

export async function generateConversationStarters(
  listing: Listing
): Promise<string[]> {
  if (!isGeminiConfigured()) {
    // Return default starters
    return [
      "What specific topics would you like to cover?",
      "How much experience do you have with this skill?",
      "Would you prefer online or in-person sessions?",
    ];
  }

  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are helping students start a conversation about skill exchange on a campus platform.

A student is about to message someone about this listing:
- Title: ${listing.title}
- Type: ${listing.type === 'offer' ? 'Someone is offering to teach' : 'Someone is looking to learn'}
- Description: ${listing.description}
- Topics: ${listing.tags.join(', ')}

Generate 3 short, friendly conversation starter messages (max 15 words each) that would be appropriate to send.

Return each starter on a new line without numbering or bullets.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse line-separated starters
    const starters = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length < 100);
    
    return starters.slice(0, 3);
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return default starters on error
    return [
      "What specific topics would you like to cover?",
      "How much experience do you have with this skill?",
      "Would you prefer online or in-person sessions?",
    ];
  }
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
  if (!isGeminiConfigured()) {
    return null;
  }

  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are helping a student improve their skill listing description on a campus skill-sharing platform.

Current listing:
- Title: ${title}
- Type: ${type === 'offer' ? 'Offering a skill' : 'Looking to learn'}
- Topics: ${tags.join(', ')}
- Current description: ${currentDescription}

Improve this description to be more engaging and informative. Keep it casual and friendly (2-3 sentences, max 100 words). Include what makes this a great opportunity for skill exchange.

Return ONLY the improved description, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}
