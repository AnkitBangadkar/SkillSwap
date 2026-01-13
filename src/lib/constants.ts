// ============================================
// App Configuration
// ============================================

export const APP_CONFIG = {
  name: 'SkillSwap',
  description: 'Campus Skill Sharing Marketplace',
  version: '1.0.0',
  
  // Email domain restriction - easily tweakable
  allowedEmailDomains: ['muj.manipal.edu'],
  
  // Pagination
  defaultPageSize: 20,
  
  // Chat
  maxMessageLength: 1000,
  
  // Listings
  maxTags: 5,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
} as const;

// ============================================
// Skill Tags - Organized by Category
// ============================================

export interface TagCategory {
  name: string;
  icon: string;
  tags: string[];
}

export const SKILL_CATEGORIES: TagCategory[] = [
  {
    name: 'Programming',
    icon: 'code',
    tags: [
      'Python',
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Java',
      'C++',
      'C',
      'Rust',
      'Go',
      'Flutter',
      'Swift',
      'Kotlin',
      'SQL',
      'MongoDB',
      'Git',
      'Docker',
      'AWS',
      'Machine Learning',
      'Data Science',
      'Web Development',
      'Mobile Development',
      'Game Development',
    ],
  },
  {
    name: 'Academic',
    icon: 'graduation-cap',
    tags: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Statistics',
      'Economics',
      'Accounting',
      'Finance',
      'Marketing',
      'Psychology',
      'Sociology',
      'History',
      'Political Science',
      'Philosophy',
      'English Literature',
      'Research Methods',
      'Academic Writing',
      'Thesis Writing',
    ],
  },
  {
    name: 'Languages',
    icon: 'languages',
    tags: [
      'English',
      'Hindi',
      'Spanish',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Mandarin',
      'Arabic',
      'Portuguese',
      'Italian',
      'Russian',
    ],
  },
  {
    name: 'Creative',
    icon: 'palette',
    tags: [
      'Graphic Design',
      'UI/UX Design',
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Video Editing',
      'Photography',
      'Animation',
      '3D Modeling',
      'Drawing',
      'Painting',
      'Digital Art',
      'Content Writing',
      'Copywriting',
      'Blogging',
    ],
  },
  {
    name: 'Music',
    icon: 'music',
    tags: [
      'Guitar',
      'Piano',
      'Drums',
      'Violin',
      'Singing',
      'Music Theory',
      'Music Production',
      'DJ',
      'Beatmaking',
      'Songwriting',
    ],
  },
  {
    name: 'Sports & Fitness',
    icon: 'dumbbell',
    tags: [
      'Football',
      'Basketball',
      'Cricket',
      'Tennis',
      'Badminton',
      'Swimming',
      'Yoga',
      'Gym Training',
      'Running',
      'Martial Arts',
      'Dance',
    ],
  },
  {
    name: 'Business & Career',
    icon: 'briefcase',
    tags: [
      'Resume Writing',
      'Interview Prep',
      'Public Speaking',
      'Presentation Skills',
      'Leadership',
      'Project Management',
      'Entrepreneurship',
      'Networking',
      'LinkedIn Optimization',
      'Personal Branding',
    ],
  },
  {
    name: 'Other',
    icon: 'sparkles',
    tags: [
      'Cooking',
      'Baking',
      'Chess',
      'Rubik\'s Cube',
      'Card Tricks',
      'Origami',
      'Gardening',
      'Meditation',
      'Time Management',
      'Study Techniques',
    ],
  },
];

// Flattened list of all tags for quick access
export const ALL_TAGS: string[] = SKILL_CATEGORIES.flatMap(cat => cat.tags);

// ============================================
// Availability Options
// ============================================

export const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
  'Weekend evenings',
  'Flexible',
] as const;

// ============================================
// Duration Options (in minutes)
// ============================================

export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
] as const;

// ============================================
// Mode Options
// ============================================

export const MODE_OPTIONS = [
  { value: 'online', label: 'Online', icon: 'video' },
  { value: 'offline', label: 'In-person', icon: 'map-pin' },
  { value: 'both', label: 'Both', icon: 'shuffle' },
] as const;

// ============================================
// Booking Status Labels
// ============================================

export const BOOKING_STATUS_LABELS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
  completed: { label: 'Completed', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'gray' },
} as const;

// ============================================
// Routes
// ============================================

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  explore: '/explore',
  createListing: '/listings/new',
  editListing: (id: string) => `/listings/${id}/edit`,
  matches: '/matches',
  chats: '/chats',
  chatRoom: (id: string) => `/chats/${id}`,
  bookings: '/bookings',
  profile: '/profile',
  userProfile: (id: string) => `/users/${id}`,
} as const;
