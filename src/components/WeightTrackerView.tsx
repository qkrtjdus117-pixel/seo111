import React, { useState } from 'react';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { WeightRecord, UserProfile } from '../types/diet';
import { calculateBMI, getTodayDateString } from '../utils/calculator';

interface WeightTrackerViewProps {
  profile: UserProfile;
  weightRecords: WeightRecord[];
  onAddRecord: (record: Omit<WeightRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  profile,
  weightRecords,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [newDate, setNewDate] = useState<string>(getTodayDateString());
  const [newWeight, setNewWeight] = useState<number | ''>('');
  const [newBodyFat, setNewBodyFat] = useState<number | ''>('');
  const [newMuscle, setNewMuscle] = useState<number | ''>('');
  const [newNote, setNewNote] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<WeightRecord | null>(null);

  // Sorted records
  const sortedRecords = [...weightRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : null;
  const currentWeight = latest ? latest.weight : profile.weight;
  const totalChange = Number((currentWeight - profile.startWeight).toFixed(1));
  const remainingToGoal = Number((currentWeight - profile.targetWeight).toFixed(1));

  // Goal Progress Percentage
  const totalNeedToLose = profile.startWeight - profile.targetWeight;
  const lostSoFar = profile.startWeight - currentWeight;
  const goalProgress = totalNeedToLose > 0 ? Math.min(100, Math.max(0, Math.round((lostSoFar / totalNeedToLose) * 100))) : 100;

  const bmiInfo = calculateBMI(currentWeight, profile.height);

  // Filter for chart
  const filteredRecords = React.useMemo(() => {
    if (timeRange === '7d') return sortedRecords.slice(-7);
    if (timeRange === '30d') return sortedRecords.slice(-30);
    return sortedRecords;
  }, [sortedRecords, timeRange]);

  // Handle Form Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight === '' || Number(newWeight) <= 0) return;

    onAddRecord({
      date: newDate,
      weight: Number(newWeight),
      bodyFatPercent: newBodyFat !== '' ? Number(newBodyFat) : undefined,
      skeletalMuscleKg: newMuscle !== '' ? Number(newMuscle) : undefined,
      note: newNote.trim() || undefined,
    });

    setNewWeight('');
    setNewBodyFat('');
    setNewMuscle('');
    setNewNote('');
  };

  // SVG Chart math
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const weights = filteredRecords.map((r) => r.weight);
  const minW = Math.min(profile.targetWeight - 1, ...weights) - 1;
  const maxW = Math.max(profile.startWeight + 1, ...weights) + 1;

  const getX = (index: number) => {
    if (filteredRecords.length <= 1) return chartWidth / 2;
    return paddingX + (index / (filteredRecords.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxW - minW || 1;
    return chartHeight - paddingY - ((val - minW) / range) * (chartHeight - paddingY * 2);
  };

  const pointsString = filteredRecords
    .map((r, i) => `${getX(i)},${getY(r.weight)}`)
    .join(' ');

  const targetLineY = getY(profile.targetWeight);

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 py-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          체중 & 신체 변화 분석
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          체중 감량 추이와 골격근량, 체지방률 변화를 한눈에 모니터링합니다.
        </p>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Weight */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">현재 체중</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums font-mono">
              {currentWeight}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>시작 {profile.startWeight}kg</span>
            <span aria-hidden="true">·</span>
            <span>{bmiInfo.status}</span>
          </div>
        </div>

        {/* Total Lost */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">총 변화량</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tabular-nums font-mono ${
                totalChange < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {totalChange > 0 ? `+${totalChange}` : `${totalChange}`}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>건강한 감량 페이스 유지 중</span>
          </p>
        </div>

        {/* Goal Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">목표 달성률</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
              {goalProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Remaining to Goal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">목표까지 남은 체중</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums font-mono">
              {remainingToGoal > 0 ? remainingToGoal : 0}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            최종 목표 <strong className="text-slate-700 dark:text-slate-300 font-semibold">{profile.targetWeight}kg</strong>
          </p>
        </div>
      </div>

      {/* Interactive Weight SVG Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">체중 변화 트렌드</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>체중 (kg)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 border-b-2 border-dashed border-rose-400 inline-block" />
                <span>목표 체중 ({profile.targetWeight}kg)</span>
              </span>
            </div>
          </div>

          {/* Time Range Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
            {[
              { id: '7d', label: '최근 7일' },
              { id: '30d', label: '최근 30일' },
              { id: 'all', label: '전체' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hovered Tooltip Bar */}
        <div className="h-6 flex items-center">
          {hoveredPoint ? (
            <div className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span className="font-semibold">{hoveredPoint.date}</span>
              <span>·</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{hoveredPoint.weight} kg</span>
              {hoveredPoint.bodyFatPercent && (
                <>
                  <span>·</span>
                  <span>체지방 {hoveredPoint.bodyFatPercent}%</span>
                </>
              )}
              {hoveredPoint.note && (
                <>
                  <span>·</span>
                  <span className="text-slate-500 italic">"{hoveredPoint.note}"</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">그래프의 각 측정 포인트를 마우스로 올려보세요</span>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="w-full overflow-x-auto">
          <svg
            className="w-full h-56 min-w-[500px]"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={chartWidth - paddingX}
              y2={paddingY}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={chartHeight / 2}
              x2={chartWidth - paddingX}
              y2={chartHeight / 2}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Target Weight Dashed Line */}
            {targetLineY >= paddingY && targetLineY <= chartHeight - paddingY && (
              <line
                x1={paddingX}
                y1={targetLineY}
                x2={chartWidth - paddingX}
                y2={targetLineY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
            )}

            {/* Area Fill */}
            {filteredRecords.length > 1 && (
              <polygon
                points={`${paddingX},${chartHeight - paddingY} ${pointsString} ${
                  chartWidth - paddingX
                },${chartHeight - paddingY}`}
                className="fill-emerald-500/10 dark:fill-emerald-500/5"
              />
            )}

            {/* Connecting Polyline */}
            {filteredRecords.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            )}

            {/* Interactive Data Dots */}
            {filteredRecords.map((r, i) => {
              const x = getX(i);
              const y = getY(r.weight);
              const isHovered = hoveredPoint?.id === r.id;

              return (
                <g key={r.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    className="fill-white dark:fill-slate-900 stroke-emerald-500 transition-all cursor-pointer"
                    strokeWidth={isHovered ? 3 : 2}
                    onMouseEnter={() => setHoveredPoint(r)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Date label underneath */}
                  <text
                    x={x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                  >
                    {r.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2-Column Split: Log New Weight (Left) + History List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Log Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">새 체중 기록</h3>
              <p className="text-xs text-slate-500">매일 아침 공복 체중 기록을 권장합니다</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                측정 날짜
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                체중 (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="예: 61.2"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-mono font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  체지방률 (%) <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="70"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="예: 26.5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  골격근량 (kg) <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="100"
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="예: 22.8"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                기록 메모 (선택)
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="예: 어제 야식 안 먹고 아침 가뿐함"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={newWeight === ''}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>체중 기록 추가하기</span>
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
            기록 히스토리 ({sortedRecords.length}회)
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
            {[...sortedRecords].reverse().map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rec.date}</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {rec.weight} kg
                    </span>
                  </div>

                  {/* Clean unboxed stats */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    {rec.bodyFatPercent && <span>체지방 {rec.bodyFatPercent}%</span>}
                    {rec.bodyFatPercent && rec.skeletalMuscleKg && <span aria-hidden="true">·</span>}
                    {rec.skeletalMuscleKg && <span>골격근 {rec.skeletalMuscleKg}kg</span>}
                    {rec.note && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600 dark:text-slate-400 italic truncate max-w-xs">
                          {rec.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRecord(rec.id)}
                  aria-label="기록 삭제"
                  className="w-7 h-7 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center shrink-0 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
