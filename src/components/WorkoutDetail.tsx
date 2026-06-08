import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../types';
import { EXERCISE_DB } from '../data/exercises';
import { X, Trophy, Sparkles, RefreshCw, Layers, Crown } from 'lucide-react';
import Markdown from 'react-markdown';
import { useGymStore } from '../hooks/useGymStore';

interface WorkoutDetailProps {
  workout: WorkoutSession;
  onClose: () => void;
}

export function WorkoutDetail({ workout, onClose }: WorkoutDetailProps) {
  const { workouts } = useGymStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pbs = useMemo(() => {
    const weightRecords: Record<string, number> = {};
    const volumeRecords: Record<string, number> = {};
    const e1rmRecords: Record<string, number> = {};

    workouts.forEach(w => {
      w.exercises.forEach(ex => {
         let sessionVolume = 0;
         let sessionMaxE1RM = 0;
         
         ex.sets.forEach(s => {
           const wValue = Number(s.weight) || 0;
           const rValue = Number(s.reps) || 0;
           if (s.isCompleted && wValue > 0) {
             if (!weightRecords[ex.exerciseId] || wValue > weightRecords[ex.exerciseId]) {
               weightRecords[ex.exerciseId] = wValue;
             }
             sessionVolume += (wValue * rValue);
             
             const e1rm = wValue * (36 / (37 - rValue));
             if (e1rm > sessionMaxE1RM) {
               sessionMaxE1RM = e1rm;
             }
           }
         });
         
         if (sessionVolume > (volumeRecords[ex.exerciseId] || 0)) {
           volumeRecords[ex.exerciseId] = sessionVolume;
         }
         if (sessionMaxE1RM > (e1rmRecords[ex.exerciseId] || 0)) {
           e1rmRecords[ex.exerciseId] = sessionMaxE1RM;
         }
      });
    });
    return { weight: weightRecords, volume: volumeRecords, e1rm: e1rmRecords };
  }, [workouts]);

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const enrichedWorkout = {
        ...workout,
        exercises: workout.exercises.map(ex => {
          const dbEx = EXERCISE_DB.find(e => e.id === ex.exerciseId);
          return {
            ...ex,
            name: dbEx?.name || 'Unknown',
            targetMuscleGroup: dbEx?.targetMuscleGroup || 'Unknown'
          };
        })
      };

      const resp = await fetch('/api/workout-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workout: enrichedWorkout,
          pbs
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to fetch advice from server');
      }
      if (data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error(error);
      setFeedback('Failed to generate insights. Please check console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-color)]"></div>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">{workout.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{new Date(workout.date).toLocaleString()}</span>
              {workout.durationMinutes && (
                <>
                  <span className="text-zinc-600 text-[10px]">&bull;</span>
                  <span className="text-[10px] font-mono tracking-widest text-[var(--theme-color)] uppercase">{workout.durationMinutes} MINS</span>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-[var(--theme-color)] bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* AI Advisor Button */}
          <button 
            onClick={generateFeedback}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--theme-color)] hover:bg-opacity-80 disabled:opacity-50 disabled:hover:bg-[var(--theme-color)] text-black px-4 py-3 rounded-xl font-black uppercase tracking-wider transition shadow-lg shadow-[var(--theme-color)]/20"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Analyzing Session...' : 'Analyze This Workout'}
          </button>

          {feedback && (
            <div className="bg-zinc-900/50 border border-[var(--theme-color)]/30 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-color)]"></div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-color)]">Session AI Insights</h2>
                <span className="px-2 py-1 bg-[var(--theme-color)]/20 text-[var(--theme-color)] rounded text-[10px] font-bold uppercase">Ready</span>
              </div>
              <div className="markdown-body text-zinc-300 prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-h2:text-white prose-h2:text-lg prose-h2:font-black prose-h2:mt-4 prose-h2:mb-2 prose-ul:my-2 prose-li:my-0 pb-2">
                <Markdown>{feedback}</Markdown>
              </div>
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-4">
            {workout.exercises.map(ex => {
              const dbEx = EXERCISE_DB.find(e => e.id === ex.exerciseId);
              
              let exVolume = 0;
              let exMaxE1rm = 0;
              const maxWeight = Math.max(...ex.sets.filter(s => s.isCompleted).map(s => {
                 const w = Number(s.weight) || 0;
                 const r = Number(s.reps) || 0;
                 exVolume += w * r;
                 const e1rm = w * (36 / (37 - r));
                 if (e1rm > exMaxE1rm) exMaxE1rm = e1rm;
                 return w;
              }));
              
              const isWeightPB = maxWeight > 0 && maxWeight >= (pbs.weight[ex.exerciseId] || 0);
              const isVolumePB = exVolume > 0 && exVolume >= (pbs.volume[ex.exerciseId] || 0);
              const isE1RMPB = exMaxE1rm > 0 && exMaxE1rm >= (pbs.e1rm[ex.exerciseId] || 0);

              return (
                <div key={ex.id} className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[var(--theme-color)] uppercase tracking-wide flex flex-wrap items-center gap-2 leading-tight">
                        {dbEx?.name || 'Unknown'} 
                        <div className="flex gap-1 shrink-0">
                          {isWeightPB && <span title="Max Weight PB!"><Trophy className="w-4 h-4 text-amber-400" /></span>}
                          {isVolumePB && <span title="Volume PB!"><Layers className="w-4 h-4 text-blue-400" /></span>}
                          {isE1RMPB && <span title="Est 1RM PB!"><Crown className="w-4 h-4 text-rose-400" /></span>}
                        </div>
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[var(--theme-color)] text-black rounded whitespace-nowrap">{dbEx?.targetMuscleGroup}</span>
                        {dbEx?.tags?.map(t => (
                          <span key={t} className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded whitespace-nowrap">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase font-mono mb-2 px-2">
                    <div className="col-span-2">Set</div>
                    <div className="col-span-4">Weight</div>
                    <div className="col-span-4">Reps</div>
                  </div>

                  <div className="space-y-2">
                    {ex.sets.map((set, i) => (
                      <div key={set.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                        <div className="col-span-2 pl-2 text-sm font-mono font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="col-span-4 font-bold text-sm">
                          {set.weight} kg
                        </div>
                        <div className="col-span-4 font-bold text-sm">
                          {set.reps}
                        </div>
                        <div className="col-span-2 text-right pr-2">
                          {set.isCompleted ? (
                            <span className="text-[var(--theme-color)] text-[10px] font-bold uppercase">Done</span>
                          ) : (
                            <span className="text-zinc-600 text-[10px] font-bold uppercase">Skipped</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
