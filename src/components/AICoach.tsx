import React, { useState } from 'react';
import { useGymStore } from '../hooks/useGymStore';
import { Bot, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export function AICoach() {
  const { workouts } = useGymStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>('');

  const generateFeedback = async () => {
    if (workouts.length === 0) {
      setError("You need to log at least one workout before the coach can analyze your progress.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const recentWorkouts = workouts.slice(0, 5); // Send last 5 workouts to save tokens

      // Calculate simple personal bests to send
      const pbs: Record<string, number> = {};
      workouts.forEach(w => {
        w.exercises.forEach(ex => {
           ex.sets.forEach(s => {
             const w = Number(s.weight) || 0;
             if (s.isCompleted && w > 0) {
               if (!pbs[ex.exerciseId] || w > pbs[ex.exerciseId]) {
                 pbs[ex.exerciseId] = w;
               }
             }
           })
        });
      });

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentWorkouts,
          personalBests: pbs,
          nextWorkoutGoal: goal
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insight');
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err: any) {
      setError(`Failed to reach the AI Coach: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="pb-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
          <Bot className="w-6 h-6 text-[var(--theme-color)]" /> AI Coach
        </h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Personalized Training Insights</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-[10px] font-mono tracking-widest text-[var(--theme-color)] uppercase mb-2">Next Session Goal</label>
          <input 
            type="text" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Focus on chest strength, recovery day, hyperthrophy..."
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--theme-color)] focus:border-[var(--theme-color)]/50 transition"
          />
        </div>
        
        <button 
          onClick={generateFeedback}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[var(--theme-color)] hover:bg-opacity-80 disabled:opacity-50 disabled:hover:bg-[var(--theme-color)] text-black px-4 py-3 rounded-xl font-black uppercase tracking-wider transition shadow-lg shadow-[var(--theme-color)]/20"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? 'Analyzing...' : 'Generate Insights'}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {feedback && (
        <div className="bg-zinc-900/50 border border-[var(--theme-color)]/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-color)]"></div>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-color)]">AI Coach Feedback</h2>
            <span className="px-2 py-1 bg-[var(--theme-color)]/20 text-[var(--theme-color)] rounded text-[10px] font-bold uppercase">Ready</span>
          </div>
          <div className="markdown-body text-zinc-300 prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-h2:text-white prose-h2:text-lg prose-h2:font-black prose-h2:mt-4 prose-h2:mb-2 prose-ul:my-2 prose-li:my-0 pb-2">
            <Markdown>{feedback}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
