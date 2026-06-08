import React, { useMemo, useRef, useState } from 'react';
import { useGymStore } from '../hooks/useGymStore';
import { EXERCISE_DB } from '../data/exercises';
import { Trophy, Star, Gem, Crown, Swords, Shield, Medal, Dumbbell, Target, Share2, Loader2, User } from 'lucide-react';
import html2canvas from 'html2canvas';

const RANKS = [
  { name: 'Grandmaster', threshold: 1.0, icon: Trophy, color: 'text-yellow-300' },
  { name: 'Master', threshold: 0.85, icon: Star, color: 'text-rose-500' },
  { name: 'Diamond', threshold: 0.70, icon: Gem, color: 'text-cyan-400' },
  { name: 'Platinum', threshold: 0.55, icon: Crown, color: 'text-emerald-400' },
  { name: 'Gold', threshold: 0.40, icon: Swords, color: 'text-yellow-500' },
  { name: 'Silver', threshold: 0.25, icon: Shield, color: 'text-zinc-300' },
  { name: 'Bronze', threshold: 0.15, icon: Medal, color: 'text-amber-700' },
  { name: 'Iron', threshold: 0, icon: Dumbbell, color: 'text-zinc-500' }
];

const MUSCLE_STANDARDS: Record<string, number> = {
  'Chest': 120,
  'Legs': 160,
  'Back': 140,
  'Shoulders': 90,
  'Biceps': 60,
  'Triceps': 60,
  'Core': 50
};

function getStandard(muscleGroup: string) {
  return MUSCLE_STANDARDS[muscleGroup] || 80;
}

export function Ranked() {
  const { workouts, userProfile } = useGymStore();
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!captureRef.current) return;
    try {
      setIsSharing(true);
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#09090b', // zinc-950
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `my-gym-ranks-${new Date().toISOString().split('T')[0]}.png`;
      anchor.click();
    } catch (err) {
      console.error('Failed to capture rank image:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const { exerciseRanks, mgRanks } = useMemo(() => {
    const maxE1RM: Record<string, number> = {};
    
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.isCompleted) {
            const weight = Number(s.weight) || 0;
            const reps = Number(s.reps) || 0;
            if (weight > 0 && reps > 0) {
              const e1rm = weight * (1 + reps / 30);
              if (!maxE1RM[ex.exerciseId] || e1rm > maxE1RM[ex.exerciseId]) {
                maxE1RM[ex.exerciseId] = e1rm;
              }
            }
          }
        });
      });
    });

    const exRanks = Object.entries(maxE1RM).map(([exId, e1rm]) => {
      const dbEx = EXERCISE_DB.find(e => e.id === exId);
      const mg = dbEx?.targetMuscleGroup || 'Core';
      const std = getStandard(mg);
      const ratio = e1rm / std;
      
      const rankIndex = RANKS.findIndex(r => ratio >= r.threshold);
      const rIdx = rankIndex === -1 ? RANKS.length - 1 : rankIndex;
      const rank = RANKS[rIdx];
      const nextRank = rIdx > 0 ? RANKS[rIdx - 1] : null;

      let tier = '';
      let progress = 100;
      let nextWeight = 0;

      if (nextRank) {
         const range = nextRank.threshold - rank.threshold;
         const currentProgress = ratio - rank.threshold;
         const pct = currentProgress / range;
         
         if (pct < 0.333) tier = ' I';
         else if (pct < 0.666) tier = ' II';
         else tier = ' III';

         progress = pct * 100;
         nextWeight = (nextRank.threshold * std) - e1rm;
      }

      return {
        exerciseId: exId,
        name: dbEx?.name || 'Unknown',
        targetMuscleGroup: mg,
        e1rm,
        ratio,
        rank,
        tier,
        progress,
        nextWeight,
        nextRank
      };
    }).sort((a, b) => b.ratio - a.ratio);

    const mRanks: Record<string, typeof exRanks[0]> = {};
    const mgStats: Record<string, { totalRatio: number, count: number }> = {};

    exRanks.forEach(ex => {
      if (!mgStats[ex.targetMuscleGroup]) {
        mgStats[ex.targetMuscleGroup] = { totalRatio: 0, count: 0 };
      }
      mgStats[ex.targetMuscleGroup].totalRatio += ex.ratio;
      mgStats[ex.targetMuscleGroup].count += 1;
    });

    Object.entries(mgStats).forEach(([mg, stats]) => {
      const avgRatio = stats.totalRatio / stats.count;
      
      const rankIndex = RANKS.findIndex(r => avgRatio >= r.threshold);
      const rIdx = rankIndex === -1 ? RANKS.length - 1 : rankIndex;
      const rank = RANKS[rIdx];
      const nextRank = rIdx > 0 ? RANKS[rIdx - 1] : null;

      let tier = '';
      let progress = 100;
      let nextWeight = 0;

      if (nextRank) {
         const range = nextRank.threshold - rank.threshold;
         const currentProgress = avgRatio - rank.threshold;
         const pct = currentProgress / range;
         
         if (pct < 0.333) tier = ' I';
         else if (pct < 0.666) tier = ' II';
         else tier = ' III';

         progress = pct * 100;
         
         const ratioIncreaseNeeded = (nextRank.threshold - avgRatio) * stats.count;
         const std = getStandard(mg);
         nextWeight = ratioIncreaseNeeded * std;
      }

      mRanks[mg] = {
        exerciseId: 'avg',
        name: 'Average',
        targetMuscleGroup: mg,
        e1rm: avgRatio * getStandard(mg), // Approximate average 1RM
        ratio: avgRatio,
        rank,
        tier,
        progress,
        nextWeight,
        nextRank
      };
    });

    // Ensure all required muscle groups have at least Iron
    const requiredGroups = ['Core', 'Chest', 'Legs', 'Back', 'Shoulders', 'Biceps', 'Triceps'];
    requiredGroups.forEach(g => {
      if (!mRanks[g]) {
        mRanks[g] = { 
           exerciseId: 'none', 
           name: 'No Data', 
           targetMuscleGroup: g, 
           e1rm: 0, 
           ratio: 0, 
           rank: RANKS[RANKS.length - 1],
           tier: ' I',
           progress: 0,
           nextWeight: getStandard(g) * RANKS[RANKS.length - 2].threshold,
           nextRank: RANKS[RANKS.length - 2]
        };
      }
    });

    return { exerciseRanks: exRanks, mgRanks: mRanks };
  }, [workouts]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-6">
      
      <div ref={captureRef} className="flex flex-col gap-6 p-2 -m-2 bg-zinc-950 rounded-3xl">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg top-0 relative z-10" data-html2canvas-ignore="false">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-800 flex items-center justify-center">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-zinc-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">{userProfile?.username || 'Guest Lifter'}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Season 1 &bull; {exerciseRanks.length} Lifts Ranked</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          disabled={isSharing}
          data-html2canvas-ignore="true"
          className="flex items-center gap-2 bg-[var(--theme-color)] hover:bg-opacity-80 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition shadow-lg shadow-[var(--theme-color)]/20"
        >
          {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          {isSharing ? 'Saving...' : 'Share Rank'}
        </button>
      </div>

      {/* Visual Rank Ladder */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-center">Rank Ladder</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {RANKS.slice().reverse().map((r, i) => {
            const Icon = r.icon;
            return (
               <div key={r.name} className="flex flex-col items-center gap-2 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800 min-w-[90px]">
                 <Icon className={`w-8 h-8 ${r.color}`} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{r.name}</span>
               </div>
            );
          })}
        </div>
      </section>

      {/* Muscle Group Ranks */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Muscle Group Ranks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(mgRanks).map(([mg, data]) => {
            const Icon = data.rank.icon;
            return (
              <div key={mg} className={`flex items-center gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-800/30`}>
                <div className={`p-3 bg-zinc-900 rounded-xl shadow-inner border border-zinc-800 ${data.rank.color}`}>
                  <Icon className={`w-6 h-6`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{mg}</p>
                    <p className={`font-black uppercase tracking-tight text-sm ${data.rank.color}`}>{data.rank.name}{data.tier}</p>
                  </div>
                  {data.rank.name !== 'Grandmaster' ? (
                     <div className="space-y-1">
                       <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                         <div className={`h-full ${data.rank.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${data.progress}%` }}></div>
                       </div>
                       <p className="text-[9px] font-mono text-zinc-500 uppercase text-right">+{Math.ceil(data.nextWeight)}kg total volume to {data.nextRank?.name || 'next rank'}</p>
                     </div>
                  ) : (
                     <div className="h-1.5 w-full bg-yellow-400/20 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-400" style={{ width: '100%' }}></div>
                     </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Individual Exercise Ranks */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg flex-1">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Exercise Ranks</h2>
        {exerciseRanks.length === 0 ? (
          <p className="text-zinc-500 text-sm">Perform some exercises to get ranked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exerciseRanks.map(ex => {
              const Icon = ex.rank.icon;
              return (
                 <div key={ex.exerciseId} className="flex gap-4 border border-zinc-800 rounded-2xl p-4 bg-zinc-800/30">
                   <div className={`p-3 bg-zinc-900 rounded-xl shadow-inner border border-zinc-800 h-fit ${ex.rank.color}`}>
                     <Icon className={`w-5 h-5`} />
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <div className="flex justify-between items-start mb-1">
                       <div className="min-w-0 pr-2">
                         <p className="font-bold text-sm truncate uppercase tracking-tight leading-tight">{ex.name}</p>
                         <p className="text-[9px] font-mono text-zinc-500">{ex.targetMuscleGroup} &bull; max e1RM {Math.round(ex.e1rm)}kg</p>
                       </div>
                       <div className={`font-black uppercase text-xs text-right whitespace-nowrap ${ex.rank.color}`}>
                          {ex.rank.name}{ex.tier}
                       </div>
                     </div>
                     {ex.rank.name !== 'Grandmaster' ? (
                       <div className="mt-2 text-right">
                         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-1">
                           <div className={`h-full ${ex.rank.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${ex.progress}%` }}></div>
                         </div>
                         <p className="text-[9px] font-mono text-zinc-500 uppercase text-right">+{Math.ceil(ex.nextWeight)}kg to {ex.nextRank?.name || 'next rank'}</p>
                       </div>
                     ) : (
                       <div className="mt-2 h-1.5 w-full bg-yellow-400/20 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-400" style={{ width: '100%' }}></div>
                       </div>
                     )}
                   </div>
                 </div>
              );
            })}
          </div>
        )}
      </section>
      </div>

    </div>
  );
}
