export const CONDITIONS = ["Diabetes", "Hypertension", "Heart Disease", "Thyroid Disorder", "Kidney Disease", "Asthma"];

export const GLUCOSE_TREND = [
  { date: "Jan", value: 88 },
  { date: "Feb", value: 91 },
  { date: "Mar", value: 95 },
  { date: "Apr", value: 93 },
  { date: "May", value: 89 },
  { date: "Jun", value: 91 },
];

export const MARKERS = [
  { name: "White Blood Cells", value: "7.4", unit: "K/µL", range: "4.5 – 11.0", status: "Normal" },
  { name: "Creatinine", value: "0.9", unit: "mg/dL", range: "0.7 – 1.3", status: "Normal" },
  { name: "ALT", value: "38", unit: "U/L", range: "7 – 56", status: "Normal" },
  { name: "HDL Cholesterol", value: "62", unit: "mg/dL", range: "> 40", status: "Normal" },
  { name: "TSH", value: "2.1", unit: "mIU/L", range: "0.4 – 4.0", status: "Normal" },
  { name: "Glucose (Fasting)", value: "108", unit: "mg/dL", range: "70 – 99", status: "High" },
  { name: "Cholesterol (Total)", value: "228", unit: "mg/dL", range: "< 200", status: "High" },
  { name: "LDL Cholesterol", value: "142", unit: "mg/dL", range: "< 100", status: "High" },
  { name: "Triglycerides", value: "156", unit: "mg/dL", range: "< 150", status: "High" },
  { name: "Hemoglobin", value: "11.2", unit: "g/dL", range: "13.5 – 17.5", status: "Low" },
  { name: "Vitamin D", value: "22", unit: "ng/mL", range: "30 – 100", status: "Low" },
  { name: "Iron", value: "45", unit: "µg/dL", range: "60 – 170", status: "Low" },
];

export const RISKS = [
  { title: "Elevated Cholesterol", body: "Total cholesterol and LDL above recommended levels increase cardiovascular risk over time.", level: "high" },
  { title: "Pre-diabetic Glucose Range", body: "Fasting glucose of 108 mg/dL is just above normal. Monitor with dietary changes.", level: "medium" },
  { title: "Mild Anemia", body: "Hemoglobin below optimal range. May cause fatigue. Likely iron-related.", level: "medium" },
  { title: "Vitamin D Deficiency", body: "Below optimal range. Important for bone health, immunity, and mood.", level: "low" },
];

export const RECOMMENDATIONS = [
  "Schedule a follow-up with your doctor within 4 weeks",
  "Reduce saturated fat and refined carbohydrate intake",
  "Aim for 30 min of aerobic exercise, 5+ days per week",
  "Eat iron-rich foods: spinach, lean red meat, legumes",
  "Take a Vitamin D3 supplement (1,000–2,000 IU/day)",
];

export const REPORTS = [
  { name: "Complete Blood Count + Lipid Panel", type: "CBC + Lipid", date: "Jul 13, 2026", doctor: "Dr. Sarah Chen", status: "Abnormal" },
  { name: "Thyroid Function Test", type: "TFT", date: "May 28, 2026", doctor: "Dr. James Lee", status: "Normal" },
  { name: "Liver Function Panel", type: "LFT", date: "Apr 12, 2026", doctor: "Dr. Sarah Chen", status: "Normal" },
  { name: "HbA1c + Glucose", type: "Diabetes Panel", date: "Mar 03, 2026", doctor: "Dr. James Lee", status: "Monitoring" },
  { name: "Complete Metabolic Panel", type: "CMP", date: "Jan 21, 2026", doctor: "Dr. Sarah Chen", status: "Normal" },
];

export const STAT_CARDS = [
  { label: "Glucose", value: "91", unit: "mg/dL", status: "Normal", note: "Fasting" },
  { label: "Cholesterol", value: "228", unit: "mg/dL", status: "High", note: "Total" },
  { label: "Hemoglobin", value: "11.2", unit: "g/dL", status: "Low", note: "" },
  { label: "Vitamin D", value: "22", unit: "ng/mL", status: "Low", note: "" },
];

export const STATUS_STYLES = {
  Normal: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  High: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Low: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Abnormal: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Monitoring: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

export const NAV_ITEMS_KEYS = ["dashboard", "upload", "history", "assistant", "profile"];
