import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  RefreshCw,
  BookOpen,
  ArrowRight,
  User,
  Bot,
  Zap,
} from 'lucide-react';
import { UserProfile, ChatMessage, GeneratedPlan } from '../types/diet';
import { calculateBMR, calculateTDEE } from '../utils/calculator';

interface AICoachViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isSendingMessage: boolean;
  savedPlan: GeneratedPlan | null;
  onSavePlan: (plan: GeneratedPlan) => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  profile,
  onUpdateProfile,
  chatHistory,
  onSendMessage,
  isSendingMessage,
  savedPlan,
  onSavePlan,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Quick Chat Starters
  const quickQuestions = [
    '오늘 저녁 회식인데 삼겹살 먹을 때 팁 알려줘',
    '다이어트 3주차인데 체중이 멈췄어요. 정체기 극복법은?',
    '운동 직후에 단백질 쉐이크 말고 어떤 걸 먹어야 할까요?',
    '밤 11시에 야식이 너무 당길 때 대처법 알려줘',
  ];

  // Generate Personalized Plan via Gemini 3.8 Flash
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const response = await fetch('/api/diet/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: profile.gender,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          targetWeight: profile.targetWeight,
          activityLevel: profile.activityLevel,
          dietGoal: profile.dietGoal,
          preference: profile.preference,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || '플랜 생성에 실패했습니다.');
      }

      onSavePlan(data.data);
    } catch (err: any) {
      console.error(err);
      setPlanError(err.message || '다이어트 플랜 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Apply Plan to User Profile Targets
  const handleApplyToProfile = () => {
    if (!savedPlan) return;
    onUpdateProfile({
      targetCalories: savedPlan.recommendedCalories,
      targetCarbs: savedPlan.recommendedCarbs,
      targetProtein: savedPlan.recommendedProtein,
      targetFat: savedPlan.recommendedFat,
      waterGoalMl: savedPlan.waterGoalMl,
    });
    alert('AI 추천 칼로리와 탄·단·지 목표가 내 프로필에 성공적으로 적용되었습니다!');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingMessage) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    onSendMessage(msg);
  };

  const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 py-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>AI 다이어트 코치 &amp; 맞춤 처방</span>
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gemini AI 기반 정밀 대사량 분석, 맞춤형 1일 식단 플랜 및 1:1 실시간 다이어트 고민 상담
        </p>
      </div>

      {/* Top Section: Metabolic Baseline & AI Plan Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* User Metabolic Baseline (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                내 신체 대사량 기준선
              </h2>
              <p className="text-xs text-slate-500">Mifflin-St Jeor 표준 공식 산출</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">기초대사량 (BMR)</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums font-mono mt-0.5">
                {bmr} <span className="text-xs font-normal">kcal</span>
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">유지대사량 (TDEE)</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono mt-0.5">
                {tdee} <span className="text-xs font-normal">kcal</span>
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              💡 건강한 감량 다이어트 원칙:
            </p>
            <p>
              유지 칼로리({tdee}kcal)에서 400~500kcal를 적자로 두는{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">{tdee - 450} kcal</strong>가 근손실
              없이 체지방만 태우는 최적 구간입니다.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI가 맞춤 식단 및 운동 플랜 설계 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 맞춤 1일 식단표 &amp; 영양 처방 생성</span>
              </>
            )}
          </button>

          {planError && (
            <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl">
              {planError}
            </p>
          )}
        </div>

        {/* AI Generated Plan Display (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  AI 추천 맞춤 식단 플랜
                </h2>
                <p className="text-xs text-slate-500">
                  {savedPlan ? '내 체형에 맞춰 분석된 1일 플랜' : '아직 생성된 플랜이 없습니다'}
                </p>
              </div>
            </div>

            {savedPlan && (
              <button
                onClick={handleApplyToProfile}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>내 목표로 적용</span>
              </button>
            )}
          </div>

          {!savedPlan ? (
            <div className="py-12 text-center text-xs text-slate-400">
              왼쪽의 <strong className="text-slate-700 dark:text-slate-300">"AI 맞춤 1일 식단표 생성"</strong>{' '}
              버튼을 누르면,
              <br />
              현재 키({profile.height}cm)와 체중({profile.weight}kg)에 최적화된 하루 4끼 식단표가
              자동 생성됩니다.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Macro Prescription */}
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500">권장 칼로리</span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {savedPlan.recommendedCalories} kcal
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">탄수화물</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {savedPlan.recommendedCarbs}g
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">단백질</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {savedPlan.recommendedProtein}g
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">지방</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {savedPlan.recommendedFat}g
                  </p>
                </div>
              </div>

              {/* 4 Meals Recommended */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-[10px] font-bold text-emerald-600">아침 식단</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {savedPlan.mealPlan.breakfast}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-[10px] font-bold text-emerald-600">점심 식단</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {savedPlan.mealPlan.lunch}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-[10px] font-bold text-emerald-600">저녁 식단</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {savedPlan.mealPlan.dinner}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-[10px] font-bold text-emerald-600">추천 간식</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {savedPlan.mealPlan.snack}
                  </p>
                </div>
              </div>

              {/* Tips */}
              {savedPlan.coachAdvice?.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    코치 성공 팁:
                  </span>
                  {savedPlan.coachAdvice.map((tip, idx) => (
                    <p key={idx}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: 1:1 AI Nutritionist Chat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              1:1 실시간 AI 다이어트 상담
            </h2>
            <p className="text-xs text-slate-500">식단, 외식 메뉴, 영양소, 운동 등 무엇이든 질문하세요</p>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => onSendMessage(q)}
              disabled={isSendingMessage}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-colors text-left"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="space-y-3.5 max-h-96 overflow-y-auto p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-2.5 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {item.sender === 'coach' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{item.text}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    item.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {item.timestamp}
                </span>
              </div>

              {item.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSendingMessage && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>AI 코치가 맞춤 조언을 작성하고 있습니다...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="다이어트 고민이나 외식 메뉴에 대해 물어보세요..."
            disabled={isSendingMessage}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSendingMessage}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>전송</span>
          </button>
        </form>
      </div>
    </div>
  );
};
