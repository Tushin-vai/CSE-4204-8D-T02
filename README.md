**Project Title: ****Medical Report Analyzer **

**Team Information : **

**Team Leader : Hassan A.K. Azad Tushin \(11220320959\) **

**Members of Team: Farjana Easmin Minka \(11220320899\) **

**Juena Tabassum \(11220320982\) **

**Faika Newaz Silmi \(11220321050\) **

**Project Description **

The Medical Report Analyzer is a web-based AI application where users paste or type the text of their medical report directly into the system — such as blood test results, discharge notes, prescriptions, or lab reports — and instantly receive a clear, plain-language summary. 

The entered text is sent to OpenAI’s API, which reads the report and produces a structured output: a plain-language summary, a list of key findings \(diagnoses, medications, lab values\), and any flagged abnormal results. Everything is displayed on a clean dashboard. 

Users can then ask follow-up questions about their report through a built-in chatbot. All reports, summaries, and chat history are saved per user account in a PostgreSQL database so they can be reviewed later. The system requires no medical knowledge from the user — just paste the report and read the summary. 

**Core Features : **

**Authentication System: **

User registration and login with JWT-based secure sessions. Private, per-user data isolation ensuring reports are only accessible by their owner. 

**Report Input & Upload: **

Text input field for pasting report content directly. 

File upload support for PDF and image-based reports. 

OCR and vision processing for scanned documents via OpenAI Vision. 

**AI-Powered Analysis Dashboard: **

Automatically generated plain-language summary of the report. Structured extraction of key findings: diagnoses, lab values, medications. Flagging of abnormal results for immediate user attention. 

**Interactive Q&A Chatbot: **

Built-in chatbot allowing users to ask follow-up questions about their report. Context-aware responses grounded in the specific report content. Conversational interface for a natural user experience 

. 

**Report History: **

All past reports, AI summaries, and chat conversations saved per account. Users can revisit any prior report and continue asking questions. 

 

**Technology Stack **

**Layer** **Technology** **Purpose**

Upload page, summary dashboard, 

Frontend React.js 

chatbot panel, report history, auth 

REST API: /upload, /summarize, 

Backend Node.js \+ Express.js 

/chat, /reports, /auth 

Tables: users, reports, summaries, 

Database PostgreSQL via Supabase 

chat\_history 

File Storage Supabase Storage Store uploaded PDF/image files 

Summarization, Q&A chatbot, key 

AI OpenAI 

entity extraction, vision/OCR 

Auth JWT \(JSON Web Tokens\) Secure per-user sessions



