/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { WorkoutLogger } from './components/WorkoutLogger';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { AICoach } from './components/AICoach';
import { Ranked } from './components/Ranked';
import { SettingsView } from './components/SettingsView';
import { Activity, Dumbbell, BookOpen, Bot, TrendingUp, Settings, Trophy } from 'lucide-react';
import { cn } from './lib/utils';
import { useGymStore } from './hooks/useGymStore';

type View = 'dashboard' | 'log' | 'library' | 'ranked' | 'coach' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { themeColor } = useGymStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'log', label: 'Log Workout', icon: Dumbbell },
    { id: 'library', label: 'Exercises', icon: BookOpen },
    { id: 'ranked', label: 'Ranked', icon: Trophy },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden p-6 max-w-7xl mx-auto h-screen selection:bg-[var(--theme-color)] selection:text-black">
      <style>{`
        :root {
          --theme-color: ${themeColor || '#D9FF00'};
        }
      `}</style>
      {/* Header Navigation */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--theme-color)] rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Gym <span className="text-[var(--theme-color)]">Coach</span></h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "pb-1 transition-colors border-b-2",
                currentView === item.id 
                  ? "text-white border-[var(--theme-color)]" 
                  : "border-transparent hover:text-zinc-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-500 font-mono uppercase">Athlete Profile</p>
            <p className="text-sm font-bold">User</p>
          </div>
          <div className="w-10 h-10 bg-zinc-800 rounded-full border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-zinc-700"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide py-2">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'log' && <WorkoutLogger onFinish={() => setCurrentView('dashboard')} />}
        {currentView === 'library' && <ExerciseLibrary />}
        {currentView === 'ranked' && <Ranked />}
        {currentView === 'coach' && <AICoach />}
        {currentView === 'settings' && <SettingsView />}
      </main>
      
      {/* Mobile nav for smaller screens since header is hidden on small */}
      <div className="md:hidden flex justify-around border-t border-zinc-800 pt-4 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "p-2 rounded-xl transition flex flex-col items-center gap-1",
                  currentView === item.id ? "text-[var(--theme-color)]" : "text-zinc-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold">{item.label}</span>
              </button>
            )
          })}
      </div>
    </div>
  );
}
