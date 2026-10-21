import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Github,
  Globe,
  Video,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Send,
  RefreshCw,
  Sliders,
  MessageSquare,
  Sheet,
  User,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StudentSubmission, AIReviewResult, TeacherReview, RubricScore } from '../types';

interface SubmissionReviewModalProps {
  submission: StudentSubmission;
  onClose: () => void;
  onSaveReview: (
    submissionId: string,
    aiReview: AIReviewResult | undefined,
    teacherReview: TeacherReview | undefined
  ) => Promise<void>;
  onOpenSandbox: (url: string, title: string) => void;
  isSheetConnected: boolean;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  submission,
  onClose,
  onSaveReview,
  onOpenSandbox,
  isSheetConnected,
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [currentAiReview, setCurrentAiReview] = useState<AIReviewResult | undefined>(
    submission.aiReview
  );

  // Teacher feedback form state
  const [teacherScore, setTeacherScore] = useState<number>(
    submission.teacherReview?.finalScore ?? submission.aiReview?.totalScore ?? 85
  );
  const [teacherVerdict, setTeacherVerdict] = useState<
    'Approved' | 'Top Project' | 'Needs Revision' | 'Honorable Mention'
  >(submission.teacherReview?.verdict || 'Approved');
  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    submission.teacherReview?.feedback || ''
  );
  const [teacherName, setTeacherName] = useState<string>(
    submission.teacherReview?.reviewedBy || 'Instructor'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Trigger Gemini AI Review API
  const handleRunAiReview = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/review-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: submission.studentName,
          studentEmail: submission.studentEmail,
          appTitle: submission.appTitle,
          tagline: submission.tagline,
          description: submission.description,
          category: submission.category,
          githubUrl: submission.githubUrl,
          deploymentUrl: submission.deploymentUrl,
          demoUrl: submission.demoUrl,
          techStack: submission.techStack,
          reflection: submission.reflection,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete AI review');
      }

      setCurrentAiReview(data.review);
      // Auto-populate teacher score if not manually graded yet
      if (!submission.teacherReview) {
        setTeacherScore(data.review.totalScore);
        if (data.review.totalScore >= 92) {
          setTeacherVerdict('Top Project');
        } else if (data.review.totalScore >= 75) {
          setTeacherVerdict('Approved');
        } else {
          setTeacherVerdict('Needs Revision');
        }
      }
    } catch (err: any) {
      setAiError(err.message || 'Error communicating with AI Review server');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAndSync = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const teacherReviewObj: TeacherReview = {
        finalScore: Number(teacherScore),
        verdict: teacherVerdict,
        feedback: teacherFeedback.trim() || 'Reviewed by instructor.',
        reviewedAt: new Date().toISOString(),
        reviewedBy: teacherName.trim() || 'Instructor',
      };

      await onSaveReview(submission.id, currentAiReview, teacherReviewObj);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 80) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const quickFeedbackSnippets = [
    'Outstanding architectural execution and responsive design!',
    'Great problem formulation; consider adding user onboarding hints.',
    'Innovative use of Gemini multimodal reasoning for this domain.',
    'Solid baseline; refine edge case validation and error handling.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white truncate max-w-md">
                  {submission.appTitle}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {submission.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted by <strong className="text-slate-200">{submission.studentName}</strong> (
                {submission.studentEmail}) &bull; {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Link Pills */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <span className="font-semibold text-slate-400 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Project Links:</span>
            </span>

            <a
              href={submission.deploymentUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>Live App</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => onOpenSandbox(submission.deploymentUrl, submission.appTitle)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>Live Sandbox Preview</span>
              <Sliders className="w-3 h-3" />
            </button>

            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {submission.demoUrl && (
              <a
                href={submission.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Demo Video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="ml-auto text-[11px] text-slate-400">
              Track: <span className="font-semibold text-slate-200">{submission.category}</span>
            </div>
          </div>

          {/* App Overview & Reflection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Description &amp; Problem Solved</span>
              </h4>
              <p className="text-xs text-slate-400 italic">"{submission.tagline}"</p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {submission.description}
              </p>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Tech Stack:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {submission.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700 text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Student Reflection &amp; Engineering Hurdle</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {submission.reflection || 'No reflection recorded.'}
              </p>
            </div>
          </div>

          {/* AI Rubric Scoring & Evaluation Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-800/40 border border-indigo-500/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-amber-300 border border-indigo-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                    <span>Gemini AI Pedagogical Rubric Assessment</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      gemini-3.8-flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluates Innovation, Technical Architecture, UI/UX, and Practical Utility.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAiReview}
                disabled={isAiLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/20 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isAiLoading
                    ? 'Analyzing Project with Gemini...'
                    : currentAiReview
                    ? 'Re-evaluate with AI'
                    : 'Run AI Evaluation & Scoring'}
                </span>
              </button>
            </div>

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {currentAiReview ? (
              <div className="space-y-5">
                {/* Score & Verdict banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-700/80">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`text-3xl font-extrabold px-4 py-2 rounded-xl border ${getScoreColor(
                        currentAiReview.totalScore
                      )}`}
                    >
                      {currentAiReview.totalScore}
                      <span className="text-xs font-normal text-slate-400 ml-1">/100</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        AI Overall Verdict
                      </span>
                      <span className="text-base font-bold text-white">
                        {currentAiReview.overallVerdict}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Evaluated on{' '}
                    <span className="text-slate-300">
                      {new Date(currentAiReview.evaluatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Innovation & Creativity',
                      item: currentAiReview.rubrics.innovation,
                      color: 'from-amber-500 to-amber-600',
                      textColor: 'text-amber-400',
                    },
                    {
                      label: 'Technical Execution',
                      item: currentAiReview.rubrics.technicalExecution,
                      color: 'from-blue-500 to-blue-600',
                      textColor: 'text-blue-400',
                    },
                    {
                      label: 'UI / UX Design',
                      item: currentAiReview.rubrics.uiUxDesign,
                      color: 'from-purple-500 to-purple-600',
                      textColor: 'text-purple-400',
                    },
                    {
                      label: 'Practical Utility',
                      item: currentAiReview.rubrics.practicalUtility,
                      color: 'from-emerald-500 to-emerald-600',
                      textColor: 'text-emerald-400',
                    },
                  ].map(({ label, item, color, textColor }) => (
                    <div
                      key={label}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-300">{label}</span>
                          <span className={`font-bold ${textColor}`}>
                            {item.score} / 25
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                          <div
                            className={`h-full bg-gradient-to-r ${color}`}
                            style={{ width: `${(item.score / 25) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {item.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Strengths & Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <h5 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Engineering Strengths</span>
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {currentAiReview.keyStrengths.map((str, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <h5 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Actionable Next Steps &amp; Improvements</span>
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {currentAiReview.areasForImprovement.map((imp, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Summary & Encouragement letter */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Gradebook Executive Summary
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {currentAiReview.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-indigo-300 block mb-1">
                      Personalized Note to Student:
                    </span>
                    <p className="text-xs text-slate-300 italic bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20">
                      "{currentAiReview.studentEncouragement}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-700">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  Ready for AI Pedagogical Review
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Click the button above to have Gemini 3.8 Flash analyze the student's problem statement,
                  architecture, tech stack, and reflection across 4 standardized criteria.
                </p>
              </div>
            )}
          </div>

          {/* Instructor Final Review & Override Section */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Instructor Final Grade &amp; Mentor Feedback
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Instructor Final Score (/100)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={teacherScore}
                    onChange={(e) => setTeacherScore(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400">
                    {currentAiReview
                      ? `(AI suggested: ${currentAiReview.totalScore})`
                      : '(Suggested out of 100)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Review Verdict
                </label>
                <select
                  value={teacherVerdict}
                  onChange={(e) =>
                    setTeacherVerdict(
                      e.target.value as
                        | 'Approved'
                        | 'Top Project'
                        | 'Needs Revision'
                        | 'Honorable Mention'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Approved">Approved (Meets Rubric)</option>
                  <option value="Top Project">Top Project (Showcase Worthy)</option>
                  <option value="Honorable Mention">Honorable Mention</option>
                  <option value="Needs Revision">Needs Revision (Iterate &amp; Resubmit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Prof. / Instructor Name"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Personalized Instructor Feedback</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Visible to student &amp; saved to Google Sheet
                </span>
              </div>
              <textarea
                rows={3}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Write specific notes on code quality, design choices, presentation, or next semester roadmap..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickFeedbackSnippets.map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setTeacherFeedback((prev) => (prev ? `${prev}\n${snippet}` : snippet))
                    }
                    className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border border-slate-700/60 text-[10px] transition-colors"
                  >
                    + {snippet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isSheetConnected
                ? 'Saving will auto-sync scores directly to your connected Google Sheet.'
                : 'Connect Google Sheets in the navbar to enable automatic live sync.'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndSync}
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving &amp; Syncing...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved &amp; Synced!</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>Save Review &amp; Sync</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
