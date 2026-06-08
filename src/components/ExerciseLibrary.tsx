import React, { useState } from 'react';
import { EXERCISE_DB } from '../data/exercises';
import { Search, Info, Activity, Shield, X } from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseDetail } from './ExerciseDetail';

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const filtered = EXERCISE_DB.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.targetMuscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Exercise Library</h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Browse proper form guidelines and recommendations.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search exercises or muscle groups..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--theme-color)] font-bold transition"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => (
           <div 
             key={ex.id} 
             onClick={() => setSelectedEx(ex)}
             className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-[var(--theme-color)]/50 hover:bg-zinc-900 hover:shadow-lg hover:shadow-[var(--theme-color)]/5 cursor-pointer transition group"
           >
              <div className="flex flex-col mb-4 gap-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg group-hover:text-[var(--theme-color)] uppercase tracking-wide transition leading-tight">{ex.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-[var(--theme-color)] text-black rounded whitespace-nowrap">{ex.targetMuscleGroup}</span>
                  {ex.tags?.map(t => (
                    <span key={t} className="text-[10px] font-black uppercase px-2 py-1 bg-zinc-800 text-zinc-300 rounded whitespace-nowrap">{t}</span>
                  ))}
                </div>
              </div>
             <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{ex.description}</p>
           </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            No exercises found matching "{searchTerm}".
          </div>
        )}
      </div>

      {selectedEx && <ExerciseDetail exercise={selectedEx} onClose={() => setSelectedEx(null)} />}
    </div>
  );
}
