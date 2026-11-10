import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Scale,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Award,
  Clock,
  Dumbbell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MealItem, ExerciseItem, WeightRecord, FastingSession } from '../types/diet';
import { calculateBMI } from '../utils/calculator';

interface DashboardViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  profile: UserProfile;
  meals: MealItem[];
  exercises: ExerciseItem[];
  weightRecords: WeightRecord[];
  fasting: FastingSession;
  waterAmount: number;
  onUpdateWater: (amount: number) => void;
  onOpenMealLogger: (mealType?: MealItem['type']) => void;
  onOpenExerciseLogger: () => void;
  onDeleteMeal: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedDate,
  setSelectedDate,
  profile,
  meals,
  exercises,
  weightRecords,
  fasting,
  waterAmount,
  onUpdateWater,
  onOpenMealLogger,
  onOpenExerciseLogger,
  onDeleteMeal,
  onDeleteExercise,
  onNavigateTab,
}) => {
  // Filter items for selected date
  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const dayExercises = exercises.filter((e) => e.date === selectedDate);

  // Totals
  const consumedCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
  const consumedCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const consumedProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
  const consumedFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);
  const burnedCalories = dayExercises.reduce((sum, e) => sum + e.burnedCalories, 0);

  const remainingCalories = profile.targetCalories - consumedCalories + burnedCalories;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / profile.targetCalories) * 100));

  // Current weight stats
  const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : profile.weight;
  const weightLossTotal = Number((profile.startWeight - latestWeight).toFixed(1));
  const remainingToGoal = Number((latestWeight - profile.targetWeight).toFixed(1));
  const bmiInfo = calculateBMI(latestWeight, profile.height);

  // Water goal handler
  const handleAddWater = (delta: number) => {
    const next = Math.max(0, waterAmount + delta);
    onUpdateWater(next);
    if (next >= profile.waterGoalMl && waterAmount < profile.waterGoalMl) {
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Date stepper
  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const isToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    return selectedDate === today;
  };

  const mealSlots: { type: MealItem['type']; label: string; icon: string; targetNote: string }[] = [
    { type: 'breakfast', label: '아침 식단', icon: '🌅', targetNote: '권장 약 350~450 kcal' },
    { type: 'lunch', label: '점심 식단', icon: '☀️', targetNote: '권장 약 500~650 kcal' },
    { type: 'dinner', label: '저녁 식단', icon: '🌙', targetNote: '권장 약 400~500 kcal' },
    { type: 'snack', label: '간식 & 음료', icon: '☕', targetNote: '권장 약 100~200 kcal' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Top Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              오늘의 다이어트 대시보드
            </h1>
            {isToday() && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                오늘
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            목표 체중 {profile.targetWeight}kg를 향해 나아가는 {profile.name}님의 식단 및 영양 리포트
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => changeDate(-1)}
            aria-label="이전 날짜"
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            {selectedDate}
          </span>
          <button
            onClick={() => changeDate(1)}
            aria-label="다음 날짜"
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday() && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
            >
              오늘로
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Row: Calories & Macros & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calorie Gauge Card (6 cols on lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                칼로리 밸런스
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums font-mono">
                  {consumedCalories.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  / {profile.targetCalories.toLocaleString()} kcal
                </span>
              </div>
            </div>

            {/* Circular Ring Gauge */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    consumedCalories > profile.targetCalories
                      ? 'text-rose-500'
                      : caloriePercent >= 90
                      ? 'text-emerald-500'
                      : 'text-emerald-500'
                  } transition-all duration-700 ease-out`}
                  strokeDasharray={`${Math.min(100, caloriePercent)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {caloriePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 py-4 text-center border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">목표 칼로리</span>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                {profile.targetCalories} <span className="text-xs font-normal">kcal</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">운동 소모</span>
              <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                -{burnedCalories} <span className="text-xs font-normal">kcal</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">남은 칼로리</span>
              <p
                className={`text-base font-bold tabular-nums mt-0.5 ${
                  remainingCalories < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {remainingCalories} <span className="text-xs font-normal">kcal</span>
              </p>
            </div>
          </div>

          {/* 3대 영양소 (탄·단·지) Progress Bars */}
          <div className="pt-4 space-y-3">
            {/* Carbohydrates */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">탄수화물 (Carbs)</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">{consumedCarbs}g</strong> /{' '}
                  {profile.targetCarbs}g
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (consumedCarbs / profile.targetCarbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">단백질 (Protein)</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">{consumedProtein}g</strong> /{' '}
                  {profile.targetProtein}g
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (consumedProtein / profile.targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">지방 (Fat)</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">{consumedFat}g</strong> /{' '}
                  {profile.targetFat}g
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (consumedFat / profile.targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Bento Column: Water, Weight, Fasting (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Water Tracker Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">수분 섭취 트래커</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">목표 {profile.waterGoalMl}ml 달성하기</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums font-mono">
                {Math.round((waterAmount / profile.waterGoalMl) * 100)}%
              </span>
            </div>

            {/* Visual Water Fill Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (waterAmount / profile.waterGoalMl) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {waterAmount.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">/ {profile.waterGoalMl.toLocaleString()} ml</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddWater(250)}
                  className="px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-md transition-colors"
                >
                  +250ml 한 잔
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-md transition-colors"
                >
                  +500ml 텀블러
                </button>
              </div>
            </div>
          </div>

          {/* Quick Weight & Goal Milestone Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">체중 현황</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{bmiInfo.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>BMI {bmiInfo.bmi}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('weight')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                상세 분석 &rarr;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div>
                <span className="text-[11px] text-slate-500">현재 체중</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {latestWeight} <span className="text-[10px] font-normal">kg</span>
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">총 감량</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {weightLossTotal > 0 ? `-${weightLossTotal}` : `${weightLossTotal}`} <span className="text-[10px] font-normal">kg</span>
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">목표까지</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {remainingToGoal > 0 ? `${remainingToGoal}` : '0'}{' '}
                  <span className="text-[10px] font-normal">kg</span>
                </p>
              </div>
            </div>
          </div>

          {/* Fasting Mini Banner Card */}
          {fasting.isActive && (
            <div className="bg-slate-900 text-white dark:bg-slate-800/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400">간헐적 단식 진행 중</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {fasting.plan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">지방 연소와 케토시스 단계 활성화 중</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('fasting')}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                타이머 보기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meals of the Day Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              오늘의 식단 타임라인
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>총 {dayMeals.length}회 기록</span>
              <span aria-hidden="true">·</span>
              <span>섭취 칼로리 {consumedCalories} kcal</span>
              <span aria-hidden="true">·</span>
              <span>탄 {consumedCarbs}g</span>
              <span aria-hidden="true">·</span>
              <span>단 {consumedProtein}g</span>
              <span aria-hidden="true">·</span>
              <span>지 {consumedFat}g</span>
            </div>
          </div>

          <button
            onClick={() => onOpenMealLogger()}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>식단 추가</span>
          </button>
        </div>

        {/* 4 Meal Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSlots.map((slot) => {
            const slotMeals = dayMeals.filter((m) => m.type === slot.type);
            const slotCalories = slotMeals.reduce((sum, m) => sum + m.calories, 0);

            return (
              <div
                key={slot.type}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={slot.label}>
                      {slot.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{slot.label}</h3>
                      <span className="text-[11px] text-slate-500">{slot.targetNote}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {slotCalories > 0 && (
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums font-mono">
                        {slotCalories} kcal
                      </span>
                    )}
                    <button
                      onClick={() => onOpenMealLogger(slot.type)}
                      aria-label={`${slot.label} 추가`}
                      className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors"
                      title="기록 추가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slot Meals List */}
                {slotMeals.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    아직 기록된 식단이 없습니다.
                    <button
                      onClick={() => onOpenMealLogger(slot.type)}
                      className="block mx-auto mt-2 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                    >
                      + 기록하기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
                    {slotMeals.map((meal) => (
                      <div key={meal.id} className="py-2.5 first:pt-1 last:pb-0 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {meal.photoUrl && (
                            <img
                              src={meal.photoUrl}
                              alt={meal.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {meal.name}
                              </h4>
                              {meal.isAI && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  <Sparkles className="w-2.5 h-2.5" /> AI분석
                                </span>
                              )}
                            </div>

                            {/* Clean Unboxed Metadata without pills */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{meal.calories} kcal</span>
                              <span aria-hidden="true">·</span>
                              <span>탄 {meal.carbs}g</span>
                              <span aria-hidden="true">·</span>
                              <span>단 {meal.protein}g</span>
                              <span aria-hidden="true">·</span>
                              <span>지 {meal.fat}g</span>
                              {meal.time && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{meal.time}</span>
                                </>
                              )}
                            </div>

                            {meal.feedback && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 italic">
                                "{meal.feedback}"
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          aria-label="식단 삭제"
                          className="w-7 h-7 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Exercises Burned Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">오늘의 운동 및 활동</h3>
              <p className="text-xs text-slate-500">
                총 {dayExercises.length}건 · 소모 {burnedCalories} kcal
              </p>
            </div>
          </div>

          <button
            onClick={onOpenExerciseLogger}
            className="px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>운동 추가</span>
          </button>
        </div>

        {dayExercises.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            오늘 기록된 운동이 없습니다. 가벼운 산책이나 스트레칭도 기록해보세요!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dayExercises.map((ex) => (
              <div key={ex.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ex.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    <span>{ex.durationMin}분</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">-{ex.burnedCalories} kcal 소모</span>
                    {ex.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-xs">{ex.notes}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteExercise(ex.id)}
                  aria-label="운동 기록 삭제"
                  className="w-7 h-7 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
