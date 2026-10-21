import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with user agent as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint: AI Review and Scoring for Student Apps
app.post('/api/ai/review-app', async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      appTitle,
      tagline,
      description,
      category,
      githubUrl,
      deploymentUrl,
      demoUrl,
      techStack,
      reflection,
      customRubricCriteria,
    } = req.body;

    if (!appTitle || !description) {
      return res.status(400).json({ error: 'App title and description are required for review.' });
    }

    const prompt = `
Please evaluate this student AI Studio project submission:

Student Name: ${studentName || 'Anonymous Student'}
Student Email: ${studentEmail || 'N/A'}
App Title: ${appTitle}
Tagline: ${tagline || 'N/A'}
Category/Track: ${category || 'General'}
Description: ${description}
Tech Stack & Tools: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'AI Studio'}
GitHub Repository: ${githubUrl || 'N/A'}
Deployment / Live URL: ${deploymentUrl || 'N/A'}
Demo Video/Walkthrough: ${demoUrl || 'N/A'}
Student Self-Reflection & Challenges: ${reflection || 'N/A'}
${customRubricCriteria ? `Special Instructor Focus Criteria: ${customRubricCriteria}` : ''}

Provide a comprehensive, objective, and constructive pedagogical assessment based on standard hackathon & educational rubrics.
Evaluate across four core pillars (each 0 to 25 points, summing to a total score of 0 to 100):
1. Innovation & Creativity (0-25): Uniqueness, thoughtful problem-solving, creative use of AI capabilities.
2. Technical Execution & Architecture (0-25): Sound architecture, effective tech choices, robust integration, attention to edge cases.
3. UI / UX Design & Polish (0-25): User experience clarity, visual aesthetics, intuitive flow, presentation.
4. Practical Utility & Completeness (0-25): Real-world applicability, functional completeness, problem-solution fit.

Provide actionable feedback, key strengths, potential next features, and an encouraging personal note to inspire the student to keep building.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an elite Computer Science educator and AI Hackathon Judge. You grade student AI applications with high academic standards, insightful technical analysis, and warm, constructive encouragement. Your output must follow the structured JSON schema strictly.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: {
              type: Type.INTEGER,
              description: 'Total score from 0 to 100',
            },
            overallVerdict: {
              type: Type.STRING,
              description: 'One of: Exceptional, High Distinction, Proficient, Promising Progress, Needs Revision',
            },
            rubrics: {
              type: Type.OBJECT,
              properties: {
                innovation: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: 'Score out of 25' },
                    feedback: { type: Type.STRING, description: 'Specific feedback on innovation' },
                  },
                  required: ['score', 'feedback'],
                },
                technicalExecution: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: 'Score out of 25' },
                    feedback: { type: Type.STRING, description: 'Specific feedback on technical execution' },
                  },
                  required: ['score', 'feedback'],
                },
                uiUxDesign: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: 'Score out of 25' },
                    feedback: { type: Type.STRING, description: 'Specific feedback on UI/UX' },
                  },
                  required: ['score', 'feedback'],
                },
                practicalUtility: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: 'Score out of 25' },
                    feedback: { type: Type.STRING, description: 'Specific feedback on practical utility' },
                  },
                  required: ['score', 'feedback'],
                },
              },
              required: ['innovation', 'technicalExecution', 'uiUxDesign', 'practicalUtility'],
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 distinct technical or design strengths demonstrated in the app',
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 constructive, actionable improvements the student can implement',
            },
            suggestedNextFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 creative future features to extend this project',
            },
            summary: {
              type: Type.STRING,
              description: 'A 2-3 sentence executive review summary suitable for gradebook reports',
            },
            studentEncouragement: {
              type: Type.STRING,
              description: 'A motivational personal note addressing the student directly',
            },
          },
          required: [
            'totalScore',
            'overallVerdict',
            'rubrics',
            'keyStrengths',
            'areasForImprovement',
            'suggestedNextFeatures',
            'summary',
            'studentEncouragement',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response returned from Gemini API');
    }

    const reviewData = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      review: {
        ...reviewData,
        evaluatedAt: new Date().toISOString(),
        modelUsed: 'gemini-3.8-flash',
      },
    });
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate AI review. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AppGrade AI Backend',
    timestamp: new Date().toISOString(),
  });
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
