export type SubmissionCategory =
  | 'AI Agents & Automation'
  | 'Education & Learning'
  | 'Productivity & Tools'
  | 'Creative & Multimedia'
  | 'Health & Wellness'
  | 'Developer & Cloud Tools'
  | 'Social Impact & Sustainability'
  | 'Other';

export interface RubricScore {
  score: number;
  feedback: string;
}

export interface AIReviewResult {
  totalScore: number;
  overallVerdict: string;
  rubrics: {
    innovation: RubricScore;
    technicalExecution: RubricScore;
    uiUxDesign: RubricScore;
    practicalUtility: RubricScore;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  suggestedNextFeatures: string[];
  summary: string;
  studentEncouragement: string;
  evaluatedAt: string;
  modelUsed: string;
}

export interface TeacherReview {
  finalScore: number;
  feedback: string;
  reviewedAt: string;
  reviewedBy: string;
  verdict: 'Approved' | 'Top Project' | 'Needs Revision' | 'Honorable Mention';
}

export type SubmissionStatus = 'pending' | 'ai_reviewed' | 'graded' | 'needs_revision';

export interface StudentSubmission {
  id: string;
  submittedAt: string;
  studentName: string;
  studentEmail: string;
  appTitle: string;
  tagline: string;
  description: string;
  category: SubmissionCategory;
  githubUrl: string;
  deploymentUrl: string;
  demoUrl?: string;
  techStack: string[];
  reflection: string;
  aiReview?: AIReviewResult;
  teacherReview?: TeacherReview;
  status: SubmissionStatus;
  syncedToSheets?: boolean;
  syncedAt?: string;
}

export interface ConnectedSheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  connectedUserEmail?: string;
}

export interface AppsScriptConfig {
  webhookUrl?: string;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed';
}
