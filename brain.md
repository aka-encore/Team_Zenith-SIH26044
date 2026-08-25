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
*This file serves as a quick documentation guide for AI agents and developers.*
