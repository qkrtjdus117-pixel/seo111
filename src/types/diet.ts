export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietGoal = 'loss' | 'maintain' | 'muscle';
export type DietPreference = 'balanced' | 'low_carb' | 'high_protein' | 'intermittent';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  weight: number; // kg
  startWeight: number; // kg
  targetWeight: number; // kg
  activityLevel: ActivityLevel;
  dietGoal: DietGoal;
  preference: DietPreference;
  targetCalories: number;
  targetCarbs: number; // g
  targetProtein: number; // g
  targetFat: number; // g
  waterGoalMl: number; // ml
  fastingPlan: '16:8' | '14:10' | '18:6' | '20:4' | 'none';
}

export interface MealItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: MealType;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium?: number;
  sugar?: number;
  healthScore?: number; // 1-10
  feedback?: string;
  tags?: string[];
  photoUrl?: string;
  isAI?: boolean;
}

export interface ExerciseItem {
  id: string;
  date: string;
  time: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports';
  durationMin: number;
  burnedCalories: number;
  notes?: string;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFatPercent?: number;
  skeletalMuscleKg?: number;
  note?: string;
}

export interface FastingSession {
  isActive: boolean;
  startTime: string | null; // ISO string
  targetHours: number;
  plan: '16:8' | '14:10' | '18:6' | '20:4';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface GeneratedPlan {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  recommendedCarbs: number;
  recommendedProtein: number;
  recommendedFat: number;
  waterGoalMl: number;
  expectedDurationWeeks: number;
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  coachAdvice: string[];
}
