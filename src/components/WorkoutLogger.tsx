import React, { useState } from 'react';
import { useGymStore } from '../hooks/useGymStore';
import { getExerciseById, EXERCISE_DB } from '../data/exercises';
import { Plus, Trash2, CheckCircle2, Circle, Save, Clock, ArrowUp, ArrowDown, X, Trophy } from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WorkoutSet } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export function WorkoutLogger({ onFinish }: { onFinish: () => void }) {
  const { workouts, addWorkout, routines, addRoutine, removeRoutine, themeColor } = useGymStore();
  const [sessionName, setSessionName] = useState('New Session');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addExerciseFromLibrary = (exerciseId: string) => {
    setExercises(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        exerciseId,
        sets: [
          { id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0, isCompleted: false }
        ]
      }
    ]);
  };

  const applyRoutine = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    setSessionName(routine.name);
    
    if (routine.exercises && routine.exercises.length > 0) {
      setExercises(routine.exercises.map(ex => ({
        id: Math.random().toString(36).substr(2, 9),
        exerciseId: ex.exerciseId,
        sets: ex.sets.map(s => ({
          ...s,
          id: Math.random().toString(36).substr(2, 9),
          isCompleted: false
        }))
      })));
    } else if (routine.exerciseIds) {
      setExercises(routine.exerciseIds.map(eId => ({
        id: Math.random().toString(36).substr(2, 9),
        exerciseId: eId,
        sets: [
          { id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0, isCompleted: false },
          { id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0, isCompleted: false },
          { id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0, isCompleted: false },
        ]
      })));
    }
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: any) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const handleToggleSet = (exId: string, baseExerciseId: string, set: WorkoutSet) => {
    const isNowCompleted = !set.isCompleted;
    let brokeRecord = false;

    if (isNowCompleted && Number(set.weight) > 0 && Number(set.reps) > 0) {
      let maxWeight = 0;
      workouts.forEach(w => {
        w.exercises.forEach(e => {
          if (e.exerciseId === baseExerciseId) {
            e.sets.forEach(s => {
              if (s.isCompleted && Number(s.weight) > maxWeight) maxWeight = Number(s.weight);
            });
          }
        });
      });

      // Also check current session
      exercises.forEach(e => {
        if (e.exerciseId === baseExerciseId) {
           e.sets.forEach(s => {
             // Don't compare with the current set being edited
             if (s.id !== set.id && s.isCompleted && Number(s.weight) > maxWeight) maxWeight = Number(s.weight);
           });
        }
      });

      if (Number(set.weight) > maxWeight && maxWeight > 0) {
        brokeRecord = true;
        // Fire confetti for personal best
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [themeColor, '#ffffff', '#a1a1aa']
        });
      }
    }
    
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === set.id ? { ...s, isCompleted: isNowCompleted, isRecord: brokeRecord } : s)
      };
    }));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { 
          id: Math.random().toString(36).substr(2, 9), 
          reps: lastSet ? lastSet.reps : 10, 
          weight: lastSet ? lastSet.weight : 0, 
          isCompleted: false 
        }]
      };
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      };
    }));
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setExercises(prev => {
      const idx = prev.findIndex(e => e.id === exerciseId);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      
      const newEx = [...prev];
      const temp = newEx[idx];
      newEx[idx] = newEx[idx + (direction === 'up' ? -1 : 1)];
      newEx[idx + (direction === 'up' ? -1 : 1)] = temp;
      return newEx;
    });
  };

  const handleSaveWorkout = () => {
    const cleanedExercises = exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0
      }))
    }));

    const dateObj = new Date(sessionDate);
    // ensure it uses the current time for the specific date or at least is somewhat valid
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    addWorkout({
      name: sessionName,
      date: dateObj.toISOString(),
      durationMinutes: duration,
      exercises: cleanedExercises
    });
    onFinish();
  };

  const handleSaveRoutine = () => {
    const cleanedExercises = exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0
      }))
    }));

    addRoutine({
      name: sessionName,
      exerciseIds: exercises.map(ex => ex.exerciseId),
      exercises: cleanedExercises
    });
    alert('Routine saved successfully! You can find it under "Start from Routine" next time.');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-4">
          <input 
            type="text" 
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="text-2xl font-black uppercase tracking-tighter bg-transparent border-none outline-none focus:ring-0 p-0 text-white placeholder-zinc-500 w-full"
            placeholder="Workout Name"
          />
          <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-sm font-mono uppercase">
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg focus-within:border-[var(--theme-color)] transition-colors">
              <Clock className="w-4 h-4 text-[var(--theme-color)]" />
              <input 
                 type="number" 
                 value={duration}
                 onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                 className="bg-transparent w-16 outline-none text-white font-bold"
                 placeholder="0"
              />
              <span>MINS</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg focus-within:border-[var(--theme-color)] transition-colors">
              <input
                 type="date"
                 value={sessionDate}
                 max={new Date().toISOString().split('T')[0]}
                 onChange={(e) => setSessionDate(e.target.value)}
                 className="bg-transparent w-full outline-none text-white font-bold"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSaveRoutine}
            disabled={exercises.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider transition"
          >
            <Save className="w-4 h-4" /> Save Routine
          </button>
          <button 
            onClick={handleSaveWorkout}
            disabled={exercises.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--theme-color)] hover:bg-opacity-80 disabled:opacity-50 text-black px-6 py-3 rounded-xl font-black uppercase tracking-wider transition shadow-lg shadow-[var(--theme-color)]/20"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish Workout
          </button>
        </div>
      </header>

      {/* Routine Selector */}
      {exercises.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-[var(--theme-color)] uppercase tracking-wider mb-2">Start from Routine</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {routines.length === 0 && <p className="text-zinc-500 text-sm">No routines saved. Create one above!</p>}
              {routines.map(r => (
                <div key={r.id} className="flex gap-2">
                  <button 
                    onClick={() => applyRoutine(r.id)}
                    className="flex-1 text-left px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold uppercase transition truncate"
                  >
                    {r.name}
                  </button>
                  <button
                    onClick={() => removeRoutine(r.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                    aria-label="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {exercises.map((ex, exIndex) => {
          const dbEx = getExerciseById(ex.exerciseId);
          return (
            <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-zinc-800/50 flex items-center justify-between border-b border-zinc-800">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-lg text-[var(--theme-color)] uppercase tracking-wide leading-tight mb-2">{dbEx?.name || 'Unknown Exercise'}</h3>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-[var(--theme-color)] text-black rounded whitespace-nowrap">{dbEx?.targetMuscleGroup}</span>
                    {dbEx?.tags?.map(t => (
                      <span key={t} className="text-[10px] font-black uppercase px-2 py-1 bg-zinc-800 text-zinc-300 rounded whitespace-nowrap">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveExercise(ex.id, 'up')} disabled={exIndex === 0} className="text-zinc-500 hover:text-[var(--theme-color)] disabled:opacity-30 transition p-1">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveExercise(ex.id, 'down')} disabled={exIndex === exercises.length - 1} className="text-zinc-500 hover:text-[var(--theme-color)] disabled:opacity-30 transition p-1">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeExercise(ex.id)} className="text-zinc-500 hover:text-red-400 transition p-1 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase font-mono mb-2 items-center px-2">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-3">Weight</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3 text-right">Status</div>
                  <div className="col-span-1"></div>
                </div>

                {ex.sets.map((set, i) => (
                  <div key={set.id} className={cn("grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-colors", set.isCompleted ? "bg-[var(--theme-color)]/10 border-[var(--theme-color)]/30" : "bg-zinc-800/30 border-zinc-800")}>
                    <div className={cn("col-span-2 pl-2 text-sm font-mono font-bold", set.isCompleted ? "text-[var(--theme-color)]" : "text-zinc-500")}>
                      {i + 1}
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={set.weight === 0 ? '' : set.weight}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          updateSet(ex.id, set.id, 'weight', val);
                        }}
                        placeholder="--"
                        className="w-full bg-transparent font-bold text-sm outline-none placeholder-zinc-600"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={set.reps === 0 ? '' : set.reps}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          updateSet(ex.id, set.id, 'reps', val);
                        }}
                        placeholder="--"
                        className="w-full bg-transparent font-bold text-sm outline-none placeholder-zinc-600"
                      />
                    </div>
                    <div className="col-span-3 text-right flex items-center justify-end gap-1">
                       {set.isCompleted ? (
                         <>
                           {set.isRecord && <Trophy className="w-3 h-3 text-yellow-500 mr-1" />}
                           <button 
                             onClick={() => handleToggleSet(ex.id, ex.exerciseId, set)}
                             className="text-[10px] text-[var(--theme-color)] font-black tracking-wider uppercase"
                           >
                             DONE
                           </button>
                         </>
                       ) : (
                         <button 
                           onClick={() => handleToggleSet(ex.id, ex.exerciseId, set)}
                           className="bg-[var(--theme-color)] text-black text-[10px] font-black py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-opacity-80 transition"
                         >
                           LOG
                         </button>
                       )}
                    </div>
                    <div className="col-span-1 flex justify-end pr-1">
                       <button onClick={() => removeSet(ex.id, set.id)} className="text-zinc-600 hover:text-red-400 transition" aria-label="Remove set">
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addSet(ex.id)}
                  className="w-full mt-3 py-2 text-xs font-black tracking-widest text-zinc-400 uppercase hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 rounded-lg transition"
                >
                  + Add Set
                </button>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="font-medium text-sm text-zinc-400 uppercase tracking-wider">Add Exercise</h4>
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--theme-color)] transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
             {EXERCISE_DB
               .filter(e => !exercises.some(ex => ex.exerciseId === e.id))
               .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.targetMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase()))
               .map(e => (
               <button 
                  key={e.id}
                  onClick={() => addExerciseFromLibrary(e.id)}
                  className="p-3 text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-[var(--theme-color)]/50 rounded-xl transition group flex flex-col justify-between gap-2"
               >
                 <div className="font-bold text-sm uppercase group-hover:text-[var(--theme-color)] transition leading-tight">{e.name}</div>
                 <div className="flex flex-wrap gap-1">
                   <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[var(--theme-color)] text-black rounded whitespace-nowrap">{e.targetMuscleGroup}</span>
                   {e.tags?.[0] && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded whitespace-nowrap">{e.tags[0]}</span>}
                 </div>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
