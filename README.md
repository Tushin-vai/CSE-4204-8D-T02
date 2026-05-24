**Project Title: ****Medical Report Analyzer **

**Team Information : **

**Team Leader : Hassan A.K. Azad Tushin \(11220320959\) **

**Members of Team: 
Farjana Easmin Minka \(11220320899\) **

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

**Report History: **
All past reports, AI summaries, and chat conversations saved per account. Users can revisit any prior report and continue asking questions. 



---

### 🔹 Core Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js | • Upload page <br> • Summary dashboard <br> • Chatbot panel <br> • Report history <br> • Authentication |
| | | |
| **Backend** | Node.js + Express.js | **REST API Endpoints:** <br><br> • `POST /upload` <br> • `POST /summarize` <br> • `POST /chat` <br> • `GET /reports` <br> • `POST /auth` |
| | | |
| **Database** | PostgreSQL (Supabase) | **Relational Tables:** <br><br> • `users` <br> • `reports` <br> • `summaries` <br> • `chat_history` |
| | | |
| **File Storage** | Supabase Storage | Store and manage uploaded PDF documents and image files |
| | | |
| **AI Integration** | OpenAI GPT-4o | • Document summarization <br> • Interactive Q&A chatbot <br> • Key entity extraction <br> • Vision & OCR processing |
| | | |
| **Authentication** | JWT (JSON Web Tokens) | Secure, stateless per-user sessions |

---

### 🚀 Deployment & Hosting

| Layer | Hosting Provider | Target |
| :--- | :--- | :--- |
| **Frontend Deployment** | Vercel | Production hosting for the React web app |
| | | |
| **Backend Deployment** | Render | Production hosting for the Express server API |

---

