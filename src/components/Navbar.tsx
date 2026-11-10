import React from 'react';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  LayoutDashboard,
  UtensilsCrossed,
  LineChart,
  Timer,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenProfile: () => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenProfile,
  isDark,
  toggleDark,
}) => {
  const navItems = [
    { id: 'dashboard', label: '오늘의 대시보드', icon: LayoutDashboard },
    { id: 'meals', label: '식단 분석 & 기록', icon: UtensilsCrossed },
    { id: 'weight', label: '체중 & 변화 분석', icon: LineChart },
    { id: 'fasting', label: '간헐적 단식', icon: Timer },
    { id: 'coach', label: 'AI 다이어트 코치', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="group flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                <span className="font-bold text-sm tracking-tight">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                슬림로그
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500 -mb-[2px]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + theme toggle + profile trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleDark}
              aria-label="화면 모드 변경"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenProfile}
              aria-label="사용자 프로필 설정"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="신체 스펙 및 다이어트 목표 설정"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기록하기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Touch spec) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                  {item.label === '오늘의 대시보드'
                    ? '홈'
                    : item.label === '식단 분석 & 기록'
                    ? '식단'
                    : item.label === '체중 & 변화 분석'
                    ? '체중'
                    : item.label === '간헐적 단식'
                    ? '단식'
                    : 'AI코치'}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
