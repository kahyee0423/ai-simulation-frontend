# AI Simulation Laboratory (Frontend Part)

A modern, responsive web application and scientific research interface for the **Universal AI Simulation Laboratory**, built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Firebase**.

---

AI Simulation Laboratory Backend: https://github.com/kahyee0423/ai-simulation-backend.git

## Features

### 1. Interactive Scientific Simulation Dashboard
- **Natural Language Simulation Engine**: Submit complex multi-domain scenario prompts in plain language across 10+ natural languages with automatic language detection.
- **Live Pipeline Visualizer**: Real-time visual tracking of each stage in the multi-agent graph (`scenario_parser` ➔ `hypothesis_updater` ➔ `planner` ➔ `critic` ➔ `executor` ➔ `validator` ➔ `stats` ➔ `analyst`).
- **Comprehensive Research Report Viewer**:
  - Full Markdown rendering with tables, alerts, and mathematical formulations using `react-markdown` and `remark-gfm`.
  - **One-Click PDF Export**: High-fidelity publication-ready PDF download powered by `jspdf` and `html2canvas`.
- **Hypothesis & Bayesian Belief Panel**: Visual breakdown of prior hypotheses ($P(H_i)$) versus posterior experimental conclusions ($P(H_i|D)$).
- **Formal Simulation Specification**: Displays mathematical state variables, distributions, parameter values, and execution constraints.
- **Python Code Inspector**: Live inspection of dynamically generated simulation code with one-click copy to clipboard.
- **Sandboxed Terminal Monitor**: Live terminal stdout/stderr view reflecting raw Python execution output.
- **Statistical Summary Card**: Summarizes 95% confidence intervals, constraint violation metrics, and empirical probabilities.

### 2. Privacy & Session Lifecycle Security
- **Automatic History Purge**: Prevents stale result persistence. When a user closes the browser tab, closes the window, or navigates back, in-memory simulation states are automatically wiped via browser `pagehide` and visibility listeners.
- Historical records are securely isolated in Firestore for quota accounting without exposing cached analytical outputs across unauthenticated or re-opened browser sessions.

### 3. Authentication & Access Control
- **Firebase Authentication**: Full user lifecycle support:
  - Registration with email verification (`/register`)
  - Secure login (`/login`)
  - Auth guards preventing unauthorized access to simulation features (`AuthGuard.tsx`).
- **Usage Quotas & Limits**: Enforces per-user simulation quotas (tracked in Firestore).
- **Admin Command Center (`/admin`)**:
  - Live overview of registered users and usage metrics.
  - One-click quota reset for individual users.
  - Role-based authorization restricted to configured admin emails.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router architecture)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Auth & Database**: [Firebase SDK v12](https://firebase.google.com/) (Authentication & Firestore)
- **Document Rendering & Export**:
  - [React-Markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)
  - [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

## Directory Structure

```text
frontend/
├── app/
│   ├── admin/             # Admin management & quota dashboard (/admin)
│   ├── components/        # Modular UI components
│   │   ├── AccessDeniedScreen.tsx  # Fallback screen for unauthorized roles
│   │   ├── AuthGuard.tsx           # Route protection & auth verification
│   │   ├── CodeEditor.tsx          # Python code inspector
│   │   ├── HeroSection.tsx         # Simulation input & example prompts
│   │   ├── HypothesisPanel.tsx     # Bayesian prior/posterior belief tracker
│   │   ├── LoginScreen.tsx         # Authentication modal/view
│   │   ├── ResearchReport.tsx      # Markdown report viewer & PDF generator
│   │   ├── SimulationSpec.tsx      # Formal mathematical specification
│   │   ├── StatsSummary.tsx        # Statistical metrics & confidence intervals
│   │   ├── TerminalOutput.tsx      # Sandboxed terminal stdout console
│   │   ├── UsageLimitScreen.tsx    # Quota exhaustion notice
│   │   └── UserBadge.tsx           # User profile & sign-out badge
│   ├── context/
│   │   └── AuthContext.tsx         # Global Firebase auth context provider
│   ├── lib/
│   │   ├── firebase.ts             # Firebase client SDK initialization
│   │   └── firestore.ts            # Firestore quota & record operations
│   ├── register/                   # User registration page (/register)
│   ├── utils/
│   │   └── type.ts                 # TypeScript type declarations
│   ├── globals.css                 # Tailwind CSS styles & design tokens
│   ├── layout.tsx                  # Root layout wrapper with AuthProvider
│   └── page.tsx                    # Main interactive simulation workbench
├── public/                         # Static assets & icons
├── .env.example                    # Environment variable template
├── package.json                    # Dependencies & build scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Frontend documentation
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.18 or higher; Node 20+ recommended)
- `npm` (or `pnpm` / `yarn` / `bun`)

### 2. Installation
Navigate into the `frontend` folder and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` or `.env`:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# Firebase Web App Credentials (from Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Comma-separated list of Admin emails authorized for /admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Backend API Base URL (Calls FastAPI directly)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Building for Production
Verify types and build the production bundle:

```bash
npm run build
npm run start
```
