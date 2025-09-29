# Cloud / System Architecture Overview

This document provides a high-level system context for the Todo App monorepo. The current MVP architecture emphasizes a self-contained frontend that persists task data locally (browser `localStorage`) while a simple Node/Express backend delivers a sample items API that is *not* part of the MVP task data flow (kept for instructional/demo purposes).

## Key Points
- Frontend (React) handles all Todo task CRUD in-browser; no backend dependency for task persistence per MVP scope.
- Backend (Express) currently exposes `/api/items` for sample data only.
- GitHub hosts the monorepo (version control, pull requests, potential CI/CD later).
- The browser environment supplies `localStorage` used as the persistence layer.
- Future Post-MVP changes (e.g., moving persistence server-side) would introduce new relationships not shown here.

## System Context Diagram

```mermaid
C4Context
  title System Context - Todo App Monorepo
  Person(user, "End User", "Creates and manages tasks in the browser")
  System_Boundary(boundary1, "Monorepo Workspace") {
    System(frontend, "React Frontend", "UI rendering, local task persistence, filtering")
    System(backend, "Node/Express API", "Sample /api/items endpoint (non-MVP for tasks)")
  }
  System_Ext(browser, "Browser Runtime", "Executes React; provides localStorage")
  System_Ext(github, "GitHub", "Hosts repository & PR workflow")

  Rel(user, browser, "Uses")
  Rel(browser, frontend, "Loads SPA")
  Rel(frontend, backend, "GET/POST /api/items", "HTTP JSON")
  Rel(frontend, browser, "Persist tasks", "localStorage")
  Rel(github, frontend, "Clone / Pull")
  Rel(github, backend, "Clone / Pull")
```

## Future Considerations
- Introducing a backend persistence service would add: Frontend → Persistence API (CRUD Tasks) and Backend → Database components.
- Potential CI/CD pipeline (GitHub Actions) could be represented as an external system triggering builds/deployments.
- Authentication or multi-user support (currently out-of-scope) would add an Auth Provider external system.

## Sequence: Create Todo Flow

```mermaid
sequenceDiagram
  autonumber
  actor User as End User
  participant UI as React UI
  participant Store as localStorage
  participant Backend as Express API

  User->>UI: Enter title, optional due date & priority
  UI->>UI: Validate date & normalize priority
  alt Invalid date
    UI->>UI: Omit dueDate field
  end
  UI->>Store: Read existing tasks array
  UI->>Store: Write updated tasks array (append new task)
  par (Non-MVP sample data)
    UI->>Backend: (Optional) Fetch /api/items
  end
  UI-->>User: Render updated task list & filters
```

## Change Log
- v1 (2025-09-29): Initial context diagram created.
- v2 (2025-09-29): Added create todo sequence diagram.
