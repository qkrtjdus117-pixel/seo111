import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FastingSession } from '../types/diet';

interface FastingTimerViewProps {
  fasting: FastingSession;
  onUpdateFasting: (session: FastingSession) => void;
}

export const FastingTimerView: React.FC<FastingTimerViewProps> = ({
  fasting,
  onUpdateFasting,
}) => {
  const [now, setNow] = useState(Date.now());

  // Interval timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute elapsed seconds
  const elapsedSeconds = fasting.isActive && fasting.startTime
    ? Math.max(0, Math.floor((now - new Date(fasting.startTime).getTime()) / 1000))
    : 0;

  const targetSeconds = fasting.targetHours * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const remHours = Math.floor(remainingSeconds / 3600);
  const remMinutes = Math.floor((remainingSeconds % 3600) / 60);

  const isCompleted = fasting.isActive && elapsedSeconds >= targetSeconds;

  // Plan select
  const plans: { id: FastingSession['plan']; target: number; label: string; desc: string }[] = [
    { id: '14:10', target: 14, label: '14:10 입문형', desc: '초보자에게 추천하는 편안한 단식' },
    { id: '16:8', target: 16, label: '16:8 표준형 (추천)', desc: '지방 연소와 지속 가능성의 황금비율' },
    { id: '18:6', target: 18, label: '18:6 심화형', desc: '빠른 체지방 감량을 위한 집중 단식' },
    { id: '20:4', target: 20, label: '20:4 워리어', desc: '자가포식 극대화 강력 루틴' },
  ];

  const handleStartFasting = (planId = fasting.plan, targetH = fasting.targetHours) => {
    onUpdateFasting({
      isActive: true,
      startTime: new Date().toISOString(),
      targetHours: targetH,
      plan: planId,
    });
  };

  const handleEndFasting = () => {
    if (isCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }

    onUpdateFasting({
      ...fasting,
      isActive: false,
      startTime: null,
    });
  };

  const handleSwitchPlan = (p: (typeof plans)[0]) => {
    onUpdateFasting({
      ...fasting,
      plan: p.id,
      targetHours: p.target,
    });
  };

  // Metabolic stage detection based on elapsed hours
  const stages = [
    {
      minH: 0,
      maxH: 4,
      title: '0~4시간: 소화 및 혈당 안정',
      desc: '섭취한 음식물이 소화되고 혈당과 인슐린이 서서히 정상화되는 단계입니다.',
    },
    {
      minH: 4,
      maxH: 8,
      title: '4~8시간: 인슐린 강하 & 글리코겐 사용',
      desc: '인슐린 분비가 멈추고 간과 근육에 저장된 글리코겐을 에너지원으로 전환합니다.',
    },
    {
      minH: 8,
      maxH: 12,
      title: '8~12시간: 체지방 연소 가속',
      desc: '글리코겐이 고갈되며 저장되어 있던 체지방을 본격적으로 태우기 시작합니다.',
    },
    {
      minH: 12,
      maxH: 16,
      title: '12~16시간: 케토시스(Ketosis) 대사 활성',
      desc: '간에서 케톤체가 생성되어 뇌와 신체에 청정 에너지를 공급하고 체지방이 집중 연소됩니다.',
    },
    {
      minH: 16,
      maxH: 99,
      title: '16시간 이상: 자가포식(Autophagy) 세포 정화',
      desc: '손상된 노폐물 세포를 청소하고 새로운 세포로 재생하는 안티에이징 자가포식이 작동합니다.',
    },
  ];

  const currentStageIndex = stages.findIndex((s) => hours >= s.minH && hours < s.maxH);

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 py-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          간헐적 단식 타이머
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          공복 시간을 스마트하게 기록하고 체지방 연소와 자가포식 대사 단계를 실시간으로 확인하세요.
        </p>
      </div>

      {/* Main Center Clock Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center">
        {/* Plan Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSwitchPlan(p)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                fasting.plan === p.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Circular Clock Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="none"
            />
            {/* Active progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className={`${
                isCompleted ? 'text-emerald-500' : 'text-emerald-500'
              } transition-all duration-700 ease-out`}
              strokeWidth="5"
              strokeDasharray={`${(progressPercent / 100) * 264} 264`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
            />
          </svg>

          {/* Center Digital Clock readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {fasting.isActive ? (isCompleted ? '단식 목표 달성!' : '단식 진행 중') : '단식 대기 중'}
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums mt-1">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
              <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 tabular-nums">
              <span>목표 {fasting.targetHours}시간</span>
              <span aria-hidden="true">·</span>
              <span>달성률 {progressPercent}%</span>
            </div>

            {fasting.isActive && !isCompleted && (
              <p className="text-[11px] text-slate-400 mt-1">
                종료까지 약 {remHours}시간 {remMinutes}분 남음
              </p>
            )}
          </div>
        </div>

        {/* Start / Stop Controls */}
        <div className="flex items-center gap-3 mt-8">
          {!fasting.isActive ? (
            <button
              onClick={() => handleStartFasting()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>단식 시작하기</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleEndFasting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>단식 종료하기</span>
              </button>

              <button
                onClick={() => handleStartFasting(fasting.plan, fasting.targetHours)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 시작</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metabolic Stages Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              과학적 단식 대사 변화 단계
            </h2>
            <p className="text-xs text-slate-500">시간 경과에 따른 신체 내부의 대사 반응</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {stages.map((stage, idx) => {
            const isCurrent = fasting.isActive && idx === currentStageIndex;
            const isPassed = fasting.isActive && hours >= stage.maxH;

            return (
              <div
                key={stage.title}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : isPassed
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
                    : 'border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPassed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                    )}
                    <h3 className={`text-xs font-bold ${isCurrent ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {stage.title}
                    </h3>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                      현재 진행 중
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-6">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fasting Tips & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              단식 중 섭취 가능한 것
            </h3>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
            <li>• 순수한 생수 및 무가당 탄산수 (충분한 수분 필수)</li>
            <li>• 블랙 커피 / 아이스 아메리카노 (설탕, 시럽, 우유 제외)</li>
            <li>• 녹차, 루이보스티, 페퍼민트 등 무카페인/허브차</li>
            <li>• 탈수 방지를 위한 약간의 미네랄 소금물</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              단식을 마칠 때(보식) 팁
            </h3>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
            <li>• 갑작스러운 고탄수화물/당류는 혈당 스파이크를 부릅니다.</li>
            <li>• 삶은 계란, 두부, 샐러드 등 가벼운 단백질/채소로 시작하세요.</li>
            <li>• 식사는 천천히 20분 이상 꼭꼭 씹어 소화 부담을 줄입니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
