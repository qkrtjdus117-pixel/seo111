import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';
import { MealItem, MealType } from '../types/diet';

interface MealListViewProps {
  meals: MealItem[];
  onOpenMealLogger: (mealType?: MealType) => void;
  onDeleteMeal: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const MealListView: React.FC<MealListViewProps> = ({
  meals,
  onOpenMealLogger,
  onDeleteMeal,
  selectedDate,
  setSelectedDate,
}) => {
  const [filterType, setFilterType] = useState<MealType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');

  const filteredMeals = meals.filter((meal) => {
    if (dateFilter === 'today' && meal.date !== selectedDate) return false;
    if (filterType !== 'all' && meal.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = meal.name.toLowerCase().includes(q);
      const matchFeedback = meal.feedback?.toLowerCase().includes(q);
      const matchTags = meal.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchFeedback && !matchTags) return false;
    }
    return true;
  });

  const totalCalories = filteredMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalCarbs = filteredMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalProtein = filteredMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalFat = filteredMeals.reduce((acc, m) => acc + m.fat, 0);

  const getMealTypeName = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return '아침';
      case 'lunch':
        return '점심';
      case 'dinner':
        return '저녁';
      case 'snack':
        return '간식';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            식단 분석 및 기록 보관함
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            기록된 모든 식단의 영양 성분, 칼로리, AI 피드백을 조회하고 관리합니다.
          </p>
        </div>

        <button
          onClick={() => onOpenMealLogger()}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 식단 추가</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="음식 이름, 피드백 키워드, 태그 검색..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date Scope Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dateFilter === 'today'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              선택일 ({selectedDate})
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dateFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              전체 기간
            </button>
          </div>
        </div>

        {/* Meal Type Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: 'all', label: '전체 식사' },
            { id: 'breakfast', label: '아침' },
            { id: 'lunch', label: '점심' },
            { id: 'dinner', label: '저녁' },
            { id: 'snack', label: '간식' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm text-center">
        <div>
          <span className="text-xs text-slate-500">필터 총 칼로리</span>
          <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums font-mono mt-0.5">
            {totalCalories.toLocaleString()} <span className="text-xs font-normal">kcal</span>
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">탄수화물 합계</span>
          <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 tabular-nums font-mono mt-0.5">
            {totalCarbs} <span className="text-xs font-normal">g</span>
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">단백질 합계</span>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono mt-0.5">
            {totalProtein} <span className="text-xs font-normal">g</span>
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">지방 합계</span>
          <p className="text-base font-extrabold text-sky-600 dark:text-sky-400 tabular-nums font-mono mt-0.5">
            {totalFat} <span className="text-xs font-normal">g</span>
          </p>
        </div>
      </div>

      {/* Meal Items List */}
      <div className="space-y-3">
        {filteredMeals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-xs text-slate-400">
            조건에 맞는 식단 기록이 없습니다.
            <button
              onClick={() => onOpenMealLogger()}
              className="block mx-auto mt-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              + 식단 기록 추가하기
            </button>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {meal.photoUrl ? (
                  <img
                    src={meal.photoUrl}
                    alt={meal.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      [{getMealTypeName(meal.type)}]
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {meal.name}
                    </h3>
                    {meal.isAI && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> AI분석
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {meal.calories} kcal
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>탄수화물 {meal.carbs}g</span>
                    <span aria-hidden="true">·</span>
                    <span>단백질 {meal.protein}g</span>
                    <span aria-hidden="true">·</span>
                    <span>지방 {meal.fat}g</span>
                    <span aria-hidden="true">·</span>
                    <span>{meal.date} {meal.time}</span>
                  </div>

                  {meal.feedback && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                      💡 {meal.feedback}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                {meal.healthScore && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">건강점수</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {meal.healthScore}/10
                    </p>
                  </div>
                )}
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  aria-label="식단 삭제"
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
