import React, { useMemo, useState } from 'react';
import { format, subDays, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { useGymStore } from '../hooks/useGymStore';
import { EXERCISE_DB } from '../data/exercises';
import { WorkoutSession } from '../types';
import { WorkoutDetail } from './WorkoutDetail';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, Flame, Calendar as CalendarIcon, Target, Trash2 } from 'lucide-react';

export function Dashboard() {
  const { workouts, removeWorkout } = useGymStore();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [timeRange, setTimeRange] = useState<'1W' | '2W' | '1M' | '6M'>('2W');

  const monthDays = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return eachDayOfInterval({ start, end }).map(day => {
      const hasWorkout = workouts.some(w => isSameDay(new Date(w.date), day));
      return { date: day, hasWorkout };
    });
  }, [workouts]);

  const activityData = useMemo(() => {
    const data = [];
    const today = new Date();
    let days = 14;
    switch(timeRange) {
      case '1W': days = 7; break;
      case '2W': days = 14; break;
      case '1M': days = 30; break;
      case '6M': days = 180; break;
    }

    const isWeekly = days === 180;
    const pointsCount = isWeekly ? 25 : days; // ~6 months in weeks = 26 points, use 25 for trailing + today

    for (let i = pointsCount; i >= 0; i--) {
      let pointVolume = 0;
      let pointSessions = 0;
      const pointDateEnd = isWeekly ? subDays(today, i * 7) : subDays(today, i);
      const name = isWeekly ? format(subDays(pointDateEnd, 6), 'MMM dd') : format(pointDateEnd, 'MMM dd');

      const intervalDays = isWeekly ? 7 : 1;
      for (let j = 0; j < intervalDays; j++) {
        const d = subDays(pointDateEnd, j);
        const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.date), d));
        pointSessions += dayWorkouts.length;
        pointVolume += dayWorkouts.reduce((acc, session) => {
          let dailyVol = 0;
          session.exercises.forEach(ex => {
            ex.sets.forEach(s => {
              if (s.isCompleted) {
                dailyVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
              }
            });
          });
          return acc + dailyVol;
        }, 0);
      }
      data.push({ name, sessions: pointSessions, volume: pointVolume });
    }
    return data;
  }, [workouts, timeRange]);

  const personalBests = useMemo(() => {
    const pbs: Record<string, number> = {};
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
         ex.sets.forEach(s => {
           const wValue = Number(s.weight) || 0;
           if (s.isCompleted && wValue > 0) {
             if (!pbs[ex.exerciseId] || wValue > pbs[ex.exerciseId]) {
               pbs[ex.exerciseId] = wValue;
             }
           }
         });
      });
    });
    return Object.entries(pbs)
      .map(([exerciseId, weight]) => ({
        exercise: EXERCISE_DB.find(e => e.id === exerciseId),
        weight
      }))
      .filter(entry => entry.exercise !== undefined)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5); // top 5
  }, [workouts]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      {/* Bento Layout Grid for Desktop, stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow">
        
        {/* Quick Stats (Bento Item) spanning horizontal */}
        <section className="col-span-1 md:col-span-12 bg-[var(--theme-color)] rounded-3xl p-6 flex flex-wrap items-center justify-between text-black gap-4 border border-[var(--theme-color)] shadow-lg shadow-[var(--theme-color)]/20">
          <div className="flex-1 min-w-[120px]">
            <p className="text-[10px] font-black uppercase leading-none mb-1 text-black/60">Total Workouts</p>
            <p className="text-3xl font-black">{workouts.length}</p>
          </div>
          <div className="flex-1 min-w-[120px]">
            <p className="text-[10px] font-black uppercase leading-none mb-1 text-black/60">Total Volume(kg)</p>
            <p className="text-3xl font-black">{workouts.reduce((acc, session) => acc + session.exercises.reduce((accEx, ex) => accEx + ex.sets.reduce((sAcc, s) => sAcc + (s.isCompleted ? (Number(s.weight)||0) * (Number(s.reps)||0) : 0), 0), 0), 0).toLocaleString()}</p>
          </div>
          <div className="flex-1 min-w-[120px]">
             <p className="text-[10px] font-black uppercase leading-none mb-1 text-black/60">Streak</p>
             <p className="text-3xl font-black">
                {Math.min(workouts.length, 12)} <span className="text-sm font-bold opacity-70">DAYS</span>
             </p>
          </div>
          <div className="flex-1 min-w-[120px]">
             <p className="text-[10px] font-black uppercase leading-none mb-1 text-black/60">Avg Session</p>
             <p className="text-3xl font-black">
                {workouts.length > 0 ? Math.round(workouts.reduce((acc, w) => acc + (w.durationMinutes || 45), 0) / workouts.length) : 0} <span className="text-sm font-bold opacity-70">MINS</span>
             </p>
          </div>
          <div className="opacity-20 hidden lg:block">
            <Activity className="w-16 h-16" />
          </div>
        </section>

        {/* Chart Section (Bento Item) */}
        <section className="col-span-1 md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Performance Trend</h2>
              <p className="text-2xl font-black tracking-tight">Relative Volume</p>
            </div>
            <div className="flex gap-2 text-[10px] font-bold">
              {['1W', '2W', '1M', '6M'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-2 py-1 rounded transition-colors ${timeRange === range ? 'bg-[var(--theme-color)] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split(' ')[1]} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: 'var(--theme-color)', fontWeight: 'bold' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="volume" stroke="var(--theme-color)" strokeWidth={3} dot={{ fill: 'var(--theme-color)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: 'var(--theme-color)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="col-span-1 md:col-span-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 overflow-hidden relative flex flex-col">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">Recent Sessions</h2>
          {workouts.length === 0 ? (
            <div className="text-zinc-500 text-sm">No recent sessions found. Log a workout to see it here!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.slice(0, 6).map(w => (
                <div key={w.id} onClick={() => setSelectedWorkout(w)} className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between group hover:border-[var(--theme-color)]/50 transition-colors relative cursor-pointer">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeWorkout(w.id); }}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-400 bg-zinc-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="mb-4 pr-8">
                    <h3 className="font-bold text-[var(--theme-color)] uppercase tracking-tight text-lg leading-tight truncate">{w.name}</h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">{format(new Date(w.date), 'MMM do, yyyy')}</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-zinc-800 pt-3">
                    <div>
                       <p className="text-lg font-black leading-none">{w.durationMinutes} <span className="font-mono text-[10px] text-zinc-500 font-normal uppercase">MINS</span></p>
                    </div>
                    <div>
                      <p className="text-lg font-black leading-none">{w.exercises.length} <span className="text-[10px] text-zinc-500 font-normal uppercase font-mono">Exercises</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Personal Bests (Bento Item) */}
        <section className="col-span-1 md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 overflow-hidden relative flex flex-col min-h-[300px]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">Personal Bests</h2>
          <div className="space-y-4 flex-grow overflow-y-auto pr-2 scrollbar-hide">
            {personalBests.length === 0 ? (
              <div className="text-zinc-500 text-sm">Log some workouts to see personal bests here.</div>
            ) : (
              personalBests.map((pb, index) => (
                <div key={pb.exercise?.id || index}>
                  <p className="text-xs text-zinc-500 uppercase font-mono">{pb.exercise?.name}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-bold">{pb.weight} <span className="text-sm font-normal text-zinc-500">kg</span></p>
                  </div>
                  {index < personalBests.length - 1 && <div className="h-[1px] bg-zinc-800 my-3"></div>}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Calendar View */}
        <section className="col-span-1 md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">Workout Calendar (This Month)</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-mono text-zinc-500 uppercase">{d}</div>
            ))}
            {
              Array.from({ length: monthDays[0].date.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8 md:h-12"></div>
              ))
            }
            {monthDays.map(day => (
              <div
                key={day.date.toISOString()}
                className={`h-8 md:h-12 rounded-xl border flex items-center justify-center text-xs font-bold transition-all
                  ${day.hasWorkout ? 'bg-[var(--theme-color)] text-black border-[var(--theme-color)] shadow-[0_0_10px_var(--theme-color)] opacity-90' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'}
                  ${isToday(day.date) && !day.hasWorkout ? 'border-zinc-600 border-dashed' : ''}
                `}
                title={format(day.date, 'MMM do, yyyy')}
              >
                {format(day.date, 'd')}
              </div>
            ))}
          </div>
        </section>
        
      </div>
      
      {selectedWorkout && (
        <WorkoutDetail workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />
      )}
    </div>
  );
}
