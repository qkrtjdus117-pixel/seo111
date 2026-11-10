import { UserProfile, MealItem, ExerciseItem, WeightRecord, FastingSession } from '../types/diet';
import { getTodayDateString } from '../utils/calculator';

const today = getTodayDateString();

// Get date string with day offset
export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const defaultUserProfile: UserProfile = {
  name: '지우',
  gender: 'female',
  age: 28,
  height: 165,
  weight: 61.2,
  startWeight: 65.0,
  targetWeight: 54.0,
  activityLevel: 'moderate',
  dietGoal: 'loss',
  preference: 'balanced',
  targetCalories: 1550,
  targetCarbs: 155, // 40%
  targetProtein: 135, // 35%
  targetFat: 43, // 25%
  waterGoalMl: 2000,
  fastingPlan: '16:8',
};

export const defaultMeals: MealItem[] = [
  {
    id: 'm-1',
    date: today,
    time: '08:30',
    type: 'breakfast',
    name: '그릭 요거트 & 블루베리 & 아몬드',
    calories: 220,
    carbs: 18,
    protein: 14,
    fat: 9,
    sodium: 45,
    sugar: 11,
    healthScore: 9,
    feedback: '장 건강에 유익한 유산균과 항산화 베리, 건강한 불포화지방산이 조화로운 아침입니다.',
    tags: ['고단백', '클린식단', '저당'],
    isAI: false,
  },
  {
    id: 'm-2',
    date: today,
    time: '12:45',
    type: 'lunch',
    name: '그릴드 닭가슴살 샐러드 & 현미밥 1/2공기',
    calories: 430,
    carbs: 42,
    protein: 38,
    fat: 11,
    sodium: 380,
    sugar: 4,
    healthScore: 10,
    feedback: '복합 탄수화물과 순수 단백질의 이상적인 구성입니다. 포만감이 길게 지속될 거예요.',
    tags: ['고단백', '식이섬유풍부', '황금비율'],
    photoUrl: '/src/assets/images/diet_hero_bowl_1794349920468.jpg',
    isAI: true,
  },
];

export const defaultExercises: ExerciseItem[] = [
  {
    id: 'e-1',
    date: today,
    time: '07:30',
    name: '모닝 공복 인터벌 러닝',
    category: 'cardio',
    durationMin: 35,
    burnedCalories: 260,
    notes: '페이스 6:00/km, 가벼운 땀과 함께 상쾌한 하루 시작',
  },
];

export const defaultWeightRecords: WeightRecord[] = [
  { id: 'w-1', date: getDateOffset(-14), weight: 63.8, bodyFatPercent: 28.5, skeletalMuscleKg: 22.1, note: '다이어트 3주차 기록' },
  { id: 'w-2', date: getDateOffset(-10), weight: 63.2, bodyFatPercent: 28.1, skeletalMuscleKg: 22.3 },
  { id: 'w-3', date: getDateOffset(-7), weight: 62.6, bodyFatPercent: 27.6, skeletalMuscleKg: 22.4, note: '주말 식단 유지 성공' },
  { id: 'w-4', date: getDateOffset(-4), weight: 62.0, bodyFatPercent: 27.2, skeletalMuscleKg: 22.5 },
  { id: 'w-5', date: getDateOffset(-2), weight: 61.6, bodyFatPercent: 26.9, skeletalMuscleKg: 22.6 },
  { id: 'w-6', date: getDateOffset(-1), weight: 61.4, bodyFatPercent: 26.8, skeletalMuscleKg: 22.7 },
  { id: 'w-7', date: today, weight: 61.2, bodyFatPercent: 26.6, skeletalMuscleKg: 22.8, note: '목표 54kg까지 앞으로 7.2kg!' },
];

export const initialFastingSession: FastingSession = {
  isActive: true,
  // Started 7.5 hours ago
  startTime: new Date(Date.now() - 7.5 * 3600 * 1000).toISOString(),
  targetHours: 16,
  plan: '16:8',
};

export interface QuickFoodPreset {
  name: string;
  category: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  portion: string;
}

export const quickFoodPresets: QuickFoodPreset[] = [
  { name: '수비드 닭가슴살', category: '단백질', calories: 120, carbs: 1, protein: 26, fat: 1.5, portion: '1팩 (100g)' },
  { name: '현미밥', category: '탄수화물', calories: 195, carbs: 42, protein: 4, fat: 1.2, portion: '1공기 (130g)' },
  { name: '찐 고구마', category: '탄수화물', calories: 190, carbs: 45, protein: 2, fat: 0.4, portion: '1개 (150g)' },
  { name: '삶은 달걀', category: '단백질', calories: 140, carbs: 1, protein: 12, fat: 10, portion: '2개' },
  { name: '그릭 요거트 플레인', category: '유제품/간식', calories: 95, carbs: 4, protein: 11, fat: 3.5, portion: '100g' },
  { name: '단호박 샐러드 보울', category: '샐러드', calories: 280, carbs: 36, protein: 9, fat: 12, portion: '1그릇' },
  { name: '서브웨이 로티세리 치킨 15cm', category: '외식/간편', calories: 350, carbs: 40, protein: 29, fat: 6, portion: '1개' },
  { name: '바나나', category: '과일/간식', calories: 105, carbs: 27, protein: 1.3, fat: 0.3, portion: '1개 (중간)' },
  { name: '소고기 우둔살/홍두깨', category: '단백질', calories: 160, carbs: 0, protein: 31, fat: 3.2, portion: '100g' },
  { name: '단백질 쉐이크 (WPI)', category: '보충제', calories: 140, carbs: 4, protein: 25, fat: 1.5, portion: '1스쿱 (물 혼합)' },
  { name: '방울토마토', category: '채소/간식', calories: 35, carbs: 7, protein: 1.5, fat: 0.2, portion: '10알 (150g)' },
  { name: '아메리카노 (ICED)', category: '음료', calories: 10, carbs: 1, protein: 0.5, fat: 0.1, portion: '1잔 (Tall)' },
];

export const quickExercisePresets = [
  { name: '웨이트 트레이닝 (전신)', category: 'strength' as const, calPerMin: 6.5, defaultDuration: 50 },
  { name: '유산소 트레드밀/러닝', category: 'cardio' as const, calPerMin: 8.5, defaultDuration: 30 },
  { name: '실내 사이클', category: 'cardio' as const, calPerMin: 7.0, defaultDuration: 40 },
  { name: '천국의 계단 (스텝밀)', category: 'cardio' as const, calPerMin: 10.0, defaultDuration: 25 },
  { name: '필라테스 / 요가', category: 'flexibility' as const, calPerMin: 4.5, defaultDuration: 50 },
  { name: '동네 산책 / 만보 걷기', category: 'cardio' as const, calPerMin: 3.8, defaultDuration: 45 },
  { name: '수영 (자유형/평영)', category: 'sports' as const, calPerMin: 9.0, defaultDuration: 40 },
];
