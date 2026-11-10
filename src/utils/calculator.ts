import { UserProfile, ActivityLevel, DietGoal } from '../types/diet';

export function calculateBMR(gender: 'male' | 'female', weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'very_active':
      return 1.9;
    default:
      return 1.375;
  }
}

export function calculateTDEE(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * getActivityMultiplier(level));
}

export function calculateTargetCalories(tdee: number, goal: DietGoal): number {
  switch (goal) {
    case 'loss':
      return Math.max(1200, Math.round(tdee - 450));
    case 'muscle':
      return Math.round(tdee + 300);
    case 'maintain':
    default:
      return tdee;
  }
}

export function calculateMacros(calories: number, goal: DietGoal) {
  let carbRatio = 0.5;
  let proteinRatio = 0.25;
  let fatRatio = 0.25;

  if (goal === 'loss') {
    // 40% carb, 35% protein, 25% fat
    carbRatio = 0.4;
    proteinRatio = 0.35;
    fatRatio = 0.25;
  } else if (goal === 'muscle') {
    // 45% carb, 35% protein, 20% fat
    carbRatio = 0.45;
    proteinRatio = 0.35;
    fatRatio = 0.2;
  }

  const carbsG = Math.round((calories * carbRatio) / 4);
  const proteinG = Math.round((calories * proteinRatio) / 4);
  const fatG = Math.round((calories * fatRatio) / 9);

  return { carbsG, proteinG, fatG };
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; status: string; color: string } {
  if (!heightCm || heightCm <= 0) return { bmi: 0, status: '측정 불가', color: 'text-slate-500' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, status: '저체중', color: 'text-amber-500' };
  } else if (bmi < 23) {
    return { bmi, status: '정상 체중', color: 'text-emerald-500' };
  } else if (bmi < 25) {
    return { bmi, status: '과체중', color: 'text-amber-500' };
  } else if (bmi < 30) {
    return { bmi, status: '비만 (1단계)', color: 'text-rose-500' };
  } else {
    return { bmi, status: '고도 비만', color: 'text-rose-600' };
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}
