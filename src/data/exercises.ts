import { Exercise } from '../types';

export const EXERCISE_DB: Exercise[] = [
  // CHEST
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    targetMuscleGroup: 'Chest',
    description: 'A classic compound exercise that primarily targets the pectoralis major.',
    formAdvice: 'Keep feet flat on the floor, slightly arch your lower back, and retract your shoulder blades. Lower the bar to your mid-chest and press up explosively.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Mid Chest', 'Compound']
  },
  {
    id: 'ex-chest-2',
    name: 'Incline Dumbbell Bench Press',
    targetMuscleGroup: 'Chest',
    description: 'Targets the upper pectoralis major (clavicular head) more intensely than flat bench.',
    formAdvice: 'Set bench angle to 30-45 degrees. Keep core tight and press the dumbbells straight up over your shoulders, squeezing at the top.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Upper Chest', 'Compound']
  },
  {
    id: 'ex-chest-3',
    name: 'Pec Deck Flyes (Machine)',
    targetMuscleGroup: 'Chest',
    description: 'An isolation exercise excellent for building the inner chest and getting a deep stretch.',
    formAdvice: 'Keep a slight bend in your elbows. Squeeze the pads or handles together, focusing entirely on the chest muscles clamping together.',
    recommendedSetsReps: '3-4 sets of 10-15 reps',
    tags: ['Inner Chest', 'Isolation']
  },
  {
    id: 'ex-chest-4',
    name: 'Cable Crossovers',
    targetMuscleGroup: 'Chest',
    description: 'A continuous-tension isolation exercise for the chest.',
    formAdvice: 'Step forward to stagger your stance. Keep a slight bend in the elbows and bring the handles together as if hugging a large barrel.',
    recommendedSetsReps: '3-4 sets of 12-15 reps',
    tags: ['Lower Chest', 'Isolation']
  },
  
  // BACK
  {
    id: 'ex-3',
    name: 'Pull-Ups',
    targetMuscleGroup: 'Back',
    description: 'A bodyweight exercise that targets the latissimus dorsi and biceps.',
    formAdvice: 'Grab the bar slightly wider than shoulder-width. Pull yourself up until your chin is over the bar. Control the descent.',
    recommendedSetsReps: '3 sets to failure (or 8-12 reps)',
    tags: ['Lats', 'Compound']
  },
  {
    id: 'ex-back-2',
    name: 'Lat Pulldowns',
    targetMuscleGroup: 'Back',
    description: 'A machine-based vertical pull great for those who cannot do pull-ups or want to add volume.',
    formAdvice: 'Lean back slightly and pull the bar down to your upper chest. Focus on driving your elbows down to the floor, not just pulling with your hands.',
    recommendedSetsReps: '3-4 sets of 10-12 reps',
    tags: ['Lats', 'Machine']
  },
  {
    id: 'ex-back-3',
    name: 'Barbell Rows',
    targetMuscleGroup: 'Back',
    description: 'A heavy compound movement targeting the mid-back and lats.',
    formAdvice: 'Keep your back flat and nearly parallel to the floor. Pull the barbell to your lower chest/upper abdomen, squeezing the shoulder blades together.',
    recommendedSetsReps: '4 sets of 6-10 reps',
    tags: ['Mid Back', 'Compound']
  },
  {
    id: 'ex-back-4',
    name: 'Seated Cable Rows',
    targetMuscleGroup: 'Back',
    description: 'A horizontal pull that is excellent for mid-back thickness.',
    formAdvice: 'Maintain an upright posture. Pull the handle to your stomach, retracting your shoulder blades hard at the peak contraction.',
    recommendedSetsReps: '3-4 sets of 10-12 reps',
    tags: ['Mid Back', 'Isolation']
  },

  // LEGS
  {
    id: 'ex-2',
    name: 'Barbell Back Squat',
    targetMuscleGroup: 'Legs',
    description: 'A fundamental lower body compound movement for building leg size and strength.',
    formAdvice: 'Keep chest up, core braced, and descend until your hips are below your knees. Drive through your heels on the way up.',
    recommendedSetsReps: '4 sets of 5-8 reps',
    tags: ['Quads', 'Compound']
  },
  {
    id: 'ex-5',
    name: 'Romanian Deadlift',
    targetMuscleGroup: 'Legs',
    description: 'A hinge movement focusing on the hamstrings and glutes.',
    formAdvice: 'Keep a slight bend in the knees, push hips back to feel a stretch in the hamstrings, then squeeze glutes to stand up.',
    recommendedSetsReps: '3 sets of 8-10 reps',
    tags: ['Hamstrings', 'Compound']
  },
  {
    id: 'ex-legs-3',
    name: 'Leg Press (Machine)',
    targetMuscleGroup: 'Legs',
    description: 'A machine movement allowing massive overload of the quads without lower back fatigue.',
    formAdvice: 'Place feet shoulder-width apart. Lower the weight until your legs are at a 90-degree angle. Do not lock out your knees at the top.',
    recommendedSetsReps: '3-4 sets of 10-15 reps',
    tags: ['Legs', 'Quads', 'Compound', 'Machine']
  },
  {
    id: 'ex-legs-4',
    name: 'Leg Extensions (Machine)',
    targetMuscleGroup: 'Legs',
    description: 'A pure quad isolation exercise.',
    formAdvice: 'Adjust the pad to sit right on your lower shins. Extend your legs fully and squeeze the quads at the top before slowly lowering.',
    recommendedSetsReps: '3-4 sets of 12-15 reps',
    tags: ['Quads', 'Isolation']
  },
  {
    id: 'ex-legs-5',
    name: 'Bulgarian Split Squats',
    targetMuscleGroup: 'Legs',
    description: 'A unilateral movement great for correcting imbalances and targeting quads/glutes.',
    formAdvice: 'Place your rear foot on a bench. Drop your back knee down towards the floor, keeping your front knee tracking over your toes.',
    recommendedSetsReps: '3 sets of 8-12 reps per leg',
    tags: ['Quads', 'Isolation']
  },

  // SHOULDERS
  {
    id: 'ex-4',
    name: 'Overhead Press',
    targetMuscleGroup: 'Shoulders',
    description: 'A compound push exercise that builds anterior deltoids and triceps.',
    formAdvice: 'Keep core tight and glutes squeezed. Press the bar straight up without excessively leaning back.',
    recommendedSetsReps: '3-4 sets of 6-10 reps',
    tags: ['Front Delts', 'Compound']
  },
  {
    id: 'ex-sh-2',
    name: 'Dumbbell Lateral Raises',
    targetMuscleGroup: 'Shoulders',
    description: 'The definitive isolation exercise for the lateral head of the deltoids (broad shoulders).',
    formAdvice: 'Lead with your elbows and raise them out to the side until parallel with the floor. Maintain a slight forward lean.',
    recommendedSetsReps: '4 sets of 12-15 reps',
    tags: ['Side Delts', 'Isolation']
  },
  {
    id: 'ex-sh-3',
    name: 'Reverse Pec Deck / Face Pulls',
    targetMuscleGroup: 'Shoulders',
    description: 'Crucial exercises for rearing delts and posture.',
    formAdvice: 'Focus on retracting the rear deltoids and squeezing at the back. Do not use momentum.',
    recommendedSetsReps: '3 sets of 15 reps',
    tags: ['Rear Delts', 'Isolation']
  },

  // ARMS
  {
    id: 'ex-6',
    name: 'Bicep Curls',
    targetMuscleGroup: 'Biceps',
    description: 'An isolation exercise for the biceps brachii.',
    formAdvice: 'Keep elbows pinned to your sides. Squeeze the biceps at the top and control the eccentric (lowering) phase.',
    recommendedSetsReps: '3 sets of 10-15 reps',
    tags: ['Short Head', 'Isolation']
  },
  {
    id: 'ex-7',
    name: 'Tricep Pushdowns',
    targetMuscleGroup: 'Triceps',
    description: 'A cable machine isolation exercise for the triceps.',
    formAdvice: 'Keep elbows tucked. fully extend the arms at the bottom and spread the rope apart for maximum contraction.',
    recommendedSetsReps: '3 sets of 12-15 reps',
    tags: ['Lateral Head', 'Isolation']
  },
  {
    id: 'ex-arms-3',
    name: 'Concentration Curls',
    targetMuscleGroup: 'Biceps',
    description: 'An isolation exercise that builds the bicep peak by preventing momentum.',
    formAdvice: 'Rest your elbow on the inside of your thigh. Curl the dumbbell smoothly, focusing intensely on the bicep contraction.',
    recommendedSetsReps: '3 sets of 10-12 reps',
    tags: ['Short Head', 'Isolation']
  },
  {
    id: 'ex-arms-4',
    name: 'Preacher Curls (Machine/EZ Bar)',
    targetMuscleGroup: 'Biceps',
    description: 'Immobilizes the arm to isolate the biceps completely.',
    formAdvice: 'Perform on a preacher bench. Do not hyperextend your elbows at the bottom. Keep tension on the muscle.',
    recommendedSetsReps: '3-4 sets of 10-12 reps',
    tags: ['Short Head', 'Isolation']
  },
  {
    id: 'ex-arms-5',
    name: 'Incline Dumbbell Curls',
    targetMuscleGroup: 'Biceps',
    description: 'Places the long head of the bicep under a deep stretch.',
    formAdvice: 'Sit on an incline bench (45 degrees). Let your arms hang straight down behind your torso before curling up.',
    recommendedSetsReps: '3 sets of 10-12 reps',
    tags: ['Long Head', 'Isolation']
  },
  {
    id: 'ex-arms-6',
    name: 'Hammer Curls',
    targetMuscleGroup: 'Biceps',
    description: 'Targets the brachialis and brachioradialis for thicker arms.',
    formAdvice: 'Use a neutral grip (palms facing each other) and curl the weight up. Control the negative.',
    recommendedSetsReps: '3 sets of 10-12 reps',
    tags: ['Brachialis', 'Isolation']
  },
  {
    id: 'ex-arms-7',
    name: 'Overhead Tricep Extensions',
    targetMuscleGroup: 'Triceps',
    description: 'Targets the long head of the tricep by putting it in a stretched position.',
    formAdvice: 'Use a dumbbell or cable. Keep your elbows pointed up and close to your head. Extend the arm fully.',
    recommendedSetsReps: '3 sets of 12-15 reps',
    tags: ['Long Head', 'Isolation']
  },
  {
    id: 'ex-arms-8',
    name: 'Skull Crushers',
    targetMuscleGroup: 'Triceps',
    description: 'A heavy lying tricep extension movement.',
    formAdvice: 'Lie on a bench. Bring the EZ bar down to your forehead by bending the elbows. Press back up without moving the upper arm.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Long Head', 'Compound']
  },

  // CORE
  {
    id: 'ex-8',
    name: 'Plank',
    targetMuscleGroup: 'Core',
    description: 'An isometric core hold.',
    formAdvice: 'Keep your body in a straight line from head to heels. Brace your core as if about to be punched in the stomach.',
    recommendedSetsReps: '3 sets of 30-60 seconds',
    tags: ['Abs', 'Isometric']
  },
  {
    id: 'ex-core-2',
    name: 'Cable Crunches',
    targetMuscleGroup: 'Core',
    description: 'Weighted ab exercise to build thickness in the rectus abdominis.',
    formAdvice: 'Kneel in front of a cable stack. Keep hips stationary and contract your abs to bring your elbows towards your knees.',
    recommendedSetsReps: '3-4 sets of 12-15 reps',
    tags: ['Upper Abs', 'Resistance']
  },
  
  // EXTRA EXERCISES
  {
    id: 'ex-chest-5',
    name: 'Dumbbell Chest Flyes',
    targetMuscleGroup: 'Chest',
    description: 'An isolation exercise for the chest emphasizing the extreme stretch.',
    formAdvice: 'Keep a slight bend in elbows. Lower the dumbbells out to the sides in a wide arc until you feel a stretch, then bring back together.',
    recommendedSetsReps: '3-4 sets of 10-15 reps',
    tags: ['Outer Chest', 'Isolation']
  },
  {
    id: 'ex-legs-6',
    name: 'Hack Squat',
    targetMuscleGroup: 'Legs',
    description: 'A machine squat variation that highly isolates the quadriceps and removes lower back strain.',
    formAdvice: 'Keep your back flat against the pad. Lower until your thighs are breaking parallel, then push through the entire foot.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Quads', 'Compound']
  },
  {
    id: 'ex-back-5',
    name: 'T-Bar Row',
    targetMuscleGroup: 'Back',
    description: 'A heavy, comprehensive back builder focusing on mid-back thickness.',
    formAdvice: 'Bend at the hips while keeping your back straight. Pull the weight towards your upper abdomen, squeezing the shoulder blades.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Mid Back', 'Compound']
  },
  {
    id: 'ex-arms-9',
    name: 'Preacher Curls',
    targetMuscleGroup: 'Biceps',
    description: 'An isolation exercise that locks the arm in place, preventing momentum.',
    formAdvice: 'Sit at a preacher bench. Lower the weight under control until just before the elbow locks out, then curl up aggressively.',
    recommendedSetsReps: '3-4 sets of 10-12 reps',
    tags: ['Short Head', 'Isolation']
  },
  {
    id: 'ex-arms-10',
    name: 'Cable Kickbacks',
    targetMuscleGroup: 'Triceps',
    description: 'Tricep isolation exercise providing constant tension throughout the movement.',
    formAdvice: 'Keep your upper arm parallel to the floor and stationary. Extend the forearm back using only the tricep to pull the weight.',
    recommendedSetsReps: '3-4 sets of 12-15 reps',
    tags: ['Lateral Head', 'Isolation']
  },
  {
    id: 'ex-legs-7',
    name: 'Standing Calf Raises',
    targetMuscleGroup: 'Legs',
    description: 'Isolates the gastrocnemius muscle of the calves.',
    formAdvice: 'Stand with balls of feet on an edge. Lower heels as far as possible, then press up as high as possible.',
    recommendedSetsReps: '4 sets of 15-20 reps',
    tags: ['Gastrocnemius', 'Isolation']
  },
  {
    id: 'ex-legs-8',
    name: 'Seated Calf Raises',
    targetMuscleGroup: 'Legs',
    description: 'Isolates the soleus muscle of the calves.',
    formAdvice: 'Sit on machine with knees bent at 90 degrees. Lower heels, then raise them high.',
    recommendedSetsReps: '4 sets of 15-20 reps',
    tags: ['Soleus', 'Isolation']
  },
  {
    id: 'ex-chest-6',
    name: 'Decline Bench Press',
    targetMuscleGroup: 'Chest',
    description: 'Targets the lower pectoralis major.',
    formAdvice: 'Perform bench press on a decline bench. Push straight up over the lower chest.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Lower Chest', 'Compound']
  },
  {
    id: 'ex-back-6',
    name: 'Chest-Supported Row',
    targetMuscleGroup: 'Back',
    description: 'A row variation that removes lower back strain, isolating the upper back.',
    formAdvice: 'Lie face down on an incline bench. Pull the dumbbells or barbell up, squeezing the shoulder blades together.',
    recommendedSetsReps: '3-4 sets of 10-12 reps',
    tags: ['Mid Back', 'Isolation']
  },
  {
    id: 'ex-shoulders-4',
    name: 'Arnold Press',
    targetMuscleGroup: 'Shoulders',
    description: 'A dumbbell shoulder press variation that increases the range of motion.',
    formAdvice: 'Start with palms facing you. As you press up, rotate arms so palms face away at the top.',
    recommendedSetsReps: '3-4 sets of 8-12 reps',
    tags: ['Front Delts', 'Compound']
  },
  {
    id: 'ex-core-3',
    name: 'Russian Twists',
    targetMuscleGroup: 'Core',
    description: 'Targets the obliques and transverse abdominis.',
    formAdvice: 'Sit on floor, lean back slightly. Hold a weight and twist torso side to side, tapping the ground.',
    recommendedSetsReps: '3 sets of 15-20 reps per side',
    tags: ['Obliques', 'Rotational']
  },
  {
    id: 'ex-core-4',
    name: 'Hanging Leg Raises',
    targetMuscleGroup: 'Core',
    description: 'Advanced core exercise targeting the lower abs.',
    formAdvice: 'Hang from a pull-up bar. Keeping legs straight, raise them until parallel with the floor.',
    recommendedSetsReps: '3 sets of 10-15 reps',
    tags: ['Lower Abs', 'Bodyweight']
  },
  
  // CALISTHENICS
  {
    id: 'ex-cali-1',
    name: 'Push Ups',
    targetMuscleGroup: 'Chest',
    description: 'A fundamental bodyweight exercise for the chest, shoulders, and triceps.',
    formAdvice: 'Keep your core tight and body in a straight line. Lower yourself until your chest nearly touches the floor.',
    recommendedSetsReps: '3 sets to failure',
    tags: ['Bodyweight', 'Compound']
  },
  {
    id: 'ex-cali-2',
    name: 'Pull Ups',
    targetMuscleGroup: 'Back',
    description: 'A foundational bodyweight back exercise targeting the lats and biceps.',
    formAdvice: 'Use an overhand grip slightly wider than shoulder-width. Pull your chin over the bar, controlling the descent.',
    recommendedSetsReps: '3 sets to failure',
    tags: ['Bodyweight', 'Compound']
  },
  {
    id: 'ex-cali-3',
    name: 'Dips',
    targetMuscleGroup: 'Chest',
    description: 'A bodyweight compound exercise for the chest, triceps, and shoulders.',
    formAdvice: 'Lower yourself until your shoulders are below your elbows. Lean forward slightly to target the chest more.',
    recommendedSetsReps: '3 sets of 10-15 reps',
    tags: ['Bodyweight', 'Compound']
  },
  {
    id: 'ex-cali-4',
    name: 'Muscle Ups',
    targetMuscleGroup: 'Back',
    description: 'An advanced bodyweight exercise combining a pull-up and a dip.',
    formAdvice: 'Use a false grip if possible. Explosively pull your chest over the bar and transition smoothly into the dip phase.',
    recommendedSetsReps: '3 sets of 3-8 reps',
    tags: ['Bodyweight', 'Advanced']
  },
  {
    id: 'ex-cali-5',
    name: 'Sit Ups',
    targetMuscleGroup: 'Core',
    description: 'A classic bodyweight abdominal exercise.',
    formAdvice: 'Lie on your back with knees bent. Engage your core to lift your torso towards your thighs, maintaining control.',
    recommendedSetsReps: '3 sets of 20-30 reps',
    tags: ['Bodyweight', 'Abs']
  }
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_DB.find(ex => ex.id === id);
}
