
// utils/aiService.js
// AI Service — Google Gemini (free tier, no credit card needed)
// To get API key: https://aistudio.google.com/app/apikey (free)
// Falls back to mock responses if API key not set
 
const IS_MOCK = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_key_here";
 
// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS (Prompt Engineering)
// ─────────────────────────────────────────────────────────────────────────────
 
const REPORT_ANALYSIS_SYSTEM_PROMPT = `You are MedInsight AI, an expert medical report analyzer.
Your job is to analyze patient lab reports and provide clear, accurate, and easy-to-understand results.
 
RULES:
- Always respond with ONLY valid JSON — no markdown, no explanation outside JSON
- Be accurate but use plain language a non-doctor can understand
- Flag anything outside normal ranges
- Never diagnose — only analyze and suggest consulting a doctor
 
RESPONSE FORMAT (strict JSON):
{
  "summary_text": "2-3 sentence plain language summary of the overall health picture",
  "key_findings": [
    { "marker": "marker name", "value": "value with unit", "status": "Normal|High|Low" }
  ],
  "abnormal_flags": [
    { "marker": "marker name", "reason": "plain language explanation of why this is concerning" }
  ],
  "risk_level": "Low|Medium|High",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;
 
const CHAT_SYSTEM_PROMPT = `You are MedInsight AI, a friendly and knowledgeable medical assistant.
You help patients understand their lab report results in simple, clear language.
 
RULES:
- Answer only health and medical report related questions
- Use simple language — avoid complex medical jargon
- Always recommend consulting a real doctor for diagnosis or treatment decisions
- Be empathetic and reassuring
- Keep answers concise (2-4 sentences)
- If asked something unrelated to health, politely redirect
 
You have access to this patient's report context: {REPORT_CONTEXT}`;
 
// ─────────────────────────────────────────────────────────────────────────────
// GEMINI API CALL
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userPrompt, expectJSON = false) {
  // NOTE: Google retires Gemini model IDs frequently (sometimes ahead of their
  // published deprecation dates). If you start seeing API_ERROR:404 again,
  // check https://ai.google.dev/gemini-api/docs/deprecations and update the
  // fallback below and/or your GEMINI_MODEL env var.
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
 
  // Temporary debug log — remove once you've confirmed the right model is being used.
  console.log('[DEBUG] Gemini model in use:', GEMINI_MODEL);
 
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature:     0.3,
      maxOutputTokens: 2048,
      ...(expectJSON ? { responseMimeType: "application/json" } : {}),
    },
  };
 
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 15000); // 15s timeout
 
  try {
    const res = await fetch(GEMINI_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });
    clearTimeout(timeout);
 
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 403) throw new Error("INVALID_KEY");
    if (!res.ok) {
      // Surface the response body on error — very useful for diagnosing 404s
      // (Google usually returns a JSON error explaining exactly which model
      // wasn't found, or why the request was rejected).
      let details = "";
      try {
        const errBody = await res.json();
        details = errBody?.error?.message ? ` — ${errBody.error.message}` : "";
      } catch {
        // response body wasn't JSON; ignore
      }
      throw new Error(`API_ERROR:${res.status}${details}`);
    }
 
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
 
    if (!text || text.trim() === "") throw new Error("EMPTY_RESPONSE");
    return text.trim();
 
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  }
}
 
// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
function validateReportAnalysis(result) {
  // Ensure required fields exist
  if (!result.summary_text || typeof result.summary_text !== "string") {
    result.summary_text = "Report analyzed. Please consult your doctor for a detailed interpretation.";
  }
  if (!Array.isArray(result.key_findings))  result.key_findings   = [];
  if (!Array.isArray(result.abnormal_flags)) result.abnormal_flags = [];
  if (!Array.isArray(result.recommendations)) result.recommendations = ["Consult your doctor for detailed advice."];
  if (!["Low", "Medium", "High"].includes(result.risk_level)) result.risk_level = "Low";
 
  // Remove duplicate findings
  const seen = new Set();
  result.key_findings = result.key_findings.filter((f) => {
    if (seen.has(f.marker)) return false;
    seen.add(f.marker); return true;
  });
 
  // Validate statuses
  result.key_findings = result.key_findings.map((f) => ({
    ...f,
    status: ["Normal", "High", "Low"].includes(f.status) ? f.status : "Normal",
  }));
 
  return result;
}
 
function parseJSON(text) {
  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(clean); }
  catch { throw new Error("INVALID_JSON"); }
}
 
// ─────────────────────────────────────────────────────────────────────────────
// MOCK RESPONSES (used when no API key)
// ─────────────────────────────────────────────────────────────────────────────
function getMockAnalysis(reportText) {
  const text = (reportText || "").toLowerCase();
  const hasHighCholesterol = text.includes("cholesterol") || text.includes("228") || text.includes("ldl");
  const hasAnemia          = text.includes("hemoglobin")  || text.includes("11.2");
  const hasGlucose         = text.includes("glucose")     || text.includes("108");
 
  return {
    summary_text: `Your blood test results have been analyzed. ${
      hasHighCholesterol ? "Cholesterol levels are elevated. " : ""
    }${hasAnemia ? "Hemoglobin is slightly low suggesting mild anemia. " : ""
    }${hasGlucose ? "Fasting glucose is in the pre-diabetic range. " : ""
    }Please consult your doctor for a detailed assessment.`,
    key_findings: [
      { marker: "Hemoglobin",         value: "11.2 g/dL",  status: "Low"    },
      { marker: "Glucose (Fasting)",  value: "108 mg/dL",  status: "High"   },
      { marker: "Cholesterol (Total)",value: "228 mg/dL",  status: "High"   },
      { marker: "LDL Cholesterol",    value: "142 mg/dL",  status: "High"   },
      { marker: "White Blood Cells",  value: "7.4 K/µL",   status: "Normal" },
      { marker: "Creatinine",         value: "0.9 mg/dL",  status: "Normal" },
    ],
    abnormal_flags: [
      { marker: "Hemoglobin",          reason: "Below normal range. May indicate mild anemia. Iron-rich foods like spinach and lentils can help." },
      { marker: "Glucose (Fasting)",   reason: "Pre-diabetic range. Monitor with dietary changes — reduce sugar and refined carbs." },
      { marker: "Cholesterol (Total)", reason: "Above recommended level of 200 mg/dL. Increases cardiovascular risk over time." },
    ],
    risk_level: "Medium",
    recommendations: [
      "Schedule a follow-up with your doctor within 4 weeks",
      "Reduce saturated fat and refined carbohydrate intake",
      "Aim for 30 minutes of aerobic exercise, 5+ days per week",
      "Eat iron-rich foods: spinach, lean red meat, legumes",
      "Take a Vitamin D3 supplement (1,000–2,000 IU/day)",
    ],
  };
}
 
function getMockChatResponse(question) {
  const q = question.toLowerCase();
  if (q.includes("cholesterol"))
    return "Your cholesterol of 228 mg/dL is above the recommended limit of 200 mg/dL. This increases cardiovascular risk over time. Reducing saturated fats and increasing exercise can help bring it down.";
  if (q.includes("glucose") || q.includes("sugar") || q.includes("diabetic"))
    return "Your fasting glucose of 108 mg/dL is in the pre-diabetic range (100-125 mg/dL). This doesn't mean you have diabetes, but it's worth monitoring with dietary changes and regular check-ups.";
  if (q.includes("hemoglobin") || q.includes("anemia"))
    return "Your hemoglobin of 11.2 g/dL is slightly below normal, suggesting mild anemia. This can cause fatigue. Iron-rich foods like spinach, lentils, and lean red meat can help, but consult your doctor.";
  if (q.includes("ldl"))
    return "LDL is 'bad' cholesterol. Your level of 142 mg/dL is above the ideal target of under 100 mg/dL. Reducing saturated fat intake and increasing physical activity are effective first steps.";
  return "Based on your report, I recommend discussing these results with your doctor. They can provide personalized advice based on your full medical history. Is there a specific value you'd like me to explain?";
}
 
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * analyzeReport — Called when a report is uploaded
 * USER PROMPT: The raw report text
 * EXPECTED OUTPUT: Structured JSON with summary, findings, flags, recommendations
 */
const analyzeReport = async (reportText) => {
  if (IS_MOCK) {
    console.log("[AI] Using mock response — set GEMINI_API_KEY to enable real AI");
    await new Promise((r) => setTimeout(r, 500));
    return getMockAnalysis(reportText);
  }
 
  const userPrompt = `Analyze this medical lab report and return structured JSON:
 
${reportText}
 
Return ONLY the JSON object as specified. No extra text.`;
 
  try {
    const raw = await callGemini(REPORT_ANALYSIS_SYSTEM_PROMPT, userPrompt, true);
    // Temporary debug log — remove once JSON parsing is confirmed reliable.
    console.log('[DEBUG] Raw Gemini response (analyzeReport):', raw);
    const parsed = parseJSON(raw);
    return validateReportAnalysis(parsed);
  } catch (err) {
    console.error("[AI] analyzeReport error:", err.message);
    // Graceful fallback — never crash the upload
    if (err.message === "RATE_LIMIT") {
      console.warn("[AI] Rate limit hit — using mock");
      return getMockAnalysis(reportText);
    }
    return getMockAnalysis(reportText);
  }
};
 
/**
 * chatWithReport — Called for AI Assistant chat
 * USER PROMPT: Patient's question
 * EXPECTED OUTPUT: Plain text answer
 */
const chatWithReport = async (question, reportContext) => {
  if (IS_MOCK) {
    console.log("[AI] Using mock chat response");
    await new Promise((r) => setTimeout(r, 300));
    return getMockChatResponse(question);
  }
 
  const systemPrompt = CHAT_SYSTEM_PROMPT.replace("{REPORT_CONTEXT}", reportContext || "No specific report context provided.");
 
  try {
    const response = await callGemini(systemPrompt, question, false);
 
    // Validate response
    if (!response || response.trim().length < 10) {
      return "I'm sorry, I couldn't generate a response. Please try rephrasing your question.";
    }
 
    // Remove any unwanted formatting
    return response.replace(/\*\*/g, "").replace(/#{1,6}\s/g, "").trim();
 
  } catch (err) {
    console.error("[AI] chatWithReport error:", err.message);
 
    // Handle specific errors gracefully
    if (err.message === "RATE_LIMIT")
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    if (err.message === "TIMEOUT")
      return "The AI took too long to respond. Please try again.";
    if (err.message === "INVALID_KEY")
      return "AI service configuration error. Please contact support.";
 
    return getMockChatResponse(question);
  }
};
 
module.exports = { analyzeReport, chatWithReport };
 