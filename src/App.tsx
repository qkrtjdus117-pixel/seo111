/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MealListView } from './components/MealListView';
import { WeightTrackerView } from './components/WeightTrackerView';
import { FastingTimerView } from './components/FastingTimerView';
import { AICoachView } from './components/AICoachView';
import { MealLoggerModal } from './components/MealLoggerModal';
import { ExerciseLoggerModal } from './components/ExerciseLoggerModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  loadProfile,
  saveProfile,
  loadMeals,
  saveMeals,
  loadExercises,
  saveExercises,
  loadWeightRecords,
  saveWeightRecords,
  loadWater,
  saveWater,
  loadFastingSession,
  saveFastingSession,
  loadChatHistory,
  saveChatHistory,
  loadSavedPlan,
  saveSavedPlan,
} from './utils/storage';
import {
  UserProfile,
  MealItem,
  ExerciseItem,
  WeightRecord,
  FastingSession,
  ChatMessage,
  GeneratedPlan,
  MealType,
} from './types/diet';
import { getTodayDateString } from './utils/calculator';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [meals, setMeals] = useState<MealItem[]>(loadMeals);
  const [exercises, setExercises] = useState<ExerciseItem[]>(loadExercises);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(loadWeightRecords);
  const [fasting, setFasting] = useState<FastingSession>(loadFastingSession);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(loadChatHistory);
  const [savedPlan, setSavedPlan] = useState<GeneratedPlan | null>(loadSavedPlan);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [waterAmount, setWaterAmount] = useState<number>(() => loadWater(getTodayDateString()));

  // Active view tab: 'dashboard' | 'meals' | 'weight' | 'fasting' | 'coach'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal open states
  const [isMealLoggerOpen, setIsMealLoggerOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [isExerciseLoggerOpen, setIsExerciseLoggerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('slimlog_theme') === 'dark';
  });

  // Apply dark mode class on html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('slimlog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('slimlog_theme', 'light');
    }
  }, [isDark]);

  // Sync water for date
  useEffect(() => {
    setWaterAmount(loadWater(selectedDate));
  }, [selectedDate]);

  // Handlers for state updates with storage persistence
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    saveProfile(next);
  };

  const handleSaveMeal = (newMeal: Omit<MealItem, 'id'>) => {
    const item: MealItem = {
      ...newMeal,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const next = [item, ...meals];
    setMeals(next);
    saveMeals(next);
  };

  const handleDeleteMeal = (id: string) => {
    const next = meals.filter((m) => m.id !== id);
    setMeals(next);
    saveMeals(next);
  };

  const handleSaveExercise = (newExercise: Omit<ExerciseItem, 'id'>) => {
    const item: ExerciseItem = {
      ...newExercise,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const next = [item, ...exercises];
    setExercises(next);
    saveExercises(next);
  };

  const handleDeleteExercise = (id: string) => {
    const next = exercises.filter((e) => e.id !== id);
    setExercises(next);
    saveExercises(next);
  };

  const handleAddWeightRecord = (newRecord: Omit<WeightRecord, 'id'>) => {
    const item: WeightRecord = {
      ...newRecord,
      id: `w-${Date.now()}`,
    };
    const next = [...weightRecords, item];
    setWeightRecords(next);
    saveWeightRecords(next);

    // Also update current weight in profile if today
    if (newRecord.date === selectedDate || newRecord.date === getTodayDateString()) {
      handleUpdateProfile({ weight: newRecord.weight });
    }
  };

  const handleDeleteWeightRecord = (id: string) => {
    const next = weightRecords.filter((w) => w.id !== id);
    setWeightRecords(next);
    saveWeightRecords(next);
  };

  const handleUpdateWater = (amount: number) => {
    setWaterAmount(amount);
    saveWater(selectedDate, amount);
  };

  const handleUpdateFasting = (newSession: FastingSession) => {
    setFasting(newSession);
    saveFastingSession(newSession);
  };

  const handleSavePlan = (plan: GeneratedPlan) => {
    setSavedPlan(plan);
    saveSavedPlan(plan);
  };

  // AI Chat handler
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    saveChatHistory(nextHistory);
    setIsSendingChatMessage(true);

    try {
      const response = await fetch('/api/diet/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            userName: profile.name,
            gender: profile.gender,
            currentWeight: profile.weight,
            targetWeight: profile.targetWeight,
            targetCalories: profile.targetCalories,
            todayLoggedMealsCount: meals.filter((m) => m.date === selectedDate).length,
            todayCaloriesConsumed: meals
              .filter((m) => m.date === selectedDate)
              .reduce((sum, m) => sum + m.calories, 0),
          },
        }),
      });

      const data = await response.json();
      const coachMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'coach',
        text: data.text || '다이어트는 조급해하지 않고 지속 가능한 건강한 습관을 만드는 과정입니다. 천천히 하나씩 해나가요!',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalHistory = [...nextHistory, coachMsg];
      setChatHistory(finalHistory);
      saveChatHistory(finalHistory);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'coach',
        text: '답변을 생성하는 도중 일시적인 네트워크 오류가 발생했습니다. 잠시 후 다시 질문해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      const finalHistory = [...nextHistory, errorMsg];
      setChatHistory(finalHistory);
      saveChatHistory(finalHistory);
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  const handleOpenMealLoggerWithSlot = (type?: MealType) => {
    if (type) setTargetMealType(type);
    setIsMealLoggerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsMealLoggerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        isDark={isDark}
        toggleDark={() => setIsDark((prev) => !prev)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            profile={profile}
            meals={meals}
            exercises={exercises}
            weightRecords={weightRecords}
            fasting={fasting}
            waterAmount={waterAmount}
            onUpdateWater={handleUpdateWater}
            onOpenMealLogger={handleOpenMealLoggerWithSlot}
            onOpenExerciseLogger={() => setIsExerciseLoggerOpen(true)}
            onDeleteMeal={handleDeleteMeal}
            onDeleteExercise={handleDeleteExercise}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'meals' && (
          <MealListView
            meals={meals}
            onOpenMealLogger={handleOpenMealLoggerWithSlot}
            onDeleteMeal={handleDeleteMeal}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}

        {activeTab === 'weight' && (
          <WeightTrackerView
            profile={profile}
            weightRecords={weightRecords}
            onAddRecord={handleAddWeightRecord}
            onDeleteRecord={handleDeleteWeightRecord}
          />
        )}

        {activeTab === 'fasting' && (
          <FastingTimerView fasting={fasting} onUpdateFasting={handleUpdateFasting} />
        )}

        {activeTab === 'coach' && (
          <AICoachView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isSendingMessage={isSendingChatMessage}
            savedPlan={savedPlan}
            onSavePlan={handleSavePlan}
          />
        )}
      </main>

      {/* Modals */}
      <MealLoggerModal
        isOpen={isMealLoggerOpen}
        onClose={() => setIsMealLoggerOpen(false)}
        onSaveMeal={handleSaveMeal}
        selectedDate={selectedDate}
        initialMealType={targetMealType}
      />

      <ExerciseLoggerModal
        isOpen={isExerciseLoggerOpen}
        onClose={() => setIsExerciseLoggerOpen(false)}
        onSaveExercise={handleSaveExercise}
        selectedDate={selectedDate}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          saveProfile(updated);
        }}
      />
    </div>
  );
}
