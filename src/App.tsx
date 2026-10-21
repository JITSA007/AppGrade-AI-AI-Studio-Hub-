import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentSubmissionForm } from './components/StudentSubmissionForm';
import { InstructorDashboard } from './components/InstructorDashboard';
import { SubmissionReviewModal } from './components/SubmissionReviewModal';
import { GoogleSheetsConnectModal } from './components/GoogleSheetsConnectModal';
import { AppsScriptAutomationModal } from './components/AppsScriptAutomationModal';
import { LiveAppPreviewModal } from './components/LiveAppPreviewModal';
import {
  StudentSubmission,
  ConnectedSheetConfig,
  AppsScriptConfig,
  AIReviewResult,
  TeacherReview,
} from './types';
import { INITIAL_SUBMISSIONS } from './data/mockData';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from './services/firebaseAuth';
import {
  createGradingSpreadsheet,
  appendSubmissionToSheet,
  syncAllSubmissionsToSheet,
  sendToAppsScriptWebhook,
} from './services/sheetsApi';
import { CheckCircle2, AlertCircle, Info, Sparkles, Sheet } from 'lucide-react';

const STORAGE_KEY_SUBMISSIONS = 'appgrade_submissions_v1';
const STORAGE_KEY_SHEET = 'appgrade_sheet_config_v1';
const STORAGE_KEY_APPSSCRIPT = 'appgrade_appsscript_config_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');

  // Load submissions from localStorage or fallback to realistic initial mock data
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved submissions', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  // Google Sheets integration state
  const [sheetConfig, setSheetConfig] = useState<ConnectedSheetConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHEET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse sheet config', e);
    }
    return null;
  });

  // Google Apps Script Webhook config
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPSSCRIPT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse Apps Script config', e);
    }
    return {};
  });

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);

  // Modals
  const [selectedReviewSub, setSelectedReviewSub] = useState<StudentSubmission | null>(null);
  const [sandboxModal, setSandboxModal] = useState<{ url: string; title: string } | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);

  // In-app banner / toast notification
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (sheetConfig) {
      localStorage.setItem(STORAGE_KEY_SHEET, JSON.stringify(sheetConfig));
    } else {
      localStorage.removeItem(STORAGE_KEY_SHEET);
    }
  }, [sheetConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPSSCRIPT, JSON.stringify(appsScriptConfig));
  }, [appsScriptConfig]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign in
  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        showToast(`Signed in as ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Google sign-in failed', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      showToast('Signed out of Google account', 'info');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Student Submission Form Submit
  const handleStudentSubmit = async (
    data: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<string> => {
    const newId = `SUB-2026-${String(submissions.length + 1).padStart(3, '0')}`;
    const newSubmission: StudentSubmission = {
      ...data,
      id: newId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      syncedToSheets: false,
    };

    // Append to local state
    setSubmissions((prev) => [newSubmission, ...prev]);

    // If Google Sheet is connected and autoSync is on, try live append
    const token = await getAccessToken();
    if (sheetConfig && token) {
      try {
        await appendSubmissionToSheet(token, sheetConfig.spreadsheetId, newSubmission);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === newId ? { ...s, syncedToSheets: true, syncedAt: new Date().toISOString() } : s))
        );
      } catch (err) {
        console.warn('Auto-sync append to Google Sheet failed:', err);
      }
    }

    // If Google Apps Script Webhook URL is configured, dispatch
    if (appsScriptConfig.webhookUrl) {
      sendToAppsScriptWebhook(appsScriptConfig.webhookUrl, newSubmission, 'submit');
    }

    showToast(`Project "${data.appTitle}" submitted successfully! ID: ${newId}`);
    return newId;
  };

  // Handle saving an AI review or teacher grade
  const handleSaveReview = async (
    submissionId: string,
    aiReview: AIReviewResult | undefined,
    teacherReview: TeacherReview | undefined
  ) => {
    let updatedSub: StudentSubmission | undefined;

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const newStatus = teacherReview
            ? 'graded'
            : aiReview
            ? 'ai_reviewed'
            : sub.status;

          updatedSub = {
            ...sub,
            aiReview: aiReview || sub.aiReview,
            teacherReview: teacherReview || sub.teacherReview,
            status: newStatus,
          };
          return updatedSub;
        }
        return sub;
      })
    );

    // If Sheets connected, sync updated submission
    const token = await getAccessToken();
    if (sheetConfig && token && updatedSub) {
      try {
        await syncAllSubmissionsToSheet(token, sheetConfig.spreadsheetId, [
          ...submissions.map((s) => (s.id === submissionId ? (updatedSub as StudentSubmission) : s)),
        ]);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, syncedToSheets: true } : s))
        );
      } catch (err) {
        console.warn('Sheets sync error after review save:', err);
      }
    }

    // Apps Script Webhook notification
    if (appsScriptConfig.webhookUrl && updatedSub) {
      sendToAppsScriptWebhook(appsScriptConfig.webhookUrl, updatedSub, 'review_update');
    }

    showToast(`Review for "${updatedSub?.appTitle || submissionId}" saved & synced.`);
    setSelectedReviewSub(null);
  };

  // Create New Google Sheet
  const handleCreateNewSheet = async (title: string) => {
    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('Please sign in to Google to create a spreadsheet.');
      token = res.accessToken;
      setUser(res.user);
    }

    const { spreadsheetId, spreadsheetUrl, title: sheetTitle } = await createGradingSpreadsheet(
      token,
      title
    );

    const newConfig: ConnectedSheetConfig = {
      spreadsheetId,
      spreadsheetUrl,
      title: sheetTitle,
      sheetName: 'Submissions & AI Evaluation',
      lastSyncedAt: new Date().toISOString(),
      autoSync: true,
      connectedUserEmail: user?.email,
    };

    setSheetConfig(newConfig);

    // Immediately push existing submissions
    await syncAllSubmissionsToSheet(token, spreadsheetId, submissions);
    setSubmissions((prev) => prev.map((s) => ({ ...s, syncedToSheets: true })));
    showToast(`Created & initialized Google Sheet: ${sheetTitle}`);
  };

  // Connect Existing Google Sheet
  const handleConnectExistingSheet = async (input: string) => {
    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('Please sign in to Google to connect a spreadsheet.');
      token = res.accessToken;
      setUser(res.user);
    }

    // Extract spreadsheet ID from URL or raw ID
    let sheetId = input.trim();
    const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      sheetId = urlMatch[1];
    }

    const newConfig: ConnectedSheetConfig = {
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      title: 'Connected AI Studio Gradebook',
      sheetName: 'Submissions & AI Evaluation',
      lastSyncedAt: new Date().toISOString(),
      autoSync: true,
      connectedUserEmail: user?.email,
    };

    setSheetConfig(newConfig);
    await syncAllSubmissionsToSheet(token, sheetId, submissions);
    setSubmissions((prev) => prev.map((s) => ({ ...s, syncedToSheets: true })));
    showToast('Linked existing Google Sheet and synced all submissions!');
  };

  // Quick Sync All
  const handleQuickSyncSheets = async () => {
    if (!sheetConfig) {
      setIsSheetsModalOpen(true);
      return;
    }

    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (!res) return;
      token = res.accessToken;
      setUser(res.user);
    }

    setIsSyncingSheets(true);
    try {
      await syncAllSubmissionsToSheet(token, sheetConfig.spreadsheetId, submissions);
      setSubmissions((prev) => prev.map((s) => ({ ...s, syncedToSheets: true })));
      setSheetConfig((prev) =>
        prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null
      );
      showToast(`Successfully synced ${submissions.length} submission records to Google Sheets!`);
    } catch (err: any) {
      showToast(err.message || 'Sync failed. Check your spreadsheet permissions.', 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Batch AI Evaluation for all pending submissions
  const handleBatchAiEvaluate = async () => {
    const pendingSubs = submissions.filter((s) => !s.aiReview);
    if (pendingSubs.length === 0) {
      showToast('All current submissions already have AI reviews!', 'info');
      return;
    }

    setIsBatchEvaluating(true);
    showToast(`Evaluating ${pendingSubs.length} pending submissions with Gemini 3.8 Flash...`, 'info');

    let successCount = 0;
    const updatedList = [...submissions];

    for (const sub of pendingSubs) {
      try {
        const response = await fetch('/api/ai/review-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: sub.studentName,
            studentEmail: sub.studentEmail,
            appTitle: sub.appTitle,
            tagline: sub.tagline,
            description: sub.description,
            category: sub.category,
            githubUrl: sub.githubUrl,
            deploymentUrl: sub.deploymentUrl,
            demoUrl: sub.demoUrl,
            techStack: sub.techStack,
            reflection: sub.reflection,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const idx = updatedList.findIndex((item) => item.id === sub.id);
          if (idx !== -1) {
            updatedList[idx] = {
              ...updatedList[idx],
              aiReview: data.review,
              status: updatedList[idx].teacherReview ? 'graded' : 'ai_reviewed',
            };
          }
          successCount++;
        }
      } catch (err) {
        console.error(`Batch eval failed for ${sub.id}:`, err);
      }
    }

    setSubmissions(updatedList);
    setIsBatchEvaluating(false);
    showToast(`Batch AI Evaluation finished: evaluated ${successCount} projects!`);

    // Auto-sync batch results to sheets if connected
    const token = await getAccessToken();
    if (sheetConfig && token) {
      syncAllSubmissionsToSheet(token, sheetConfig.spreadsheetId, updatedList).catch((e) =>
        console.warn('Batch sync to sheets failed', e)
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-medium flex items-center space-x-2.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : 'bg-blue-950/90 text-blue-200 border-blue-500/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        submissionCount={submissions.length}
        reviewedCount={submissions.filter((s) => s.aiReview).length}
        sheetConfig={sheetConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncingSheets={isSyncingSheets}
        onQuickSyncSheets={handleQuickSyncSheets}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'student' ? (
          <StudentSubmissionForm
            onSubmit={handleStudentSubmit}
            onSwitchToInstructorView={() => setActiveTab('instructor')}
            isSheetConnected={Boolean(sheetConfig)}
            hasAppsScriptWebhook={Boolean(appsScriptConfig.webhookUrl)}
          />
        ) : (
          <InstructorDashboard
            submissions={submissions}
            onOpenReviewModal={(sub) => setSelectedReviewSub(sub)}
            onOpenSandboxModal={(url, title) => setSandboxModal({ url, title })}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
            onQuickSyncSheets={handleQuickSyncSheets}
            isSyncingSheets={isSyncingSheets}
            sheetConfig={sheetConfig}
            onSwitchToStudentView={() => setActiveTab('student')}
            onBatchAiEvaluate={handleBatchAiEvaluate}
            isBatchEvaluating={isBatchEvaluating}
          />
        )}
      </main>

      {/* Review & Grading Modal */}
      {selectedReviewSub && (
        <SubmissionReviewModal
          submission={selectedReviewSub}
          onClose={() => setSelectedReviewSub(null)}
          onSaveReview={handleSaveReview}
          onOpenSandbox={(url, title) => setSandboxModal({ url, title })}
          isSheetConnected={Boolean(sheetConfig)}
        />
      )}

      {/* Live Sandbox Preview Modal */}
      {sandboxModal && (
        <LiveAppPreviewModal
          url={sandboxModal.url}
          title={sandboxModal.title}
          onClose={() => setSandboxModal(null)}
        />
      )}

      {/* Google Sheets Connect Modal */}
      <GoogleSheetsConnectModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        sheetConfig={sheetConfig}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncAll={handleQuickSyncSheets}
        onToggleAutoSync={(enabled) =>
          setSheetConfig((prev) => (prev ? { ...prev, autoSync: enabled } : null))
        }
        isSyncing={isSyncingSheets}
        submissionsCount={submissions.length}
      />

      {/* Google Apps Script Automation Modal */}
      <AppsScriptAutomationModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        appsScriptConfig={appsScriptConfig}
        onSaveWebhookUrl={(url) => setAppsScriptConfig({ ...appsScriptConfig, webhookUrl: url })}
        sampleSubmission={submissions[0]}
      />
    </div>
  );
}
