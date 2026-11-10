import {
  UserProfile,
  MealItem,
  ExerciseItem,
  WeightRecord,
  FastingSession,
  ChatMessage,
  GeneratedPlan,
} from '../types/diet';
import {
  defaultUserProfile,
  defaultMeals,
  defaultExercises,
  defaultWeightRecords,
  initialFastingSession,
} from '../data/defaultData';

const KEYS = {
  PROFILE: 'slimlog_profile',
  MEALS: 'slimlog_meals',
  EXERCISES: 'slimlog_exercises',
  WEIGHT: 'slimlog_weight',
  WATER: 'slimlog_water',
  FASTING: 'slimlog_fasting',
  CHAT: 'slimlog_chat',
  SAVED_PLAN: 'slimlog_saved_plan',
  THEME: 'slimlog_theme',
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load profile from localStorage', e);
  }
  return defaultUserProfile;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function loadMeals(): MealItem[] {
  try {
    const raw = localStorage.getItem(KEYS.MEALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load meals from localStorage', e);
  }
  return defaultMeals;
}

export function saveMeals(meals: MealItem[]): void {
  localStorage.setItem(KEYS.MEALS, JSON.stringify(meals));
}

export function loadExercises(): ExerciseItem[] {
  try {
    const raw = localStorage.getItem(KEYS.EXERCISES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load exercises from localStorage', e);
  }
  return defaultExercises;
}

export function saveExercises(exercises: ExerciseItem[]): void {
  localStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
}

export function loadWeightRecords(): WeightRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.WEIGHT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load weight records from localStorage', e);
  }
  return defaultWeightRecords;
}

export function saveWeightRecords(records: WeightRecord[]): void {
  localStorage.setItem(KEYS.WEIGHT, JSON.stringify(records));
}

export function loadWater(date: string): number {
  try {
    const raw = localStorage.getItem(`${KEYS.WATER}_${date}`);
    if (raw) return Number(raw);
  } catch (e) {
    console.warn('Failed to load water from localStorage', e);
  }
  return 1250; // default initial for today
}

export function saveWater(date: string, amountMl: number): void {
  localStorage.setItem(`${KEYS.WATER}_${date}`, String(amountMl));
}

export function loadFastingSession(): FastingSession {
  try {
    const raw = localStorage.getItem(KEYS.FASTING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load fasting session', e);
  }
  return initialFastingSession;
}

export function saveFastingSession(session: FastingSession): void {
  localStorage.setItem(KEYS.FASTING, JSON.stringify(session));
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.CHAT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load chat history', e);
  }
  return [
    {
      id: 'c-welcome',
      sender: 'coach',
      text: '반가워요! 당신의 스마트 다이어트 파트너 슬림로그 AI 코치입니다. 오늘 식단이나 운동, 정체기 고민, 혹은 외식 메뉴 추천 등 무엇이든 편하게 물어보세요!',
      timestamp: '방금 전',
    },
  ];
}

export function saveChatHistory(history: ChatMessage[]): void {
  localStorage.setItem(KEYS.CHAT, JSON.stringify(history));
}

export function loadSavedPlan(): GeneratedPlan | null {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load saved plan', e);
  }
  return null;
}

export function saveSavedPlan(plan: GeneratedPlan): void {
  localStorage.setItem(KEYS.SAVED_PLAN, JSON.stringify(plan));
}
