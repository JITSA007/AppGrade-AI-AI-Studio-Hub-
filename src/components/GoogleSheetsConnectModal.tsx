import React, { useState } from 'react';
import {
  X,
  Sheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ConnectedSheetConfig, StudentSubmission } from '../types';

interface GoogleSheetsConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  sheetConfig: ConnectedSheetConfig | null;
  onCreateNewSheet: (title: string) => Promise<void>;
  onConnectExistingSheet: (sheetIdOrUrl: string) => Promise<void>;
  onSyncAll: () => Promise<void>;
  onToggleAutoSync: (enabled: boolean) => void;
  isSyncing: boolean;
  submissionsCount: number;
}

export const GoogleSheetsConnectModal: React.FC<GoogleSheetsConnectModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  onSignOut,
  sheetConfig,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncAll,
  onToggleAutoSync,
  isSyncing,
  submissionsCount,
}) => {
  const [courseTitle, setCourseTitle] = useState('AI Studio Class Submissions');
  const [existingInput, setExistingInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isConnectingExisting, setIsConnectingExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsCreating(true);
    try {
      await onCreateNewSheet(courseTitle.trim() || 'AI Studio Student Submissions');
      setSuccessMsg('Google Sheet successfully created and connected!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Google Sheet.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!existingInput.trim()) {
      setErrorMsg('Please enter a Google Sheet URL or ID.');
      return;
    }
    setIsConnectingExisting(true);
    try {
      await onConnectExistingSheet(existingInput.trim());
      setSuccessMsg('Connected to existing Google Sheet!');
      setExistingInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to link Google Sheet.');
    } finally {
      setIsConnectingExisting(false);
    }
  };

  const handleSyncClick = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onSyncAll();
      setSuccessMsg(`Synced ${submissionsCount} submission records to Google Sheets!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync to Google Sheet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Google Sheets Integration &amp; Sync
              </h3>
              <p className="text-xs text-slate-400">
                Log student submissions, AI rubrics, and grades in real time
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Authentication Section */}
          {!user ? (
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Connect Your Google Account
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sign in with Google to allow AppGrade AI to create and sync student grade sheets
                  directly to your Google Drive with your permission.
                </p>
              </div>

              {/* Official Google Sign-in Button format */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs shadow-md border border-slate-300 inline-flex items-center space-x-3 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Connected User Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">
                      {user.displayName || 'Teacher'}
                    </span>
                    <span className="text-slate-400 text-[11px]">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="text-slate-400 hover:text-rose-400 text-xs transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {/* Connected Sheet Status & Sync Controls */}
              {sheetConfig ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Connected &amp; Active</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate max-w-sm">
                        {sheetConfig.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tab: <code className="text-slate-300">{sheetConfig.sheetName}</code>
                        {sheetConfig.lastSyncedAt && (
                          <span>
                            {' '}&bull; Last synced{' '}
                            {new Date(sheetConfig.lastSyncedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <a
                      href={sheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Auto-Sync Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Live Auto-Sync
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Automatically append new student submissions and AI reviews
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetConfig.autoSync}
                        onChange={(e) => onToggleAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Manual Sync Button */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {submissionsCount} total submissions in dashboard
                    </span>
                    <button
                      onClick={handleSyncClick}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md inline-flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync All Records Now'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Create or Link New Sheet */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Create Fresh AI Studio Gradebook Sheet</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Creates a new spreadsheet with styled headers (ID, Student Name, App Title,
                    GitHub, Live Link, AI Score /100, Innovation, Tech, UX, Utility, Teacher Feedback).
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. AI Studio Cohort 2026"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Sheet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Or Connect Existing Spreadsheet</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={existingInput}
                      onChange={(e) => setExistingInput(e.target.value)}
                      placeholder="Paste Google Sheet URL or Spreadsheet ID..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleConnectExisting}
                      disabled={isConnectingExisting}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold shadow-sm inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      {isConnectingExisting ? 'Linking...' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
