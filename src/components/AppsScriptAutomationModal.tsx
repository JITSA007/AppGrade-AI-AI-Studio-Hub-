import React, { useState } from 'react';
import {
  X,
  FileCode,
  Copy,
  Check,
  Send,
  Sparkles,
  Mail,
  Zap,
  CheckCircle2,
  ExternalLink,
  Code2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { AppsScriptConfig, StudentSubmission } from '../types';

interface AppsScriptAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptConfig: AppsScriptConfig;
  onSaveWebhookUrl: (url: string) => void;
  sampleSubmission?: StudentSubmission;
}

// 100% Safe & Zero-Block Script: uses ONLY SpreadsheetApp (no sensitive MailApp/Gmail scopes that trigger "This app is blocked")
const SAFE_APPS_SCRIPT_CODE = `/**
 * @file Google Apps Script: AI Studio Student App Review & Automated Tracker
 * @version 2.0 (Zero-Block Safe Edition - No sensitive email scopes)
 * @description Automatically captures student app submissions, logs AI rubrics & scores,
 * creates custom sheet menus, formats the gradebook, and calculates cohort statistics.
 */

const SHEET_NAME = 'Submissions & AI Evaluation';

/**
 * Custom Menu added to Google Sheets UI when opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 AI Studio Tracker')
    .addItem('📊 Format & Style Gradebook', 'formatGradebook')
    .addItem('🌟 Highlight Top Performers (Score >= 90)', 'highlightTopScorers')
    .addItem('📈 Calculate Cohort Average & Stats', 'calculateCohortStats')
    .addToUi();
}

/**
 * Webhook endpoint: handles incoming POST requests from the AppGrade portal
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSubmissionsSheet();
    const data = JSON.parse(e.postData.contents);
    const sub = data.submission;

    if (!sub) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing submission payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ai = sub.aiReview || {};
    const rubrics = ai.rubrics || {};
    const teacher = sub.teacherReview || {};

    const newRow = [
      sub.id || 'SUB-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss'),
      new Date(),
      sub.studentName || 'Anonymous',
      sub.studentEmail || '',
      sub.appTitle || '',
      sub.category || 'General',
      sub.deploymentUrl || '',
      sub.githubUrl || '',
      sub.demoUrl || '',
      Array.isArray(sub.techStack) ? sub.techStack.join(', ') : (sub.techStack || ''),
      ai.totalScore !== undefined ? ai.totalScore : '',
      rubrics.innovation ? rubrics.innovation.score : '',
      rubrics.technicalExecution ? rubrics.technicalExecution.score : '',
      rubrics.uiUxDesign ? rubrics.uiUxDesign.score : '',
      rubrics.practicalUtility ? rubrics.practicalUtility.score : '',
      ai.overallVerdict || '',
      ai.summary || '',
      ai.keyStrengths ? ai.keyStrengths.join(' | ') : '',
      ai.areasForImprovement ? ai.areasForImprovement.join(' | ') : '',
      teacher.finalScore !== undefined ? teacher.finalScore : '',
      teacher.verdict || '',
      teacher.feedback || '',
      (sub.status || 'PENDING').toUpperCase()
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Submission successfully logged to Google Sheet',
      id: sub.id
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Webhook endpoint: handles GET requests to easily test the URL in a browser
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'AppGrade AI Apps Script Webhook is active and listening for submissions!'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Highlights rows with score >= 90 with an emerald green glow
 */
function highlightTopScorers() {
  const sheet = getOrCreateSubmissionsSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  for (let i = 1; i < data.length; i++) {
    const score = Number(data[i][10]);
    if (score >= 90) {
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground('#dcfce7');
    }
  }
  SpreadsheetApp.getUi().alert('Highlighted top scoring projects (Score >= 90) in emerald green!');
}

/**
 * Calculates Cohort Statistics and displays a popup dialog
 */
function calculateCohortStats() {
  const sheet = getOrCreateSubmissionsSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('No submissions found in this sheet yet.');
    return;
  }

  let totalScore = 0;
  let count = 0;
  let topProject = '';
  let highestScore = -1;

  for (let i = 1; i < data.length; i++) {
    const score = Number(data[i][10]);
    if (!isNaN(score) && data[i][10] !== '') {
      totalScore += score;
      count++;
      if (score > highestScore) {
        highestScore = score;
        topProject = data[i][4] + ' (' + data[i][2] + ')';
      }
    }
  }

  const avg = count > 0 ? (totalScore / count).toFixed(1) : 0;
  SpreadsheetApp.getUi().alert(
    '📊 AI Studio Cohort Analytics\\n\\n' +
    'Total Projects: ' + (data.length - 1) + '\\n' +
    'Evaluated Projects: ' + count + '\\n' +
    'Cohort Average Score: ' + avg + ' / 100\\n' +
    'Highest Score: ' + (highestScore >= 0 ? highestScore + ' (' + topProject + ')' : 'None')
  );
}

/**
 * Styles and freezes the header row
 */
function formatGradebook() {
  const sheet = getOrCreateSubmissionsSheet();
  const headerRange = sheet.getRange(1, 1, 1, 23);
  headerRange.setBackground('#1e3a8a')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert('Gradebook header formatted and frozen successfully!');
}

function getOrCreateSubmissionsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Submission ID', 'Submitted At', 'Student Name', 'Student Email', 'App Title',
      'Category', 'Deployment Link', 'GitHub Link', 'Demo Video', 'Tech Stack',
      'AI Total Score (/100)', 'Innovation (/25)', 'Technical (/25)', 'UI/UX (/25)', 'Utility (/25)',
      'AI Verdict', 'AI Summary', 'AI Strengths', 'AI Improvements',
      'Teacher Score', 'Teacher Verdict', 'Teacher Feedback', 'Status'
    ];
    sheet.appendRow(headers);
    formatGradebook();
  }
  return sheet;
}
`;

export const AppsScriptAutomationModal: React.FC<AppsScriptAutomationModalProps> = ({
  isOpen,
  onClose,
  appsScriptConfig,
  onSaveWebhookUrl,
  sampleSubmission,
}) => {
  const [webhookInput, setWebhookInput] = useState(appsScriptConfig.webhookUrl || '');
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showBlockedGuide, setShowBlockedGuide] = useState(true);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAFE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    onSaveWebhookUrl(webhookInput.trim());
    setTestResult(null);
  };

  const handleTestWebhook = async () => {
    if (!webhookInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Please paste your Google Apps Script Web App URL first.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const payload = {
        action: 'test_ping',
        submission: sampleSubmission || {
          id: 'TEST-PING-001',
          studentName: 'Test Student',
          studentEmail: 'student@example.com',
          appTitle: 'Test AI Studio App',
          tagline: 'Webhook connection test',
          description: 'Verifying Google Apps Script automated intake endpoint.',
          category: 'AI Agents & Automation',
          deploymentUrl: 'https://example.com',
          githubUrl: 'https://github.com/example/repo',
          techStack: ['Gemini 3.8 Flash', 'Google Apps Script'],
          status: 'pending',
          submittedAt: new Date().toISOString(),
        },
      };

      await fetch(webhookInput.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      setTestResult({
        status: 'success',
        message:
          'Ping dispatched! Check your Google Sheet to verify that the test row was appended.',
      });
      onSaveWebhookUrl(webhookInput.trim());
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Webhook test failed. Ensure deployment is set to Anyone access.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Google Apps Script Automation Suite
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero-Block Safe Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automate submission intake, grading triggers, and spreadsheet menus without authorization blocks
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CRITICAL FIX BANNER: "This app is blocked" Solution */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Fix for "This app is blocked / sensitive info" Error</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockedGuide(!showBlockedGuide)}
                className="text-xs text-amber-300 hover:underline"
              >
                {showBlockedGuide ? 'Hide Guide' : 'Show Guide'}
              </button>
            </div>

            {showBlockedGuide && (
              <div className="space-y-2 text-xs text-slate-300 pt-1 border-t border-amber-500/20">
                <p>
                  <strong>Why it happened:</strong> Google automatically blocks scripts on consumer accounts (like <code className="text-amber-200">@gmail.com</code>) if they request <em>email sending scopes</em> (such as <code className="text-amber-200">MailApp</code> or <code className="text-amber-200">GmailApp</code>) when deployed as a Web App.
                </p>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>How to fix it in 30 seconds:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Copy the Safe Script below</strong>: We removed the sensitive MailApp scope so it uses <em>only standard Google Sheets access</em> (which Google never blocks!).
                    </li>
                    <li>
                      In Google Apps Script, <strong>replace your code with this updated script</strong> and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Ctrl+S</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Cmd+S</kbd>.
                    </li>
                    <li>
                      Click <strong>Deploy &gt; Manage deployments</strong> &gt; edit your Web app &gt; select <strong>New version</strong> &gt; click <strong>Deploy</strong>.
                    </li>
                    <li>
                      When Google asks to authorize, click <strong className="text-white">"Advanced"</strong> (bottom-left) &gt; <strong className="text-white">"Go to Untitled project (unsafe)"</strong> &gt; <strong className="text-white">"Allow"</strong>. It will succeed with <em>zero blocks</em>!
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Instant Webhook Intake</h4>
              <p className="text-[11px] text-slate-400">
                The <code className="text-blue-300 font-mono">doPost(e)</code> endpoint writes student submissions directly to your Sheet without any user authorization hurdles.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Custom Sheet Menu</h4>
              <p className="text-[11px] text-slate-400">
                Adds <strong className="text-slate-200">"🤖 AI Studio Tracker"</strong> menu inside Google Sheets for 1-click styling, stats, and top scorer highlights.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">100% Zero-Block Safe</h4>
              <p className="text-[11px] text-slate-400">
                Contains only standard Spreadsheet permissions so Google will never block your account deployment.
              </p>
            </div>
          </div>

          {/* 4-Step Quick Instructions */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Quick Deployment Checklist</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                  1
                </span>
                <p className="font-semibold text-slate-200">Open Sheets</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Click <em>Extensions &gt; Apps Script</em> in your Google Sheet.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                  2
                </span>
                <p className="font-semibold text-slate-200">Paste Script</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Copy the code below, replace the existing text, and save.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                  3
                </span>
                <p className="font-semibold text-slate-200">Deploy Web App</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Click <em>Deploy &gt; New deployment &gt; Web app</em> (Execute as: <strong>Me</strong>, Who has access: <strong>Anyone</strong>).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                  4
                </span>
                <p className="font-semibold text-slate-200">Paste Webhook URL</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Paste the generated Web App URL below and click Test!
                </p>
              </div>
            </div>
          </div>

          {/* Webhook URL Input & Test Tool */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect Live Apps Script Webhook URL</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={webhookInput}
                onChange={(e) => setWebhookInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTesting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Pinging...' : 'Test Webhook'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Copyable Code Editor View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Code.gs (Zero-Block Safe Edition)</span>
              </span>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Safe Script</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
                {SAFE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
