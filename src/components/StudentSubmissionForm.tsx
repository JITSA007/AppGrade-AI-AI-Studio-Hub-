import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Github,
  Globe,
  Video,
  Code2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Check,
  Plus,
  X,
  ExternalLink,
  Laptop,
  FileCheck,
  Sheet,
} from 'lucide-react';
import { StudentSubmission, SubmissionCategory } from '../types';

interface StudentSubmissionFormProps {
  onSubmit: (submission: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<string>;
  onSwitchToInstructorView: () => void;
  isSheetConnected: boolean;
  hasAppsScriptWebhook: boolean;
}

const CATEGORIES: SubmissionCategory[] = [
  'AI Agents & Automation',
  'Education & Learning',
  'Productivity & Tools',
  'Creative & Multimedia',
  'Health & Wellness',
  'Developer & Cloud Tools',
  'Social Impact & Sustainability',
  'Other',
];

const POPULAR_TAGS = [
  'Gemini 3.8 Flash',
  'Gemini Multimodal',
  'React 19',
  'Tailwind CSS',
  'Vite',
  'Express Server',
  'Firebase Auth',
  'Google Sheets API',
  'Web Speech API',
  'Framer Motion',
  'Canvas API',
];

export const StudentSubmissionForm: React.FC<StudentSubmissionFormProps> = ({
  onSubmit,
  onSwitchToInstructorView,
  isSheetConnected,
  hasAppsScriptWebhook,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubmissionCategory>('AI Agents & Automation');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Gemini 3.8 Flash',
    'React 19',
    'Tailwind CSS',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [reflection, setReflection] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Link validation test
  const [testedLinks, setTestedLinks] = useState<{
    deployment?: boolean;
    github?: boolean;
    demo?: boolean;
  }>({});

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleTestLink = (type: 'deployment' | 'github' | 'demo', url: string) => {
    if (!url) return;
    try {
      new URL(url);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTestedLinks((prev) => ({ ...prev, [type]: true }));
    } catch {
      alert('Please enter a valid URL starting with http:// or https://');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorMessage('Please fill in your name and student email.');
      return;
    }
    if (!appTitle.trim() || !description.trim()) {
      setErrorMessage('Please provide an app title and description.');
      return;
    }
    if (!deploymentUrl.trim() || !githubUrl.trim()) {
      setErrorMessage('Both Live App URL and GitHub Repository URL are required.');
      return;
    }

    try {
      new URL(deploymentUrl);
      new URL(githubUrl);
      if (demoUrl.trim()) new URL(demoUrl);
    } catch {
      setErrorMessage('Please verify that all submitted links are valid URLs (e.g. https://...)');
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await onSubmit({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        appTitle: appTitle.trim(),
        tagline: tagline.trim() || `${category} Project`,
        description: description.trim(),
        category,
        deploymentUrl: deploymentUrl.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        techStack: selectedTags,
        reflection: reflection.trim() || 'No self-reflection submitted.',
      });

      setSubmittedId(newId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit application. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setAppTitle('');
    setTagline('');
    setDescription('');
    setCategory('AI Agents & Automation');
    setDeploymentUrl('');
    setGithubUrl('');
    setDemoUrl('');
    setReflection('');
    setTestedLinks({});
    setSubmittedId(null);
    setErrorMessage(null);
  };

  // Pre-fill quick demo helper
  const handleFillDemoData = () => {
    setStudentName('Devin Thorne');
    setStudentEmail('devin.thorne@campus.edu');
    setAppTitle('OmniNote: AI Lecture Visualizer & Concept Graph');
    setTagline('Transforms recorded audio notes into visual mind maps, flashcards, and interactive quizzes in seconds.');
    setDescription(
      'OmniNote captures classroom lecture audio and notes, leveraging Gemini 3.8 Flash to extract core principles, construct a hierarchical concept graph, and generate active-recall quiz questions with real-time hints. Designed for students with diverse learning styles.'
    );
    setCategory('Education & Learning');
    setDeploymentUrl('https://omninote-ai-demo.run.app');
    setGithubUrl('https://github.com/devinthorne/omninote-ai-studio');
    setDemoUrl('https://youtube.com/watch?v=omninote-demo');
    setSelectedTags(['Gemini 3.8 Flash', 'React 19', 'Tailwind CSS', 'Web Speech API', 'Canvas API']);
    setReflection(
      'Getting the mind map layout physics to balance with live speech transcription latency was tricky. I solved it by running Gemini in streaming mode and updating node clusters incrementally.'
    );
  };

  if (submittedId) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            Submission Received Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Awesome job, {studentName}!
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base mb-6">
            Your AI Studio project <strong className="text-white">"{appTitle}"</strong> has been logged with ID{' '}
            <code className="px-2 py-0.5 rounded bg-slate-900 text-blue-300 font-mono text-xs border border-slate-700">
              {submittedId}
            </code>
            .
          </p>

          {/* Sync status indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">AI Scoring &amp; Rubrics</p>
                <p className="text-slate-400 text-[11px]">Queued for 4-pillar review</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center space-x-2.5">
              <Sheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">Google Sheet Tracking</p>
                <p className="text-slate-400 text-[11px]">
                  {isSheetConnected || hasAppsScriptWebhook
                    ? 'Synced to Instructor Spreadsheet'
                    : 'Queued for Instructor Sync'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSwitchToInstructorView}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>View in Instructor Dashboard</span>
            </button>
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Another App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Student App Submission Form</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Submit Your AI Studio Application
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Provide your live deployment URL, GitHub repository, and project description.
            The instructor will review your work, run the AI rubric evaluator, and sync scores directly to Google Sheets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemoData}
          className="self-start md:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-1.5"
          title="Auto-fill form with sample student submission for testing"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Fill Sample Data</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold">Check your submission</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Submission Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-8"
      >
        {/* Section 1: Student Information */}
        <div>
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
              1
            </span>
            <span>Student Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Student Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. maya.lin@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used for automated Google Apps Script feedback notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: App Overview */}
        <div className="border-t border-slate-700/60 pt-6">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
              2
            </span>
            <span>Application Details</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  App Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="e.g. CodeMentor AI: Real-Time Debugging Companion"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category / Track <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubmissionCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tagline / Elevator Pitch
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One sentence explaining the unique hook of your app"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                App Description &amp; Problem Solved <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does this solve? What are the key features? How does it utilize Gemini or AI Studio capabilities?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Project Links & Deployment */}
        <div className="border-t border-slate-700/60 pt-6">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
              3
            </span>
            <span>Deployment &amp; Repository Links</span>
          </h3>

          <div className="space-y-4">
            {/* Live App Link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Live App / Deployment URL <span className="text-rose-400">*</span>
                  </span>
                </label>
                {deploymentUrl && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('deployment', deploymentUrl)}
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="url"
                required
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                placeholder="https://ais-dev-...run.app or your hosting URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-xs transition-all"
              />
            </div>

            {/* GitHub Repo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    GitHub Repository URL <span className="text-rose-400">*</span>
                  </span>
                </label>
                {githubUrl && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('github', githubUrl)}
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
                  >
                    <span>Test Repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="url"
                required
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/project-repo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-xs transition-all"
              />
            </div>

            {/* Demo Video Link (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Demo Video or Loom Walkthrough (Optional)</span>
                </label>
                {demoUrl && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('demo', demoUrl)}
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
                  >
                    <span>Watch Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Tech Stack & Tools */}
        <div className="border-t border-slate-700/60 pt-6">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
              4
            </span>
            <span>Technologies &amp; AI Models Used</span>
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Select the technologies used in your project or add custom libraries:
          </p>

          {/* Active Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Quick Select Presets */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {POPULAR_TAGS.filter((t) => !selectedTags.includes(t)).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border border-slate-700/70 text-xs transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>{tag}</span>
              </button>
            ))}
          </div>

          {/* Add custom tag */}
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Add other library/API..."
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 5: Student Reflection */}
        <div className="border-t border-slate-700/60 pt-6">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
              5
            </span>
            <span>Self-Reflection &amp; Challenges</span>
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            What was the hardest bug or architectural hurdle you overcame? (This heavily boosts your AI Technical Execution score!)
          </p>
          <textarea
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="e.g. Prompt engineering for consistent JSON schema responses, handling edge case user inputs, or integrating real-time streaming audio..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Submit Actions */}
        <div className="border-t border-slate-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Submissions automatically trigger AI Rubric Analysis &amp; Google Sheets sync.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording Submission...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit AI Studio Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
