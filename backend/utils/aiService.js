// utils/aiService.js
// MOCKED AI responses — swap the functions below for real OpenAI calls later.
// To enable real AI: npm install openai  and replace mock functions with actual API calls.

// ─────────────────────────────────────────────────────────────
// analyzeReport(reportText)
// Called when a report is uploaded. Returns a structured summary.
// ─────────────────────────────────────────────────────────────
const analyzeReport = async (reportText) => {
  // 🔴 MOCK — replace this block with real OpenAI call when you have an API key
  await new Promise((r) => setTimeout(r, 500)); // simulate network delay

  return {
    summary_text:
      'Your blood test results have been analyzed. Most values are within normal range. ' +
      'Some markers require attention — please consult your doctor.',
    key_findings: [
      { marker: 'Hemoglobin',        value: '11.2 g/dL',  status: 'Low'    },
      { marker: 'Glucose (Fasting)', value: '108 mg/dL',  status: 'High'   },
      { marker: 'Cholesterol',       value: '228 mg/dL',  status: 'High'   },
      { marker: 'White Blood Cells', value: '7.4 K/μL',   status: 'Normal' },
    ],
    abnormal_flags: [
      { marker: 'Hemoglobin',  reason: 'Below normal range. Possible mild anemia.'          },
      { marker: 'Glucose',     reason: 'Pre-diabetic range. Monitor with dietary changes.'  },
      { marker: 'Cholesterol', reason: 'Above recommended level. Dietary changes advised.'  },
    ],
  };

  /* ── REAL OpenAI implementation (uncomment when ready) ────────────────
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a medical report analyzer. Analyze the given lab report and return a JSON object with:
          - summary_text: plain language summary
          - key_findings: array of { marker, value, status }
          - abnormal_flags: array of { marker, reason }
          Respond ONLY with valid JSON.`,
      },
      { role: 'user', content: reportText },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
  ──────────────────────────────────────────────────────────────────────── */
};

// ─────────────────────────────────────────────────────────────
// chatWithReport(question, reportContext)
// Called when user asks a question about their report in the AI chat.
// ─────────────────────────────────────────────────────────────
const chatWithReport = async (question, reportContext) => {
  // 🔴 MOCK — replace this block with real OpenAI call when you have an API key
  await new Promise((r) => setTimeout(r, 300));

  const mockAnswers = {
    default: 'Based on your report, your results show some values outside the normal range. I recommend consulting your doctor for a detailed assessment.',
    cholesterol: 'Your cholesterol level of 228 mg/dL is above the recommended limit of 200 mg/dL. Reducing saturated fats and increasing exercise can help.',
    glucose: 'Your fasting glucose of 108 mg/dL is in the pre-diabetic range. Monitoring your diet and regular check-ups are advised.',
    hemoglobin: 'Your hemoglobin is slightly low at 11.2 g/dL. This may indicate mild anemia. Iron-rich foods like spinach and lentils can help.',
  };

  const lower = question.toLowerCase();
  if (lower.includes('cholesterol')) return mockAnswers.cholesterol;
  if (lower.includes('glucose') || lower.includes('sugar')) return mockAnswers.glucose;
  if (lower.includes('hemoglobin') || lower.includes('anemia')) return mockAnswers.hemoglobin;
  return mockAnswers.default;

  /* ── REAL OpenAI implementation (uncomment when ready) ────────────────
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a medical AI assistant. Answer questions about the following medical report in simple, clear language.
          Report context: ${reportContext}
          Be helpful but always recommend consulting a real doctor for medical decisions.`,
      },
      { role: 'user', content: question },
    ],
  });

  return completion.choices[0].message.content;
  ──────────────────────────────────────────────────────────────────────── */
};

module.exports = { analyzeReport, chatWithReport };
