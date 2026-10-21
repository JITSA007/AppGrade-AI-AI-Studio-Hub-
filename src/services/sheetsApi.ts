import { StudentSubmission } from '../types';

export const SHEET_HEADERS = [
  'Submission ID',
  'Submitted At',
  'Student Name',
  'Student Email',
  'App Title',
  'Category',
  'Deployment Link',
  'GitHub Link',
  'Demo Video',
  'Tech Stack',
  'AI Total Score (/100)',
  'Innovation (/25)',
  'Technical (/25)',
  'UI/UX (/25)',
  'Utility (/25)',
  'AI Verdict',
  'AI Executive Summary',
  'AI Strengths',
  'AI Actionable Improvements',
  'Teacher Score',
  'Teacher Verdict',
  'Teacher Feedback',
  'Status',
];

export const submissionToRowValues = (sub: StudentSubmission): (string | number)[] => {
  return [
    sub.id,
    new Date(sub.submittedAt).toLocaleString(),
    sub.studentName,
    sub.studentEmail,
    sub.appTitle,
    sub.category,
    sub.deploymentUrl,
    sub.githubUrl,
    sub.demoUrl || '',
    sub.techStack.join(', '),
    sub.aiReview ? sub.aiReview.totalScore : 'Not evaluated',
    sub.aiReview ? sub.aiReview.rubrics.innovation.score : '',
    sub.aiReview ? sub.aiReview.rubrics.technicalExecution.score : '',
    sub.aiReview ? sub.aiReview.rubrics.uiUxDesign.score : '',
    sub.aiReview ? sub.aiReview.rubrics.practicalUtility.score : '',
    sub.aiReview ? sub.aiReview.overallVerdict : '',
    sub.aiReview ? sub.aiReview.summary : '',
    sub.aiReview ? sub.aiReview.keyStrengths.join(' | ') : '',
    sub.aiReview ? sub.aiReview.areasForImprovement.join(' | ') : '',
    sub.teacherReview ? sub.teacherReview.finalScore : '',
    sub.teacherReview ? sub.teacherReview.verdict : '',
    sub.teacherReview ? sub.teacherReview.feedback : '',
    sub.status.toUpperCase(),
  ];
};

export async function createGradingSpreadsheet(
  accessToken: string,
  courseTitle = 'AI Studio Student App Submissions'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const timestamp = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const fullTitle = `${courseTitle} (${timestamp})`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: fullTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Submissions & AI Evaluation',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SHEET_HEADERS.map((header) => ({
                    userEnteredValue: { stringValue: header },
                    userEnteredFormat: {
                      textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                      backgroundColor: { red: 0.12, green: 0.35, blue: 0.8 },
                      horizontalAlignment: 'CENTER',
                    },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Sheet: HTTP ${res.status}`
    );
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: fullTitle,
  };
}

export async function appendSubmissionToSheet(
  accessToken: string,
  spreadsheetId: string,
  submission: StudentSubmission
): Promise<void> {
  const rowValues = submissionToRowValues(submission);
  const range = 'Submissions & AI Evaluation!A:W';

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to append to Google Sheet: HTTP ${res.status}`
    );
  }
}

export async function syncAllSubmissionsToSheet(
  accessToken: string,
  spreadsheetId: string,
  submissions: StudentSubmission[]
): Promise<void> {
  // First clear existing data rows (keep header)
  const range = 'Submissions & AI Evaluation!A2:W';
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (submissions.length === 0) return;

  const rows = submissions.map(submissionToRowValues);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      'Submissions & AI Evaluation!A2'
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to sync submissions to Google Sheet: HTTP ${res.status}`
    );
  }
}

export async function sendToAppsScriptWebhook(
  webhookUrl: string,
  submission: StudentSubmission,
  action: 'submit' | 'review_update' = 'submit'
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = {
      action,
      submission,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps Script webhooks often redirect or have CORS restrictions
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true, message: 'Dispatched to Google Apps Script Webhook.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Webhook call failed.' };
  }
}
