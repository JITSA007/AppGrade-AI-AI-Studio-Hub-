import { StudentSubmission } from '../types';

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'SUB-2026-001',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    studentName: 'Sarah Chen',
    studentEmail: 'sarah.chen@university.edu',
    appTitle: 'EcoScan AI: Real-Time Recycling & Waste Classifier',
    tagline: 'Point your camera at any waste item to get instant sorting rules and carbon impact analysis.',
    description:
      'EcoScan AI uses multimodal Gemini 2.5 / 3.8 Flash to identify garbage, recyclables, compost, and hazardous e-waste from photos. It provides localized municipality recycling guidelines, carbon footprint metrics, and tips for repurposing items before discarding.',
    category: 'Social Impact & Sustainability',
    githubUrl: 'https://github.com/sarahchen/ecoscan-ai-studio',
    deploymentUrl: 'https://ecoscan-demo.run.app',
    demoUrl: 'https://youtube.com/watch?v=sample-demo-1',
    techStack: ['Gemini Multimodal API', 'React 19', 'Tailwind CSS', 'Vite', 'Camera Web API'],
    reflection:
      'The hardest challenge was handling low-light webcam frames and multi-material packaging (e.g., coffee cups with plastic lids). I solved it by prompting Gemini to decompose item parts and score recyclability separately.',
    status: 'graded',
    aiReview: {
      totalScore: 94,
      overallVerdict: 'Exceptional',
      rubrics: {
        innovation: {
          score: 24,
          feedback:
            'Outstanding real-world application combining environmental stewardship with multimodal reasoning.',
        },
        technicalExecution: {
          score: 23,
          feedback:
            'Solid component architecture, graceful webcam error fallbacks, and fast prompt streaming.',
        },
        uiUxDesign: {
          score: 24,
          feedback:
            'High-contrast accessible badges for recycling categories and smooth live camera overlays.',
        },
        practicalUtility: {
          score: 23,
          feedback:
            'Immediate daily utility for university campuses and dormitories seeking zero-waste goals.',
        },
      },
      keyStrengths: [
        'Robust multi-material decomposition in camera inputs',
        'Clean UI with clear color-coded bin guidance',
        'Fast response times under 900ms using Flash model',
      ],
      areasForImprovement: [
        'Add geolocation support to automatically look up city-specific recycling regulations',
        'Add offline mode caching for common household items',
      ],
      suggestedNextFeatures: [
        'Barcode scanner barcode-to-material fallback lookup',
        'Campus dorm leaderboard with monthly plastic reduction tracking',
      ],
      summary:
        'A polished, production-ready sustainability app that effectively harnesses multimodal Gemini vision for practical civic benefit.',
      studentEncouragement:
        'Sarah, your thoughtful decomposition of multi-layer packaging shows mature systems thinking. Outstanding work—this would excel in any university tech showcase!',
      evaluatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      modelUsed: 'gemini-3.8-flash',
    },
    teacherReview: {
      finalScore: 96,
      verdict: 'Top Project',
      feedback:
        'Exemplary execution! Sarah went beyond basic object detection to solve practical recycling ambiguity. Highly recommended for the Departmental Showcase.',
      reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      reviewedBy: 'Prof. Miller',
    },
    syncedToSheets: true,
    syncedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'SUB-2026-002',
    submittedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera99@student.edu',
    appTitle: 'DevPulse: Real-Time Developer Focus & Burnout Radar',
    tagline: 'Connects your GitHub commits and coding sprints to detect fatigue patterns and recommend micro-breaks.',
    description:
      'DevPulse analyzes Git commit timestamps, pull request velocity, and self-reported energy levels using Gemini AI. It identifies cognitive fatigue patterns and suggests personalized recovery sprints and ergonomics adjustments.',
    category: 'Developer & Cloud Tools',
    githubUrl: 'https://github.com/alexrivera/devpulse-studio',
    deploymentUrl: 'https://devpulse.run.app',
    demoUrl: 'https://loom.com/share/devpulse-walkthrough',
    techStack: ['React', 'Express', 'Gemini Flash', 'GitHub API', 'Recharts'],
    reflection:
      'I learned how to write strict JSON schemas for Gemini so the radar chart always receives normalized numeric vectors. Designing the privacy guarantees was also eye-opening.',
    status: 'ai_reviewed',
    aiReview: {
      totalScore: 89,
      overallVerdict: 'High Distinction',
      rubrics: {
        innovation: {
          score: 23,
          feedback:
            'Novel synthesis of developer telemetry with empathetic mental health coaching.',
        },
        technicalExecution: {
          score: 22,
          feedback:
            'Structured output parsing and clean server proxying for GitHub and Gemini APIs.',
        },
        uiUxDesign: {
          score: 22,
          feedback:
            'Dark mode developer aesthetic with sleek charts, though summary text blocks could use tighter line heights.',
        },
        practicalUtility: {
          score: 22,
          feedback:
            'Very high utility for remote engineering teams and crunch periods.',
        },
      },
      keyStrengths: [
        'Thoughtful privacy posture (no source code content uploaded, only commit metadata)',
        'Insightful sprint pacing charts',
        'Actionable micro-break prompts',
      ],
      areasForImprovement: [
        'Provide export options for 1-on-1 mentor syncs',
        'Add integration with Slack status or IDE extension',
      ],
      suggestedNextFeatures: [
        'VS Code companion plugin for ambient Pomodoro prompts',
        'Team-wide aggregated anonymous burnout alerts',
      ],
      summary:
        'A compelling developer productivity tool that couples git telemetry with empathetic AI wellness coaching.',
      studentEncouragement:
        'Alex, focusing on developer well-being is vital. Your strict JSON schema integration shows excellent backend discipline. Keep polishing the chart interactions!',
      evaluatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      modelUsed: 'gemini-3.8-flash',
    },
    syncedToSheets: false,
  },
  {
    id: 'SUB-2026-003',
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
    studentName: 'Priyah Patel',
    studentEmail: 'priyah.patel@tech.edu',
    appTitle: 'StoryForge: Adaptive STEM Adventure Generator for Kids',
    tagline: 'Interactive choose-your-own-adventure stories where physics and coding puzzles unlock the next chapter.',
    description:
      'StoryForge creates dynamic personalized stories for young learners. As children read, characters encounter real STEM challenges (like calculating orbital trajectories or debugging logic gates). Gemini generates age-tailored puzzles and branches the storyline dynamically.',
    category: 'Education & Learning',
    githubUrl: 'https://github.com/priyah-p/storyforge-stem',
    deploymentUrl: 'https://storyforge-kids.run.app',
    demoUrl: '',
    techStack: ['React 19', 'Gemini Flash', 'Web Speech API', 'Tailwind CSS', 'Framer Motion'],
    reflection:
      'Calibrating puzzle difficulty for 8-12 year olds required prompt iteration. I implemented safety guardrails to ensure educational age-appropriateness.',
    status: 'pending',
    syncedToSheets: false,
  },
];
