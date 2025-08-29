# GenAI Prompt Template Repository (Streamlit)

A lightweight Streamlit app to **collect, curate, version, search, and export/import** prompt templates for GenAI solutions.

## Features
- Create and edit prompt templates with metadata:
  - Name, Description, Use Case, Audience, Tone
  - Model family (OpenAI, Anthropic, Azure OpenAI, Mistral, Local)
  - Tags, Owner, Status (draft/approved/deprecated)
  - Variables with defaults and descriptions (Jinja-style `{{variable}}` placeholders)
  - System, User, and (optional) Tool/Function instructions blocks
  - Safety checklist (Do / Don't), Evaluation criteria, and References/Links
- **Search & filter** by keyword, tags, model family, status, and owner
- **Live preview** with a generated form to fill variables → rendered prompt preview
- **Versioning**: every save writes a new timestamped version
- **Import/Export** as JSON or YAML
- **Copy-to-clipboard** helpers for rendered prompt
- **Local-first storage** using JSON files under `data/`

> No API calls are made from this app. It is a repository/preview tool for prompt engineering teams.

## Quickstart
```bash
# 1) Create and activate a virtual environment (optional)
python -m venv .venv && source .venv/bin/activate

# 2) Install dependencies
pip install -r requirements.txt

# 3) Run the app
streamlit run app.py
```

## Data layout
- `data/prompts.json` — main store
- `data/versions/` — timestamped snapshots upon save
- `data/imports/` — (created on demand) stores uploaded files for traceability

## Tips
- Use `{{variable}}` inside your prompt text. The app builds a form for these automatically based on your variable list.
- Use tags and statuses (`approved`) to help downstream users pick the right template quickly.
- Use the **Evaluation Criteria** field to encode acceptance tests for prompts (e.g., "Should include 3 bullet points and a CTA").

---

© 2025 Prompt Repository Starter. MIT License.
