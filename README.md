# 🛡️ AegisTrust AI — Autonomous AI Security, Privacy & Trust Platform

> **Pioneering Sovereign AI Security, Zero-Knowledge Privacy & Cloud Malware Defense**  
> Built by **Team STARS**

---

## 👥 Team STARS Roster

| Role | Name | Roll Number | Verified LinkedIn |
| :--- | :--- | :--- | :--- |
| **Team Leader** | **SK.RAHIM** | `N25G01A0037` | [linkedin.com/in/shaik-rahim-893862363](https://www.linkedin.com/in/shaik-rahim-893862363) |
| **Member 1** | **Yv Charan teja** | `N25G01A0003` | [linkedin.com/in/yv-charan-teja-64310b384](https://www.linkedin.com/in/yv-charan-teja-64310b384) |
| **Member 2** | **Tholeti Venkata Hari Sai Sreekar** | `N25G01A0132` | [linkedin.com/in/harisaisreekar](https://www.linkedin.com/in/harisaisreekar) |

---

## 🚀 Overview

Modern organizations face severe vulnerabilities when adopting Generative AI:
1. **Sensitive Data Leakage:** Unprotected PII, API tokens, and confidential records pasted into third-party LLMs.
2. **Cloud & Email Malware Ingress:** Trojans, macro droppers, and credential stealers entering via Google Drive, Gmail, Outlook, AWS S3, GitHub, and Slack.
3. **AI Fraud & Hallucinations:** Executive impersonation (BEC wire transfers), synthetic invoice forgery, and unexplainable "black-box" model outputs.

**AegisTrust AI** is a full-stack, zero-trust cybersecurity platform that neutralizes these threats through client-side redaction, static AST heuristic scanning, and cryptographically verifiable trust ledgers.

---

## ⚡ Core Modules & Capabilities

- **🔐 Privacy Vault & Zero-Knowledge DLP:** Bi-directional regex + NER redaction converting PII into synthetic tokens (`[[PII_SSN_1]]`) before LLM routing. Ensures 0.00% sensitive data leakage under GDPR, HIPAA, and DPDP.
- **☁️ Mail & Drive Apps Malware Shield:** Live ingress monitoring across **Google Drive**, **Gmail**, **Microsoft Outlook 365**, **AWS S3 Storage**, **GitHub**, and **Slack** with 1-click quarantine.
- **🔍 Static AST Malware Sandbox:** Deconstructs scripts, binaries, and package manifests into abstract syntax trees in <15ms to detect eval injection, child_process execution, and reverse shells without sandbox escape risk.
- **🤖 Blue-Team AI Defense Assistant:** Dual-mode conversational SecOps co-pilot powered by Google Gemini (concise 5-line triage vs. deep-dive remediation scripts) protected by prompt injection firewalls.
- **📊 Trust Scorecard & Telemetry Radar:** 24-hour attack telemetry, live incident streams, and continuous alignment scoring against NIST AI RMF 1.0, ISO/IEC 42001, and OWASP Top 10 for LLMs.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 18 (SPA)
- **Bundler / Server:** Vite
- **Styling:** Tailwind CSS + Vanilla CSS Motion Graphics (Glassmorphism & Canvas Spacefield)
- **Icons:** Lucide React
- **API Client:** Native Fetch API with Bearer JWT interceptors and error recovery

### **Backend**
- **Runtime:** Node.js (ES Modules)
- **Server:** Express.js 4.x
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs password hashing (Salt 12)
- **Validation:** Zod schema validation
- **Database:** MongoDB (`mongoose` with automatic zero-config `MongoMemoryServer` fallback)
- **AI Engine:** Google Gemini API (`@google/genai` SDK, model: `gemini-3.1-flash-lite`)
- **Security Rule:** AI API keys are stored strictly in backend `.env` variables and never exposed to the frontend.

---

## 🚦 Quick Start & Setup

### **1. Prerequisites**
- Node.js >= 18.x
- Git

### **2. Clone & Install Dependencies**
```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd Sree_Ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/aegistrust
JWT_SECRET=super-secure-secret-key-at-least-32-chars-long
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
DEMO_MODE=true
SEED_DEMO_USER=true
```

In the `frontend/` directory, verify `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### **4. Run Locally**

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 📜 S.T.A.R.S. Doctrine
1. **S — Sovereign Threat Defense:** Autonomous AST inspection without third-party exposure.
2. **T — Trustworthy AI Governance:** Cryptographically chained SHA-256 audit blocks.
3. **A — Autonomous Incident Response:** 1-click cloud isolation & auto-generated patch diffs.
4. **R — Redaction-First Architecture:** Zero-knowledge PII tokenization before inference.
5. **S — Scalable Multi-Cloud Coverage:** Continuous zero-trust monitoring across inboxes and drives.

---

## 📄 License
This project is licensed under the MIT License — Developed for the Cyber AI Security Challenge by **Team STARS**.
