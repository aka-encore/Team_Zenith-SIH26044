# Project Summary (brain.md)

## Project Overview
- **Project**: SkillNexus AI
- **SIH Problem Statement**: SIH26044 (Academia-Industry Collaboration Portal)
- **Team**: Team Zenith
- **Purpose**: Connect students with companies for internships, projects, and job opportunities through competency-driven skill mapping.
- **Stack**:
  - **Backend**: Node.js, Express, Mongoose (MongoDB), ES Modules (`"type": "module"`).
  - **Frontend**: Vite, React / Tailwind CSS.

> [!NOTE]
> **Branding Note**: "SkillBridge" was a temporary working name for this SIH project and has been replaced by the final working brand name **SkillNexus AI**. Do not confuse this project with the team's previous separate project named SkillBridge. All user-facing UI, documentation, and communications use **SkillNexus AI**.


## Architecture Diagram
```
[Client (Frontend)] <--HTTP/REST--> [Express Server (Backend)]
        |                                   |
        |                                   ├─ routes/* (studentRoutes, opportunityRoutes, etc.)
        |                                   ├─ controllers/* (business logic)
        |                                   ├─ models/* (Mongoose schemas: User, StudentProfile, Company, etc.)
        |                                   └─ utils/* & common.js (utility functions)
        |
        └─ MongoDB Database
```


## Key Modules
- **`backend/src/app.js`** – Server entry point, sets up Express app, routes & middleware.
- **`backend/src/common.js`** – ES-module utility helpers (`log`, `delay`, `safeParseJSON`).
- **`backend/src/routes/`** – Defines API endpoints for students, companies, opportunities, institutions, etc.
- **`backend/src/controllers/`** – Request handlers and business logic.
- **`backend/src/models/`** – Database schemas for core entities.


## Setup & Running Instructions

### 1. Backend Setup & Run
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (or configured PORT).*

### 2. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (or configured Vite port).*


---


## ⚠️ Code Style & Spacing Convention (MANDATORY)

**ALL AI agents and developers MUST follow this spacing rule across the entire codebase.**

### Rule: Add 2–3 blank lines between functions and logical sections

- Between **function/method definitions**: Add **2 blank lines** (i.e., one completely empty line separating them).
- Between **logical sections** within a file (e.g., imports → constants → hooks → handlers → JSX return): Add **2 blank lines**.
- Between **state groups** in React components (e.g., login states, register states, modals): Use **1 blank line**.
- Inside functions: Normal single-line spacing is fine.

### Examples

**JavaScript / JSX Functions:**
```js
// ✅ CORRECT — 2 blank lines between functions
const handleLogin = async (e) => {
  // ...logic...
};


const handleRegister = async (e) => {
  // ...logic...
};


const handleOAuth = (provider) => {
  // ...logic...
};
```

```js
// ❌ WRONG — No spacing between functions (hard to read)
const handleLogin = async (e) => {
  // ...logic...
};
const handleRegister = async (e) => {
  // ...logic...
};
const handleOAuth = (provider) => {
  // ...logic...
};
```

**Between Logical Sections:**
```js
import React from 'react';
import { useState } from 'react';


const MyComponent = () => {
  const [value, setValue] = useState('');


  const handleSubmit = () => {
    // ...
  };


  return (
    <div>...</div>
  );
};
```

### Why This Matters
- Makes code easier to scan and understand at a glance
- Clearly separates different concerns within a file
- Improves code review speed and collaboration
- Consistent across all frontend and backend files

### Files This Applies To
- All `.js`, `.jsx` files in `frontend/src/`
- All `.js` files in `backend/src/`
- Including: components, pages, context, routes, controllers, models, middleware, utils

---
*This file serves as a quick documentation guide for AI agents and developers.*


---


## 🔐 Authentication System

### Email / Password — ✅ COMPLETED
- `POST /api/auth/register` — creates a new user, hashes password with bcrypt
- `POST /api/auth/login` — validates credentials, returns JWT (30-day)
- JWT stored in `localStorage`, read back by `AuthContext`
- Role-based: `student`, `company`, `institution`, `academician`, `admin`
- Company accounts start as `status: 'pending'`

### Testing Accounts (seeded)
| Email | Password | Role |
|---|---|---|
| `student@test.com` | `password123` | student |
| `company@test.com` | `password123` | company |
| `institution@test.com` | `password123` | institution |

Reseed anytime: `node src/utils/seedUsers.js` (from `backend/`)


### Login UI — ✅ COMPLETED (redesigned)
- **Left illustration panel removed** — page is now a fully-centered card
- Card: `max-w-480px`, dark navy, `bg-slate-900`, `border-slate-800`, `rounded-2xl`
- Role selector (Student / Company / Institution) at the top
- Email + Password fields, Forgot Password modal
- **Microsoft button REMOVED**
- Google + LinkedIn OAuth buttons wired to real backend endpoints
- Responsive: full-width on mobile, centered on desktop
- Signup page uses same `AuthPage` component with `initialMode="register"`

### Google OAuth — ✅ IMPLEMENTED / ⚙️ NEEDS CREDENTIALS
- Flow: `GET /api/auth/google` → Google → `GET /api/auth/google/callback` → `http://localhost:5173/auth/callback`
- Handles: new user → role picker → account creation
- Handles: existing user → account linking by provider ID + verified email
- **Status: NEEDS CONFIGURATION**
  - Get credentials: https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID
  - Authorized redirect URI to register: `http://localhost:5000/api/auth/google/callback`
  - Add to `backend/.env`: `GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=`

### LinkedIn OIDC — ✅ IMPLEMENTED / ⚙️ NEEDS CREDENTIALS
- Flow: `GET /api/auth/linkedin` → LinkedIn → `GET /api/auth/linkedin/callback` → `http://localhost:5173/auth/callback`
- Uses LinkedIn's OpenID Connect (OIDC) flow — **NOT the deprecated legacy API**
- Scopes requested: `openid profile email`
- **Status: NEEDS CONFIGURATION**
  - Get credentials: https://www.linkedin.com/developers/apps → Create App
  - Authorized redirect URL to register: `http://localhost:5000/api/auth/linkedin/callback`
  - Add to `backend/.env`: `LINKEDIN_CLIENT_ID=`, `LINKEDIN_CLIENT_SECRET=`

### Microsoft Auth — ✅ REMOVED
- Microsoft OAuth button removed from Login and Register pages
- No Microsoft-related auth code exists anywhere in the project

### OAuth Callback Pages (Frontend)
| Route | File | Purpose |
|---|---|---|
| `/auth/callback` | `OAuthCallback.jsx` | Receives `?token=&user=` from backend, stores in localStorage, redirects to dashboard |
| `/auth/oauth/role` | `OAuthRoleSelect.jsx` | New OAuth users pick a role before account creation |

### User Model (updated)
New fields added (non-breaking — existing users unaffected):
- `passwordHash` — now **optional** (OAuth-only accounts have no password)
- `authProviders[]` — stores `{ provider, providerId }` pairs (google / linkedin)
- `avatarUrl` — profile picture URL from OAuth provider
- `emailVerified` — boolean, set from provider's claim

### Environment Variables Required
```bash
# Add to backend/.env
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
LINKEDIN_CLIENT_ID=<from LinkedIn Developer Portal>
LINKEDIN_CLIENT_SECRET=<from LinkedIn Developer Portal>
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback
```

