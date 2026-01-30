
export enum PlaceCategory {
  FOOD = 'Food',
  HANGOUT = 'Hangout',
  DAILY_NEEDS = 'Daily Needs',
  MEDICAL = 'Medical',
  TRANSPORT = 'Transport'
}

export enum SignalType {
  STUDENT_FAVORITE = 'Student Favorite',
  HALAL_FRIENDLY = 'Halal Friendly',
  SPICE_LEVEL_HIGH = 'Spice Friendly',
  QUIET_STUDY = 'Quiet Study',
  SOFT_WARNING = 'Reported Experience'
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  lat: number;
  lng: number;
  tags: string[];
  signals: SignalType[];
  universityVerified: boolean;
  address: string;
}

export interface OnboardingStep {
  id: string;
  period: 'Day 1-3' | 'Week 1' | 'Weeks 2-4';
  title: string;
  content: string[];
  tasks: { text: string; completed: boolean }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  yearOfStudy: string;
  bio: string;
  role: 'student' | 'senior' | 'admin';
}
