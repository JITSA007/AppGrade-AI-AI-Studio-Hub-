import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Sheet,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Globe,
  Video,
  Download,
  LayoutGrid,
  List,
  RefreshCw,
  Plus,
  Sliders,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentSubmission, SubmissionCategory, ConnectedSheetConfig } from '../types';

interface InstructorDashboardProps {
  submissions: StudentSubmission[];
  onOpenReviewModal: (submission: StudentSubmission) => void;
  onOpenSandboxModal: (url: string, title: string) => void;
  onOpenSheetsModal: () => void;
  onOpenAppsScriptModal: () => void;
  onQuickSyncSheets: () => void;
  isSyncingSheets: boolean;
  sheetConfig: ConnectedSheetConfig | null;
  onSwitchToStudentView: () => void;
  onBatchAiEvaluate: () => Promise<void>;
  isBatchEvaluating: boolean;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  submissions,
  onOpenReviewModal,
  onOpenSandboxModal,
  onOpenSheetsModal,
  onOpenAppsScriptModal,
  onQuickSyncSheets,
  isSyncingSheets,
  sheetConfig,
  onSwitchToStudentView,
  onBatchAiEvaluate,
  isBatchEvaluating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low' | 'name'>(
    'newest'
  );
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Metrics computation
  const metrics = useMemo(() => {
    const total = submissions.length;
    const aiReviewed = submissions.filter((s) => s.aiReview).length;
    const teacherGraded = submissions.filter((s) => s.teacherReview).length;
    const synced = submissions.filter((s) => s.syncedToSheets).length;

    const scores = submissions
      .map((s) => s.teacherReview?.finalScore ?? s.aiReview?.totalScore)
      .filter((s): s is number => typeof s === 'number');

    const avgScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;

    const pendingAi = submissions.filter((s) => !s.aiReview).length;

    return { total, aiReviewed, teacherGraded, synced, avgScore, pendingAi };
  }, [submissions]);

  // Filtered & sorted submissions
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        const matchesSearch =
          sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.appTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat =
          selectedCategory === 'all' || sub.category === selectedCategory;

        const matchesStatus =
          selectedStatus === 'all' ||
          (selectedStatus === 'pending' && !sub.aiReview) ||
          (selectedStatus === 'ai_reviewed' && sub.aiReview && !sub.teacherReview) ||
          (selectedStatus === 'graded' && sub.teacherReview);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        }
        if (sortBy === 'score_high') {
          const scoreA = a.teacherReview?.finalScore ?? a.aiReview?.totalScore ?? -1;
          const scoreB = b.teacherReview?.finalScore ?? b.aiReview?.totalScore ?? -1;
          return scoreB - scoreA;
        }
        if (sortBy === 'score_low') {
          const scoreA = a.teacherReview?.finalScore ?? a.aiReview?.totalScore ?? 999;
          const scoreB = b.teacherReview?.finalScore ?? b.aiReview?.totalScore ?? 999;
          return scoreA - scoreB;
        }
        if (sortBy === 'name') {
          return a.studentName.localeCompare(b.studentName);
        }
        return 0;
      });
  }, [submissions, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // CSV Export utility
  const handleExportCsv = () => {
    const headers = [
      'Submission ID',
      'Student Name',
      'Student Email',
      'App Title',
      'Category',
      'Deployment URL',
      'GitHub URL',
      'AI Score',
      'Innovation',
      'Technical',
      'UI/UX',
      'Utility',
      'Teacher Score',
      'Teacher Verdict',
      'Status',
    ];

    const rows = filteredSubmissions.map((s) => [
      s.id,
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.studentEmail,
      `"${s.appTitle.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.deploymentUrl,
      s.githubUrl,
      s.aiReview?.totalScore ?? '',
      s.aiReview?.rubrics.innovation.score ?? '',
      s.aiReview?.rubrics.technicalExecution.score ?? '',
      s.aiReview?.rubrics.uiUxDesign.score ?? '',
      s.aiReview?.rubrics.practicalUtility.score ?? '',
      s.teacherReview?.finalScore ?? '',
      s.teacherReview?.verdict ?? '',
      s.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Studio_Submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
          Pending AI
        </span>
      );
    }
    let colorClasses = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 90) colorClasses = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    else if (score >= 80) colorClasses = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    else if (score >= 70) colorClasses = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

    return (
      <span
        className={`px-2.5 py-1 rounded-full border text-xs font-bold inline-flex items-center space-x-1 ${colorClasses}`}
      >
        <Sparkles className="w-3 h-3" />
        <span>{score}/100</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner: Metrics & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Instructor Review &amp; Grading Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student AI Studio Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Evaluate apps with Gemini 3.8 Flash rubrics, assign mentor feedback, and sync to Google Sheets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {metrics.pendingAi > 0 && (
            <button
              onClick={onBatchAiEvaluate}
              disabled={isBatchEvaluating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center space-x-2 disabled:opacity-50"
              title="Run AI review on all pending submissions sequentially"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBatchEvaluating ? 'animate-spin' : ''}`} />
              <span>
                {isBatchEvaluating
                  ? 'Batch Evaluating...'
                  : `AI Evaluate All (${metrics.pendingAi})`}
              </span>
            </button>
          )}

          {sheetConfig ? (
            <button
              onClick={onQuickSyncSheets}
              disabled={isSyncingSheets}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-medium text-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin text-emerald-400' : ''}`}
              />
              <span>{isSyncingSheets ? 'Syncing...' : 'Sync to Sheets'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSheetsModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 font-medium text-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <Sheet className="w-3.5 h-3.5" />
              <span>Connect Google Sheets</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
            title="Download submissions as CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Submissions
          </span>
          <div className="text-2xl font-black text-white">{metrics.total}</div>
          <span className="text-[11px] text-blue-400 mt-1 block">Active Student Cohort</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            AI Evaluated
          </span>
          <div className="text-2xl font-black text-indigo-400">
            {metrics.aiReviewed}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {metrics.total}
            </span>
          </div>
          <span className="text-[11px] text-indigo-300 mt-1 block">
            {metrics.total > 0
              ? `${Math.round((metrics.aiReviewed / metrics.total) * 100)}% analyzed`
              : 'None'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Instructor Graded
          </span>
          <div className="text-2xl font-black text-purple-400">
            {metrics.teacherGraded}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {metrics.total}
            </span>
          </div>
          <span className="text-[11px] text-purple-300 mt-1 block">Final Mentor Reviews</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cohort Avg Score
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {metrics.avgScore !== null ? `${metrics.avgScore}` : '--'}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <span className="text-[11px] text-emerald-300 mt-1 block">Across evaluated apps</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Sheets Synced
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {metrics.synced}
            <span className="text-xs font-normal text-slate-400"> / {metrics.total}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {sheetConfig ? sheetConfig.title : 'Not Connected'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, app title, email, or tech (e.g. Gemini, React)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Tracks / Categories</option>
              <option value="AI Agents & Automation">AI Agents &amp; Automation</option>
              <option value="Education & Learning">Education &amp; Learning</option>
              <option value="Productivity & Tools">Productivity &amp; Tools</option>
              <option value="Creative & Multimedia">Creative &amp; Multimedia</option>
              <option value="Health & Wellness">Health &amp; Wellness</option>
              <option value="Developer & Cloud Tools">Developer &amp; Cloud Tools</option>
              <option value="Social Impact & Sustainability">Social Impact</option>
              <option value="Other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending AI Review</option>
              <option value="ai_reviewed">AI Evaluated (No Teacher Grade)</option>
              <option value="graded">Instructor Graded</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Score: High to Low</option>
              <option value="score_low">Score: Low to High</option>
              <option value="name">Student Name (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid card view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Spreadsheet table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-750">
          <span>
            Showing <strong>{filteredSubmissions.length}</strong> of{' '}
            <strong>{submissions.length}</strong> student project submissions
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Submissions List: Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((sub) => {
            const displayScore = sub.teacherReview?.finalScore ?? sub.aiReview?.totalScore;

            return (
              <div
                key={sub.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Score */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-blue-300 border border-slate-700 truncate max-w-[170px]">
                      {sub.category}
                    </span>
                    {getScoreBadge(displayScore)}
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {sub.appTitle}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {sub.tagline || sub.description}
                    </p>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-750 text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                        {sub.studentName[0]}
                      </div>
                      <span className="font-medium text-slate-200 truncate max-w-[120px]">
                        {sub.studentName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-1">
                    {sub.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                    {sub.techStack.length > 3 && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-slate-900 text-slate-400">
                        +{sub.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Rubric mini preview if evaluated */}
                  {sub.aiReview && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>AI Rubrics</span>
                        <span className="font-bold text-slate-200">
                          {sub.aiReview.overallVerdict}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                        <div className="p-1 rounded bg-slate-800 text-amber-300" title="Innovation">
                          In: {sub.aiReview.rubrics.innovation.score}
                        </div>
                        <div className="p-1 rounded bg-slate-800 text-blue-300" title="Technical">
                          Te: {sub.aiReview.rubrics.technicalExecution.score}
                        </div>
                        <div className="p-1 rounded bg-slate-800 text-purple-300" title="UI/UX">
                          UX: {sub.aiReview.rubrics.uiUxDesign.score}
                        </div>
                        <div className="p-1 rounded bg-slate-800 text-emerald-300" title="Utility">
                          Ut: {sub.aiReview.rubrics.practicalUtility.score}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback snippet if available */}
                  {sub.teacherReview && (
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300">
                      <span className="font-semibold text-indigo-300">
                        {sub.teacherReview.verdict}:
                      </span>{' '}
                      <span className="italic line-clamp-1">"{sub.teacherReview.feedback}"</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onOpenSandboxModal(sub.deploymentUrl, sub.appTitle)}
                      title="Test Live App in Sandbox"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-blue-300 hover:bg-slate-750 border border-slate-700 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="View GitHub Repository"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                    {sub.syncedToSheets && (
                      <span
                        title="Synced to Google Sheet"
                        className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                      >
                        <Sheet className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenReviewModal(sub)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>{sub.teacherReview ? 'Edit Grade' : 'Review & Grade'}</span>
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">App Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">AI Score</th>
                  <th className="py-3 px-4 text-center">Teacher Grade</th>
                  <th className="py-3 px-4">Links</th>
                  <th className="py-3 px-4 text-center">Sheet Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-750 font-normal">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{sub.studentName}</div>
                      <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {sub.appTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{sub.tagline}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-blue-300 border border-slate-700 text-[10px]">
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getScoreBadge(sub.aiReview?.totalScore)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.teacherReview ? (
                        <span className="font-bold text-purple-300">
                          {sub.teacherReview.finalScore}/100
                        </span>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onOpenSandboxModal(sub.deploymentUrl, sub.appTitle)}
                          className="p-1 rounded bg-slate-900 text-blue-300 hover:text-blue-200"
                          title="Preview Live App"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                          title="GitHub"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.syncedToSheets ? (
                        <span className="inline-flex items-center text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>Synced</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenReviewModal(sub)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Search / Filter State */}
      {filteredSubmissions.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No matching submissions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms or filter selections, or invite students to submit their apps using the Student Portal.
          </p>
          <button
            onClick={onSwitchToStudentView}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Student Submission Form</span>
          </button>
        </div>
      )}
    </div>
  );
};
