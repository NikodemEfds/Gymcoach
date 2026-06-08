import React from 'react';
import { useGymStore } from '../hooks/useGymStore';
import { User } from 'lucide-react';

const THEMES = [
  { name: 'Acid', color: '#D9FF00' },
  { name: 'Neon Pink', color: '#FF0055' },
  { name: 'Cyber Blue', color: '#00F0FF' },
  { name: 'Matrix Green', color: '#00FFAA' },
  { name: 'Molten Orange', color: '#FF4400' }
];

export function SettingsView() {
  const { themeColor, setThemeColor, userProfile, updateUserProfile, state, importState } = useGymStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Settings</h1>
        <p className="text-zinc-500 font-mono text-sm mt-1 uppercase tracking-widest">Customize your experience</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-6">User Profile</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-800 flex items-center justify-center">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-zinc-500" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              <span className="text-[10px] font-bold uppercase">Upload</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={userProfile?.username || ''}
                onChange={e => updateUserProfile({ username: e.target.value })}
                placeholder="Enter Username"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 font-bold text-white focus:ring-2 focus:ring-[var(--theme-color)] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-6">Accent Color</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {THEMES.map(theme => (
            <button
               key={theme.name}
               onClick={() => setThemeColor(theme.color)}
               className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                 themeColor === theme.color ? 'border-[var(--theme-color)] bg-zinc-800' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
               }`}
            >
               <div className="w-8 h-8 rounded-full border border-zinc-700 shadow-inner" style={{ backgroundColor: theme.color }}></div>
               <span className="text-[10px] font-mono uppercase text-zinc-400 whitespace-nowrap">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Data Management</h2>
        <p className="text-xs text-zinc-500 mb-6">Export your workouts securely to avoid crashes and data losses, or import an existing backup.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
              const anchor = document.createElement('a');
              anchor.setAttribute("href", dataStr);
              anchor.setAttribute("download", `gym-coach-backup-${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition border border-zinc-700 hover:border-zinc-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Backup
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition border border-zinc-700 hover:border-zinc-500 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4m0 0l-4 4m4-4v12" /></svg>
            Import Backup
            <input 
              type="file" 
              accept="application/json" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const importedState = JSON.parse(event.target?.result as string);
                      if (importedState && importState) {
                        importState(importedState);
                        alert('Backup imported successfully!');
                      }
                    } catch (err) {
                      alert('Failed to parse backup file.');
                    }
                  };
                  reader.readAsText(file);
                }
                e.target.value = '';
              }} 
            />
          </label>
        </div>
      </div>
    </div>
  );
}
