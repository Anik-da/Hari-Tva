# HariTva – The AI Sustainability Operating System

**HariTva** is a premium, enterprise-grade sustainability intelligence platform built to predict ecological impacts, simulate alternatives, and execute decentralized carbon-neutral initiatives. 

It unifies real-time carbon tracking, AI-driven mentorship, and OCR bill scanning into a cohesive "Liquid Glass" design system, ensuring absolute technical robustness while delivering a state-of-the-art user experience.

---

## 🔗 Live Deployments
- **Production Hub:** [https://hari-tva.web.app](https://hari-tva.web.app)
- **Firebase Console Project ID:** `hari-tva`

---

## ⚡ Key Achievements & Features

### 1. Unified AI Pipeline (Hugging Face Serverless)
Migrated core generative AI and vision tasks from generic models to dedicated open-weights architectures running on Hugging Face Serverless Inference APIs:
- **Reasoning & Advices (AI Mentor):** Powered by `Qwen/Qwen2.5-7B-Instruct` using ChatML formatting.
- **Visual Carbon Analysis (OCR Scanner):** Powered by `Qwen/Qwen2-VL-7B-Instruct`.
- **Fault-Tolerant Vision Pipeline:** Dynamic fallback queries to `Salesforce/blip-image-captioning-large` paired with Qwen2.5 parsing.

### 2. High-Fidelity Earth Visualization
Features an asynchronous dual-layer 3D WebGL Globe:
- Immediate procedural fallback texture to eliminate black screen/loading lag.
- Asynchronous high-resolution texture map loading (`earth_atmos_2048.jpg`) for rich, realistic space-visual telemetry.

### 3. Competitor-Beating UI & Dashboards
- **Gamified Standings:** Level progress bar tracking points to next milestone.
- **Unlockable Badges:** Visually satisfying achievements (Transit Pioneer, Vampire Slayer, etc.).
- **Priority Matrix:** A mathematical prioritizer sorting actionable suggestions by carbon impact, effort, and financial returns.

---

## 🛠️ Technical Stack
- **Frontend:** Next.js 15 (App Router, static export configuration)
- **Styling:** Tailwind CSS, Custom Glassmorphism Utility Classes
- **Database & Auth:** Firebase Auth, Firebase Firestore
- **Serverless Compute:** Firebase Cloud Functions (v2)
- **Data Viz:** Recharts, React Three Fiber (WebGL Globe)

---

## 🔐 Environment Variables & Security
To keep API credentials safe and secure, they are **never** committed to public repositories. Environment variables are loaded dynamically:

### Local Development (`.env.local`)
Create a `.env.local` file in the project root:
```env
HF_TOKEN=your_hugging_face_token_here
```

### Firebase Cloud Functions (`functions/.env`)
Create a `.env` file in the `functions/` directory:
```env
HF_TOKEN=your_hugging_face_token_here
```
When deploying, Firebase CLI automatically packages this secret token for cloud runtime access.

---

## 🚀 Running Locally

1. **Install Dependencies:**
```bash
npm install
cd functions
npm install
cd ..
```

2. **Run Dev Server:**
```bash
npm run dev
```

3. **Verify Static Export:**
```bash
npm run build
```

---

## 🚢 Deploying to Firebase

Deploy both static web files and the serverless API routes (Cloud Functions):
```bash
npx firebase deploy
```

---
Proprietary © HariTva Engineering Team.
