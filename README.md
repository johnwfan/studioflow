# StudioFlow

StudioFlow is a full-stack workflow platform for creators and small production teams to plan, track, and organize content from idea to publish.

The app is built around a simple but practical production pipeline: create projects, assign them a content type, move them through workflow stages, attach notes and links, track associated tasks, and keep scheduled work visible in one place.

## Why I built this

Most creator tools are either too lightweight to manage real production work or too bloated for solo creators and small teams. I wanted to build something in the middle: a focused workspace for content operations that feels more structured than a notes app, but much simpler than enterprise project software.

StudioFlow is my take on that. The goal is to make content planning feel intentional and organized without slowing down the creative process.

## What it does

- Authenticated workspace with protected application routes
- Project management for content in progress
- Workflow board organized by production stage
- Task tracking tied to projects
- Calendar view for scheduled content
- Theme customization with multiple curated themes
- User-specific data isolation so each user only sees their own workspace

## Core features

### 1. Project management

Users can create and manage projects with:

- title
- description
- notes
- content type
- workflow status
- optional publish date

Projects are modeled around real creator workflows rather than generic tickets.

### 2. Workflow pipeline

Projects move through a defined production lifecycle:

- Idea
- Scripting
- Filming
- Editing
- Scheduled
- Published

This makes the app feel more like a content operations tool than a generic task board.

### 3. Task tracking

Each project can have associated tasks with completion state. Task progress is surfaced in the UI so a project is not just a title and status — it has visible execution progress behind it.

### 4. Calendar visibility

Scheduled content can be surfaced in a calendar-oriented view to make publishing plans easier to reason about.

### 5. Theming and personalization

StudioFlow includes a theme system with curated visual modes instead of a single dark/light toggle. Themes are persisted across sessions to make the workspace feel personal and polished.

### 6. Authentication and route protection

StudioFlow uses Clerk for authentication and protects the core app experience behind authenticated routes such as:

- `/dashboard`
- `/projects`
- `/workflow`
- `/calendar`
- `/settings`

## Tech stack

### Frontend

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- Lucide React

### Backend / data

- Prisma ORM
- PostgreSQL
- `pg`
- Prisma Postgres adapter

### Auth

- Clerk

### Tooling

- TypeScript
- ESLint

## Data model

The current schema is centered around three main entities:

### `Project`

Represents a piece of content being planned or produced.

Key fields include:

- `title`
- `description`
- `notes`
- `status`
- `contentType`
- `publishDate`
- `userId`

### `Task`

Represents a task associated with a project.

Key fields include:

- `text`
- `completed`
- `projectId`

### `AssetLink`

Represents an external link tied to a project, such as references, assets, or supporting material.

Key fields include:

- `label`
- `url`
- `projectId`

## Architecture notes

A few implementation choices I cared about:

- **Server-side user scoping**: project queries are filtered by authenticated user so the app is structured around per-user workspaces.
- **Protected app shell**: core routes are guarded at the middleware level.
- **Relational data model**: tasks and asset links are attached to projects through explicit relations rather than stored in loose blobs.
- **App Router structure**: pages are separated by product surface area (`dashboard`, `projects`, `workflow`, `calendar`, `settings`) to keep the codebase easy to extend.
- **Theme persistence**: theme selection is stored so workspace customization survives refreshes and repeat visits.

## Current product surfaces

### Dashboard

High-level overview of active work, recent projects, and task progress.

### Projects

Main project listing and filtering experience for browsing content work by status and type.

### Workflow

Kanban-style workflow view grouped by production stage.

### Calendar

Planning view for projects with publish dates.

### Settings

Workspace customization, profile-related settings, and theme selection.

## Local development

### 1. Clone the repository

    git clone https://github.com/johnwfan/studioflow.git
    cd studioflow

### 2. Install dependencies

    npm install

### 3. Create environment variables

Create a `.env` file in the project root and add the required values.

Example:

    DATABASE_URL=your_postgres_connection_string
    
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key

Depending on your local setup, you may also need any additional Prisma or Clerk environment variables used by your deployment configuration.

### 4. Generate the Prisma client

    npx prisma generate

### 5. Push the schema to your database

    npx prisma db push

### 6. Start the dev server

    npm run dev

Then open:

    http://localhost:3000

## Scripts

    npm run dev      # start development server
    npm run build    # production build
    npm run start    # start production server
    npm run lint     # run ESLint

## Screenshots

### Landing Page
<img width="1470" height="811" alt="image" src="https://github.com/user-attachments/assets/5931d3a3-39f8-43af-9b0c-206c86bd4013" />

### Dashboard
<img width="1470" height="811" alt="image" src="https://github.com/user-attachments/assets/bd969da0-845c-4834-af6d-df62c0fcec4b" />

### Projects
<img width="1470" height="811" alt="image" src="https://github.com/user-attachments/assets/dc37c560-69be-47a2-bb4e-7a030e3a81f7" />

### Workflow
<img width="1470" height="811" alt="image" src="https://github.com/user-attachments/assets/78a56b24-517b-40c2-9296-80470ba0cf36" />

### Calendar
<img width="1470" height="811" alt="image" src="https://github.com/user-attachments/assets/b1fca1fe-d9a4-44cb-8fab-d797aadf4400" />

### Themes
<img width="1126" height="770" alt="image" src="https://github.com/user-attachments/assets/fdb84c07-f588-44b8-a8b4-122a0eae82e9" />





## Roadmap

Some areas I plan to keep improving:

- richer create/edit project flows
- drag-and-drop workflow interactions
- better loading, empty, and success states
- asset management improvements
- collaboration and workspace features
- analytics for output cadence and completion trends
- stronger onboarding for first-time users

## What I’d improve next

If I were continuing this as the next major iteration, I’d focus on:

- making project creation and editing more robust
- improving UX polish across empty, loading, and error states
- expanding the calendar into a stronger scheduling tool
- introducing team and workspace support
- adding activity history and audit-style timeline views

## Repository status

StudioFlow is actively being built and refined. The current version already has the core app structure in place, and the next work is focused on polishing the product experience and deepening the workflow features.

## Demo

Add once available:

    Live demo: [studioflow-demo-link]

## Author

**John Fan**

GitHub: [@johnwfan](https://github.com/johnwfan)
