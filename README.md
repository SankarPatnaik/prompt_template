# Prompt Template (React + TypeScript)

This repository has been migrated from the original Streamlit prototype to a production-ready React application.

## Migration summary

### What existed in Streamlit
- Single `app.py` rendered the full UI (sidebar filters/import/export, editor form, preview, and catalog).
- Core logic included placeholder extraction/rendering, token estimate, CSV import transformation, and upsert merge by slugified id.
- Persistence was file-based through `storage.py` writing to `data/prompts.json` plus `data/versions/*` snapshots.

### What is now implemented in React
- **React + TypeScript + Vite + Tailwind CSS** front-end architecture.
- Route-based pages:
  - Dashboard (`/`)
  - Prompt List (`/prompts`)
  - Prompt Detail (`/prompts/:id`)
  - Create Prompt (`/prompts/new`)
  - Edit Prompt (`/prompts/:id/edit`)
  - Category Management (`/categories`)
- Reusable components (`Layout`, `PromptCard`, `PromptForm`) and centralized state in `PromptProvider`.
- Search + filter support (keyword, category, tag, shared-only).
- Category management with defaults:
  - KYC, Legal, CRM, Data Governance, AI / GenAI, Compliance, Sales, Marketing, Other
  - Plus custom categories.
- Prompt fields aligned to business requirements:
  - title, description, content/template, category, tags, createdBy, createdDate, shared.
- Data seeding from existing `data/prompts.json` and persistence via `localStorage`.

## Tech stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Notes
- Legacy Streamlit files (`app.py`, `storage.py`) are still in the repo for traceability/reference.
- React source code lives in `src/`.
