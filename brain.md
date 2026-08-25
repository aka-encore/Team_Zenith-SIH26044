# Project Summary (brain.md)

## Project Overview
- **Name**: Academia-Industry Collaboration Portal (Team Zenith-SIH26044)
- **Purpose**: Connect students with companies for internships, projects, and job opportunities.
- **Stack**:
  - **Backend**: Node.js, Express, Mongoose (MongoDB), ES Modules (`"type": "module"`).
  - **Frontend**: Vite, React / Web framework.


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
