import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  ListPlus,
  Edit3,
} from 'lucide-react';
import { MealItem, MealType } from '../types/diet';
import { quickFoodPresets, QuickFoodPreset } from '../data/defaultData';

interface MealLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: Omit<MealItem, 'id'>) => void;
  selectedDate: string;
  initialMealType?: MealType;
}

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  selectedDate,
  initialMealType = 'lunch',
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'ai' | 'quick' | 'manual'>('ai');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );

  // AI Mode States
  const [promptText, setPromptText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<any | null>(null);

  // Manual & Edit Form States
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [healthScore, setHealthScore] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImageBase64(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini AI Analysis
  const handleAnalyzeWithAI = async () => {
    if (!promptText && !selectedImageBase64) {
      setAiError('식단 설명 텍스트 또는 음식 사진을 등록해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/diet/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: promptText,
          imageBase64: selectedImageBase64,
          mealType:
            mealType === 'breakfast'
              ? '아침'
              : mealType === 'lunch'
              ? '점심'
              : mealType === 'dinner'
              ? '저녁'
              : '간식',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '식단 분석에 실패했습니다.');
      }

      const res = data.data;
      setAnalyzedResult(res);
      setFoodName(res.foodName || '');
      setCalories(res.calories || 0);
      setCarbs(res.carbs || 0);
      setProtein(res.protein || 0);
      setFat(res.fat || 0);
      setFeedback(res.feedback || '');
      setHealthScore(res.healthScore || 8);
      setTags(res.tags || ['클린식단']);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI 식단 분석 중 문제가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Preset Selection
  const handleSelectPreset = (preset: QuickFoodPreset) => {
    setFoodName(preset.name);
    setCalories(preset.calories);
    setCarbs(preset.carbs);
    setProtein(preset.protein);
    setFat(preset.fat);
    setTags([preset.category]);
    setFeedback(`${preset.portion} 기준 영양성분입니다.`);
    setActiveMode('manual');
  };

  // Submit Final Meal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || calories === '') {
      return;
    }

    onSaveMeal({
      date: selectedDate,
      time,
      type: mealType,
      name: foodName.trim(),
      calories: Number(calories),
      carbs: Number(carbs || 0),
      protein: Number(protein || 0),
      fat: Number(fat || 0),
      feedback: feedback.trim() || undefined,
      healthScore,
      tags: tags.length > 0 ? tags : undefined,
      photoUrl: imagePreview || undefined,
      isAI: activeMode === 'ai' && !!analyzedResult,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">식단 기록하기</h2>
            <p className="text-xs text-slate-500">{selectedDate} 식사 기록</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type & Time Selector */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Meal Type Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {[
                { id: 'breakfast', label: '아침' },
                { id: 'lunch', label: '점심' },
                { id: 'dinner', label: '저녁' },
                { id: 'snack', label: '간식' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMealType(tab.id as MealType)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    mealType === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Picker */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 mt-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveMode('ai')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                activeMode === 'ai'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 스마트 분석</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('quick')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                activeMode === 'quick'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>자주 먹는 식단 퀵선택</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('manual')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                activeMode === 'manual'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>직접 입력</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* 1. AI MODE */}
          {activeMode === 'ai' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Gemini AI가 음식 사진과 설명을 실시간 분석합니다</span>
                </div>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  사진을 업로드하거나 "닭가슴살 샐러드에 발사믹 소스, 현미밥 반공기"처럼 자연어로 입력해보세요!
                </p>
              </div>

              {/* Photo Input Area */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  음식 사진 등록 (선택)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{imagePreview ? '사진 변경하기' : '사진 선택 / 촬영'}</span>
                  </button>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageBase64(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Prompt Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  식단 설명 입력
                </label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="예: 닭가슴살 볶음밥 200g, 반숙 달걀 1개, 김치 약간, 아몬드 브리즈 1팩"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* AI Trigger Button */}
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing || (!promptText && !selectedImageBase64)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>영양소 및 칼로리 정밀 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 영양 분석 시작하기</span>
                  </>
                )}
              </button>

              {aiError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Analysis Result Preview */}
              {analyzedResult && (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">분석된 식단명</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {analyzedResult.foodName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">추정 칼로리</span>
                      <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {analyzedResult.calories} kcal
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[11px] text-slate-500">탄수화물</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {analyzedResult.carbs}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">단백질</span>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {analyzedResult.protein}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">지방</span>
                      <p className="text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                        {analyzedResult.fat}g
                      </p>
                    </div>
                  </div>

                  {analyzedResult.feedback && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      💡 {analyzedResult.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. QUICK PRESET MODE */}
          {activeMode === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                한국 다이어터들이 가장 많이 먹는 인기 클린 식단을 바로 선택하세요.
              </p>
              <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {quickFoodPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {preset.category}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {preset.calories} kcal
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-emerald-600 transition-colors">
                      {preset.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {preset.portion} · 단 {preset.protein}g
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. FINAL DETAILS FORM (Shared & for Manual) */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                식단/음식 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="예: 수비드 닭가슴살 샐러드"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  칼로리 (kcal) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  탄수화물 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  단백질 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  지방 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                코멘트 / 다이어트 메모 (선택)
              </label>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="식사 후 포만감이나 소감 메모"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!foodName.trim() || calories === ''}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>식단 저장하기</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
