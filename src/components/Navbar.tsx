import React from 'react';
import {
  Sparkles,
  Sheet,
  FileCode,
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { ConnectedSheetConfig } from '../types';

interface NavbarProps {
  activeTab: 'student' | 'instructor';
  setActiveTab: (tab: 'student' | 'instructor') => void;
  submissionCount: number;
  reviewedCount: number;
  sheetConfig: ConnectedSheetConfig | null;
  onOpenSheetsModal: () => void;
  onOpenAppsScriptModal: () => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncingSheets: boolean;
  onQuickSyncSheets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  submissionCount,
  reviewedCount,
  sheetConfig,
  onOpenSheetsModal,
  onOpenAppsScriptModal,
  user,
  onSignIn,
  onSignOut,
  isSyncingSheets,
  onQuickSyncSheets,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  AppGrade AI
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AI Studio Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Student App Submissions, AI Rubric Grading &amp; Sheets Tracker
              </p>
            </div>
          </div>

          {/* Center Navigation Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'instructor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Instructor Dashboard</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-900/60 text-slate-200">
                {submissionCount}
              </span>
            </button>
          </div>

          {/* Right Action Tools: Sheets & Apps Script */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Google Apps Script Modal Trigger */}
            <button
              onClick={onOpenAppsScriptModal}
              title="Google Apps Script Automation & Webhook Setup"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-amber-300 hover:bg-slate-750 border border-amber-500/30 transition-colors shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Apps Script</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded font-mono">
                Auto
              </span>
            </button>

            {/* Google Sheets Status / Connect Button */}
            {sheetConfig ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={onOpenSheetsModal}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/40 transition-colors"
                  title="Google Sheet is connected. Click to manage."
                >
                  <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline truncate max-w-[120px]">
                    {sheetConfig.title}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
                <button
                  onClick={onQuickSyncSheets}
                  disabled={isSyncingSheets}
                  title="Quick Sync submissions to Google Sheet"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-700/60 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin text-emerald-400' : ''}`}
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSheetsModal}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-emerald-400 hover:bg-slate-750 border border-emerald-500/30 transition-colors shadow-sm"
              >
                <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Connect Sheets</span>
              </button>
            )}

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div
                  className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-400/40"
                  title={user.email || user.displayName}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Teacher Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
