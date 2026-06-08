import React, { useState, useMemo } from 'react';
import { Exercise, WorkoutSession } from '../types';
import { X, Trophy, Sparkles, RefreshCw, Info, Shield, Activity, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';
import { useGymStore } from '../hooks/useGymStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface ExerciseDetailProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const { workouts } = useGymStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats'>('info');

  const history = useMemo(() => {
    const data: { date: string; maxWeight: number; volume: number; e1rm: number; fullDate: Date }[] = [];
    
    // Sort workouts ascending to plot timeline
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedWorkouts.forEach(w => {
      const exData = w.exercises.find(e => e.exerciseId === exercise.id);
      if (exData) {
        let maxWeight = 0;
        let volume = 0;
        let best1rm = 0;
        exData.sets.forEach(s => {
          if (s.isCompleted) {
            const wVal = Number(s.weight) || 0;
            const rVal = Number(s.reps) || 0;
            if (wVal > maxWeight) maxWeight = wVal;
            volume += (wVal * rVal);
            
            // Brzycki formula for 1RM estimate
            const e1rm = wVal * (36 / (37 - rVal));
            if (rVal > 0 && e1rm > best1rm) {
               best1rm = e1rm;
            }
          }
        });
        if (maxWeight > 0 || volume > 0) {
          data.push({
            date: format(new Date(w.date), 'MMM dd'),
            fullDate: new Date(w.date),
            maxWeight,
            volume,
            e1rm: Math.round(best1rm)
          });
        }
      }
    });
    return data;
  }, [workouts, exercise.id]);

  const allTimeMaxWeight = Math.max(0, ...history.map(d => d.maxWeight));
  const allTimeMaxVolume = Math.max(0, ...history.map(d => d.volume));
  const allTime1RM = Math.max(0, ...history.map(d => d.e1rm));

  const [chartType, setChartType] = useState<'maxWeight' | 'e1rm' | 'volume'>('maxWeight');
  
  const getChartDataKey = () => {
    switch (chartType) {
      case 'maxWeight': return 'maxWeight';
      case 'e1rm': return 'e1rm';
      case 'volume': return 'volume';
    }
  };

  const getChartDataName = () => {
    switch (chartType) {
      case 'maxWeight': return 'Weight (kg)';
      case 'e1rm': return 'Est 1RM (kg)';
      case 'volume': return 'Volume (kg)';
    }
  };

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/exercise-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, history })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to fetch advice from server');
      }
      if (data.feedback) setFeedback(data.feedback);
    } catch (error) {
      console.error(error);
      setFeedback('Failed to generate insights. Please check console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8 flex flex-col max-h-[85vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-color)]"></div>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center flex-shrink-0 bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">{exercise.name}</h2>
            <div className="flex flex-wrap gap-1 mt-1 shrink-0 max-w-full">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[var(--theme-color)] text-black rounded whitespace-nowrap">{exercise.targetMuscleGroup}</span>
              {exercise.tags?.map(t => (
                <span key={t} className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded whitespace-nowrap">{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-[var(--theme-color)] bg-zinc-800 hover:bg-zinc-700 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex px-6 pt-4 gap-4 border-b border-zinc-800 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'info' ? 'border-[var(--theme-color)] text-[var(--theme-color)]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            Guidelines
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'stats' ? 'border-[var(--theme-color)] text-[var(--theme-color)]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            My Stats & AI Advice
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[10px] pb-1">
                   <Info className="w-4 h-4 text-[var(--theme-color)]" /> Description
                 </div>
                 <p className="text-sm text-zinc-400 leading-relaxed">{exercise.description}</p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[10px] pb-1">
                   <Shield className="w-4 h-4 text-[var(--theme-color)]" /> Form & Technique
                 </div>
                 <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-800/50 p-4 rounded-2xl border border-zinc-800 border-l-4 border-l-[var(--theme-color)]">
                   {exercise.formAdvice}
                 </p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[10px] pb-1">
                   <Activity className="w-4 h-4 text-[var(--theme-color)]" /> Recommendation
                 </div>
                 <p className="text-sm text-zinc-400 font-bold">{exercise.recommendedSetsReps}</p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {history.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">Max Weight</p>
                      <p className="text-xl font-black text-white flex items-center justify-center gap-1">{allTimeMaxWeight} <span className="text-xs text-zinc-500 font-normal">kg</span> {allTimeMaxWeight > 0 && <Trophy className="w-3 h-3 text-amber-400" />}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">Est. 1RM</p>
                      <p className="text-xl font-black text-white">{allTime1RM} <span className="text-xs text-zinc-500 font-normal">kg</span></p>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">Max Vol</p>
                      <p className="text-xl font-black text-white">{allTimeMaxVolume} <span className="text-xs text-zinc-500 font-normal">kg</span></p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Progress Over Time</h3>
                      <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button onClick={() => setChartType('maxWeight')} className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${chartType === 'maxWeight' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Max Wt</button>
                        <button onClick={() => setChartType('e1rm')} className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${chartType === 'e1rm' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>1RM</button>
                        <button onClick={() => setChartType('volume')} className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${chartType === 'volume' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Vol</button>
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                            labelStyle={{ color: '#a1a1aa', fontSize: '10px' }}
                          />
                          <Line type="monotone" dataKey={getChartDataKey()} name={getChartDataName()} stroke="var(--theme-color)" strokeWidth={3} dot={{ fill: 'var(--theme-color)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <button 
                    onClick={generateFeedback}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--theme-color)] hover:bg-opacity-80 disabled:opacity-50 text-black px-4 py-3 rounded-xl font-black uppercase tracking-wider transition"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isLoading ? 'Analyzing History...' : 'Get AI Form & Progress Advice'}
                  </button>

                  {feedback && (
                    <div className="bg-zinc-900/50 border border-[var(--theme-color)]/30 rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-color)]"></div>
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-color)]">AI Coach Insights</h2>
                      </div>
                      <div className="markdown-body text-zinc-300 prose prose-invert prose-sm">
                        <Markdown>{feedback}</Markdown>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-zinc-500 py-12 flex flex-col items-center gap-2">
                  <Calendar className="w-8 h-8 opacity-50" />
                  <p>No history found for this exercise.</p>
                  <p className="text-xs">Log a workout with {exercise.name} to view stats.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
