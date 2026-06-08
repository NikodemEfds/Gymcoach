import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Coach API
  app.post("/api/coach", async (req, res) => {
    try {
      const { recentWorkouts, personalBests, nextWorkoutGoal } = req.body;

      if (!recentWorkouts) {
        return res.status(400).json({ error: "No recent workouts provided" });
      }

      const prompt = `You are an expert AI gym coach and personal trainer. 
Here are the user's recent workouts:
${JSON.stringify(recentWorkouts, null, 2)}

Here are their tracked personal bests:
${JSON.stringify(personalBests || {}, null, 2)}

User's goal for next workout:
${nextWorkoutGoal || 'General progression'}

Provide concise, highly actionable feedback in Markdown format. 
Structure your response as follows:
1. **Performance Review**: Briefly commend volume (sets/reps), consistency, and any personal bests.
2. **Form & Variety**: Point out if they are neglecting any muscle groups based on recent history and suggest exercises.
3. **Next Workout Advice**: Suggest a focus or a specific adjustement for the next session (e.g. progressive overload, deload, targeted muscle group).
Keep it motivating, professional, and use bullet points for readability. Do not provide a full routine, just strategic advice.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
            temperature: 0.7,
        }
      });

      res.json({ feedback: response.text });
    } catch (error) {
      console.error('Error generating coach feedback:', error);
      res.status(500).json({ error: "Failed to generate coaching feedback" });
    }
  });

  // Workout Advice API
  app.post("/api/workout-advice", async (req, res) => {
    try {
      const { workout, pbs } = req.body;

      if (!workout) {
        return res.status(400).json({ error: "No workout provided" });
      }

      const prompt = `You are an expert AI gym coach. 
Analyze this specific workout session:
${JSON.stringify(workout, null, 2)}

User's overall Personal Bests:
${JSON.stringify(pbs || {}, null, 2)}

Provide concise, highly actionable feedback in Markdown format about THIS workout.
Focus on the specific exercises, the number of sets, reps, and weights used.
Structure your response as follows:
1. **Highlight Reel**: Point out the best parts, any PBs hit, strong volumes.
2. **Critique & Alterations**: What could have been better? Provide direct advice on whether they should alter anything (e.g. adjust rep ranges, add/remove sets, or change exercises) for their next session.
3. **Session Optimization**: 1-2 tips for the next time they do this specific routine.
Keep it motivating and professional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      res.json({ feedback: response.text });
    } catch (error) {
      console.error('Error generating workout advice:', error);
      res.status(500).json({ error: "Failed to generate workout advice" });
    }
  });

  // Exercise Advice API
  app.post("/api/exercise-advice", async (req, res) => {
    try {
      const { exercise, history } = req.body;

      if (!exercise) {
        return res.status(400).json({ error: "No exercise provided" });
      }

      const prompt = `You are an expert AI gym coach. 
Analyze the user's history and performance for this specific exercise:
Exercise: ${exercise.name} (${exercise.targetMuscleGroup})
History:
${JSON.stringify(history, null, 2)}

Provide concise, highly actionable feedback in Markdown format.
Structure your response as follows:
1. **Trend Analysis**: Are they getting stronger? Plateaus? Volume trends?
2. **Form Check Reminder**: Key form cues specific to this exercise.
3. **Optimizing Set/Reps**: Advice on how to break plateaus or improve performance specifically for this lift.
Keep it motivating and professional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      res.json({ feedback: response.text });
    } catch (error) {
      console.error('Error generating exercise advice:', error);
      res.status(500).json({ error: "Failed to generate exercise advice" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
