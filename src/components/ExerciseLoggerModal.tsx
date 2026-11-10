import React, { useState } from 'react';
import { X, Dumbbell, Flame, Check, Clock } from 'lucide-react';
import { ExerciseItem } from '../types/diet';
import { quickExercisePresets } from '../data/defaultData';

interface ExerciseLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (exercise: Omit<ExerciseItem, 'id'>) => void;
  selectedDate: string;
}

export const ExerciseLoggerModal: React.FC<ExerciseLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveExercise,
  selectedDate,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseItem['category']>('cardio');
  const [durationMin, setDurationMin] = useState<number>(30);
  const [burnedCalories, setBurnedCalories] = useState<number>(200);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState('');

  // Handle Preset Pick
  const handleSelectPreset = (preset: (typeof quickExercisePresets)[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setDurationMin(preset.defaultDuration);
    setBurnedCalories(Math.round(preset.calPerMin * preset.defaultDuration));
  };

  // Re-estimate calories when duration changes
  const handleDurationChange = (minutes: number) => {
    setDurationMin(minutes);
    const found = quickExercisePresets.find((p) => p.name === name);
    if (found) {
      setBurnedCalories(Math.round(found.calPerMin * minutes));
    } else {
      // General estimate: ~6.5 kcal/min
      setBurnedCalories(Math.round(6.5 * minutes));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !durationMin || !burnedCalories) return;

    onSaveExercise({
      date: selectedDate,
      time,
      name: name.trim(),
      category,
      durationMin: Number(durationMin),
      burnedCalories: Number(burnedCalories),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">운동 기록하기</h2>
              <p className="text-xs text-slate-500">{selectedDate} 활동 및 소모 칼로리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              자주 하는 운동 퀵 선택
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickExercisePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    name === preset.name
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              운동 명칭 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 웨이트 트레이닝, 러닝, 필라테스 등"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                운동 시간 (분) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={durationMin}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">분</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                소모 칼로리 (kcal) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={burnedCalories}
                  onChange={(e) => setBurnedCalories(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 font-bold text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseItem['category'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="cardio">유산소 운동</option>
                <option value="strength">근력 / 웨이트</option>
                <option value="flexibility">필라테스 / 요가</option>
                <option value="sports">스포츠 / 구기종목</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                기록 시간
              </label>
              <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 bg-white dark:bg-slate-950">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              운동 메모 (선택)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 하체 스쿼트 5세트, 인터벌 런닝 머신 5km 완료"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>운동 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
