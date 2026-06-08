import { useState, useEffect } from 'react';
import { WorkoutSession, Routine, AppState } from '../types';

const STORAGE_KEY = 'v1_gym_coach_state';

const defaultState: AppState = {
  workouts: [],
  routines: [
    {
      id: 'r-1',
      name: 'Push Day (Chest, Shoulders, Triceps)',
      exerciseIds: ['ex-1', 'ex-4', 'ex-7']
    },
    {
      id: 'r-2',
      name: 'Pull Day (Back, Biceps)',
      exerciseIds: ['ex-3', 'ex-6']
    },
    {
      id: 'r-3',
      name: 'Leg Day',
      exerciseIds: ['ex-2', 'ex-5']
    }
  ],
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

let globalState: AppState = defaultState;
try {
  const item = window.localStorage.getItem(STORAGE_KEY);
  if (item) {
    globalState = JSON.parse(item);
  }
} catch (error) {
  console.warn('Error reading localStorage', error);
}

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: AppState) => AppState) {
  globalState = updater(globalState);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (error) {
    console.warn('Error setting localStorage', error);
  }
  notify();
}

export function useGymStore() {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    const listener = () => setState(globalState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addWorkout = (workout: Omit<WorkoutSession, 'id'>) => {
    const newWorkout: WorkoutSession = { ...workout, id: generateId() };
    updateState(prev => ({
      ...prev,
      workouts: [newWorkout, ...prev.workouts]
    }));
  };

  const updateWorkout = (updatedWorkout: WorkoutSession) => {
    updateState(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w)
    }));
  };

  const removeWorkout = (id: string) => {
    updateState(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id)
    }));
  };

  const addRoutine = (routine: Omit<Routine, 'id'>) => {
    const newRoutine: Routine = { ...routine, id: generateId() };
    updateState(prev => ({
      ...prev,
      routines: [...prev.routines, newRoutine]
    }));
  };
  
  const removeRoutine = (id: string) => {
    updateState(prev => ({
      ...prev,
      routines: prev.routines.filter(r => r.id !== id)
    }));
  };

  const setThemeColor = (color: string) => {
    updateState(prev => ({
      ...prev,
      themeColor: color
    }));
  };

  const updateUserProfile = (profile: Partial<import('../types').UserProfile>) => {
    updateState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profile }
    }));
  };

  const importState = (importedState: AppState) => {
    updateState(() => importedState);
  };

  return {
    state,
    workouts: state.workouts,
    routines: state.routines,
    themeColor: state.themeColor || '#D9FF00',
    userProfile: state.userProfile,
    addWorkout,
    updateWorkout,
    removeWorkout,
    addRoutine,
    removeRoutine,
    setThemeColor,
    updateUserProfile,
    importState
  };
}
