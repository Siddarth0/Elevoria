# Elevoria — Intelligent Collaborative Workspace SaaS Backend

![TypeScript](https://img.shields.io/badge/TypeScript-Backend-blue)
![Express](https://img.shields.io/badge/Express.js-API-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Gemini](https://img.shields.io/badge/Gemini-AI_Integrated-8E75FF)
![Status](https://img.shields.io/badge/Status-Backend_MVP_Complete-success)

A production-oriented **AI-powered collaborative task management SaaS backend** built with **Node.js, Express, TypeScript, Prisma, and PostgreSQL**.

Elevoria is being engineered as a modern **multi-tenant productivity platform** where teams can:

* create isolated workspaces,
* manage kanban boards and task pipelines,
* assign and collaborate on tasks,
* upload project attachments,
* leverage AI-assisted productivity workflows,
* and scale team operations under role-based access control.

This project is intentionally designed to go far beyond beginner CRUD applications and demonstrate **real-world backend architecture suitable for a strong junior developer portfolio**.

---

# Table of Contents

* [Tech Stack](#tech-stack)
* [Project Architecture Highlights](#project-architecture-highlights)
* [Completed Backend Features](#completed-backend-features)
* [API Modules](#api-modules)
* [Folder Structure](#folder-structure)
* [Environment Variables](#environment-variables)
* [Local Setup Instructions](#local-setup-instructions)
* [Upcoming Features](#upcoming-features)
* [Why This Project Stands Out](#why-this-project-stands-out)
* [Development Status](#development-status)

---

# Tech Stack

## Backend Core

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL

## Authentication & Security

* JWT Access + Refresh Token Authentication
* bcrypt Password Hashing
* httpOnly Cookie Session Handling
* Role Based Access Control (RBAC)
* Zod Request Validation

## Cloud / External Services

* Cloudinary (Task Attachments)
* Google Gemini API (AI Productivity Intelligence)

## Development Utilities

* Prisma Studio
* TypeScript Strict Mode
* ESLint
* Modular Route/Controller Architecture

---

# Project Architecture Highlights

* Multi-tenant SaaS workspace architecture
* Relational schema with 10+ interconnected models
* JWT dual-token auth workflow
* Membership-driven RBAC authorization
* Cloud file attachment pipeline
* AI productivity service integration
* Professional request validation and error handling
* Scalable modular backend organization

---

# Completed Backend Features

## Phase 1 — Foundation Setup

* [x] Professional Express + TypeScript backend initialization
* [x] Path alias configuration
* [x] Environment validation with Zod
* [x] Async handler & centralized error middleware
* [x] Standardized API response utilities
* [x] Prisma ORM + PostgreSQL integration

## Phase 2 — SaaS Database Schema

* [x] User model
* [x] Workspace model
* [x] WorkspaceMember junction table
* [x] Board model
* [x] Task model
* [x] Comment model
* [x] Attachment model
* [x] Notification model
* [x] Subscription model
* [x] AIHistory model
* [x] Enum-driven task status / priority / role management

## Phase 3 — Authentication System

* [x] Register
* [x] Login
* [x] Logout
* [x] Refresh token regeneration
* [x] bcrypt password hashing
* [x] JWT access/refresh token issuance
* [x] Cookie-based refresh persistence
* [x] Auth middleware protected routes
* [x] User response sanitization

## Phase 4 — Workspace + RBAC Module

* [x] Create workspace
* [x] Owner auto-enrollment
* [x] Fetch user workspaces
* [x] Add workspace members by email
* [x] OWNER / MANAGER / MEMBER role system
* [x] Role authorization middleware
* [x] Membership-based resource checks

## Phase 5 — Board + Task Management

* [x] Create boards
* [x] Fetch boards with nested tasks
* [x] Create tasks
* [x] Assign tasks to members
* [x] Update task workflow status
* [x] Add comments to tasks
* [x] Nested task fetch with comments/attachments/assignee

## Phase 6 — Cloud Attachment Uploads

* [x] Multer memory multipart handling
* [x] Cloudinary direct upload pipeline
* [x] Task attachment persistence
* [x] Attachment relation retrieval

## Phase 7 — AI Productivity Integration

* [x] Gemini document/project summarizer
* [x] Gemini subtask generator
* [x] Gemini deadline estimator
* [x] AI quota fallback handling
* [x] Persistent AIHistory logging

## Phase 8 — Backend Hardening

* [x] Request validation middleware
* [x] Validator schemas
* [x] Secure env-based cookies
* [x] Improved authorization guards
* [x] Sensitive field sanitization

---

# API Modules

## Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `POST /api/auth/refresh`

## Workspace Routes

* `POST /api/workspace/create`
* `GET /api/workspace/mine`
* `POST /api/workspace/add-member`

## Board Routes

* `POST /api/board/create`
* `GET /api/board/:workspaceId`

## Task Routes

* `POST /api/task/create`
* `GET /api/task/board/:boardId`
* `PATCH /api/task/status`
* `PATCH /api/task/assign`
* `POST /api/task/comment`
* `POST /api/task/attach`

## AI Routes

* `POST /api/ai/summarize`
* `POST /api/ai/subtasks`
* `POST /api/ai/deadline`

---

# Folder Structure

```bash
src/
 ┣ config/
 ┣ controllers/
 ┣ middlewares/
 ┣ routes/
 ┣ services/
 ┣ utils/
 ┣ validators/
 ┣ lib/
 ┣ types/
 ┣ app.ts
 ┗ server.ts
```

---

# Environment Variables

```env
PORT=5000
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
NODE_ENV=development
```

---

# Local Setup Instructions

```bash
git clone <your-repo-url>
cd elevoria/server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

# Upcoming Features

## Frontend SaaS Dashboard (Next.js)

* [ ] Premium authentication pages
* [ ] Workspace dashboard shell
* [ ] Sidebar navigation
* [ ] Drag-and-drop kanban board UI
* [ ] Task detail modal
* [ ] AI assistant panel
* [ ] Attachment viewer/download
* [ ] Backend API integration
* [ ] Protected frontend routes
* [ ] Token refresh client flow

## Additional Backend Enhancements

* [ ] Real-time notifications
* [ ] Activity audit logs
* [ ] Email workspace invitation system
* [ ] Multiple file uploads
* [ ] Attachment deletion
* [ ] Advanced AI document analyzer
* [ ] Stripe subscription billing
* [ ] Rate limiting
* [ ] Deployment configuration
* [ ] Unit/integration tests

---

# Why This Project Stands Out

Unlike typical tutorial CRUD repositories, Elevoria demonstrates:

* practical SaaS multi-tenant backend engineering,
* relational business workflows,
* cloud media handling,
* external AI provider integration,
* role based authorization,
* and production-minded modular architecture.

This project is intentionally being built as a **portfolio-grade full stack application capable of showcasing job-ready backend and frontend engineering skills**.

---

# Development Status

```txt
Backend Core API        ████████████████████  Completed MVP
AI Integration          ████████████████████  Completed
Cloud Uploads           ████████████████████  Completed
Frontend Dashboard      ███░░░░░░░░░░░░░░░░  Starting
Deployment              ░░░░░░░░░░░░░░░░░░░  Pending
```

---

# Author Note

Elevoria is currently under active iterative development with continuous architectural refinement, backend enhancement, and upcoming frontend implementation.

The goal is to evolve this repository into a fully deployable AI-powered collaborative productivity SaaS.

---

# License

MIT License
