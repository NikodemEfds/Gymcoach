export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core' | 'Cardio' | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: MuscleGroup;
  description: string;
  formAdvice: string;
  recommendedSetsReps: string;
  tags?: string[];
}

export interface WorkoutSet {
  id: string;
  reps: number | string;
  weight: number | string;
  isCompleted: boolean;
  isRecord?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO format string
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes?: number;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds?: string[];
  exercises?: WorkoutExercise[];
}

export interface UserProfile {
  username?: string;
  avatarUrl?: string;
}

export interface AppState {
  workouts: WorkoutSession[];
  routines: Routine[];
  themeColor?: string;
  userProfile?: UserProfile;
}
