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
- **Import/Export** as JSON, YAML, or upload **raw prompts via CSV** that are auto-optimised into the framework
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

## CSV import format

Upload a `.csv` file from the **Import / Export** panel to bulk-create templates from existing prompt drafts. The app accepts
the following optional columns:

| Column | Description |
| --- | --- |
| `prompt` (or `raw_prompt`/`text`) | Free-form prompt text. Used to auto-generate the optimised System/User blocks. |
| `name` | Friendly template name. Defaults to `Imported Prompt N`. |
| `description` | Short summary shown in the catalog. |
| `use_case`, `audience`, `tone`, `model_family`, `owner`, `status` | Populate the matching metadata fields. |
| `tags` | Comma-separated list of tags. Defaults to `imported`. |
| `system`, `user` | Provide explicit prompt blocks. If blank, the importer generates a structured version automatically. |
| `variables` | Semi-colon separated entries in the form `name:description:default`. |
| `tools`, `evaluation` / `evaluation_criteria`, `references`, `safety_do`, `safety_dont` | Optional advanced fields. |

Each imported row is merged by template `id` (slugified name), updating existing entries when the slug matches an existing
template. If neither `system` nor `user` columns are provided, the importer wraps the raw prompt with a best-practice workflow
so the resulting template is immediately ready for use in the repository.

## Tips
- Use `{{variable}}` inside your prompt text. The app builds a form for these automatically based on your variable list.
- Use tags and statuses (`approved`) to help downstream users pick the right template quickly.
- Use the **Evaluation Criteria** field to encode acceptance tests for prompts (e.g., "Should include 3 bullet points and a CTA").

## Prompt template framework
Follow the steps below when adding or refining a template in the repository. Each column appears in the Streamlit editor and the exported JSON/YAML files.

1. **Name** – Give the template a short, memorable title so others can find it quickly.
2. **Description** – Summarize what the prompt accomplishes and when to use it.
3. **Use Case** – Provide context about the business or technical scenario the prompt supports.
4. **Audience** – Specify who will read the generated content (e.g., executives, developers, end users).
5. **Tone** – Describe the desired voice or style (professional, friendly, authoritative, etc.).
6. **Model Family** – Select the model family the prompt was designed for (OpenAI, Anthropic, Azure OpenAI, Mistral, Local). Use tags if it fits multiple families.
7. **Tags** – Add keywords that improve discoverability (domain, function, language).
8. **Owner** – Record the individual or team responsible for maintaining the prompt.
9. **Status** – Track lifecycle with `draft`, `approved`, or `deprecated` so users know whether it is production ready.
10. **Variables** – List `{{variable}}` placeholders with default values and descriptions. This drives the auto-generated form.
11. **System Instructions** – Define non-negotiable guardrails or role directives for the assistant.
12. **User Instructions** – Provide the main prompt body that will be populated with variables.
13. **Tool/Function Instructions (optional)** – Describe functions the model can call, if applicable.
14. **Safety Checklist (Do / Don't)** – Capture safety requirements, restricted topics, or tone-of-voice constraints.
15. **Evaluation Criteria** – Outline how to judge a successful response; this is useful for reviewers and automated tests.
16. **References/Links** – Link to documentation, specifications, or inspiration that supports the template.

Tip: When a column does not apply, leave it blank rather than forcing placeholder text. This keeps exports clean and avoids confusing downstream users.

## Sample templates
Use these examples as starting points. Replace the placeholder variables and metadata to match your organization’s needs. The same, production-ready templates are available inside `data/prompts.json` so they can be loaded directly by the Streamlit app without additional editing.

### NLP to SQL query prompt
```yaml
name: "NLP to SQL translator"
description: "Convert natural-language analytics requests into validated SQL queries."
use_case: "Self-service analytics for the product team"
audience: "Internal analysts with read-only warehouse access"
tone: "Precise and instructive"
model_family: "OpenAI"
tags: [analytics, sql, translation]
owner: "Data Platform Team"
status: "approved"
variables:
  - name: user_request
    default: "Show weekly active users for the last 8 weeks"
    description: "Plain-language request from the analyst"
system_instructions: |
  You are an expert data engineer. Generate safe SQL that only reads from the analytics schema.
user_instructions: |
  Convert the following request into a single SQL query. Use `{{user_request}}` as the description.
  Validate table and column names against the analytics catalog. Return only SQL wrapped in triple backticks.
safety:
  do: ["Confirm tables exist", "Warn if the request is impossible"]
  dont: ["Modify data", "Reference unknown schemas"]
evaluation_criteria: |
  - Query executes without modification in the warehouse sandbox.
  - Output uses fully qualified table names.
references: ["https://internal.wiki/analytics-schema"]
```

### Code creation prompt
```yaml
name: "Backend API endpoint generator"
description: "Drafts a Flask endpoint with validation and docstring based on requirements."
use_case: "Speed up boilerplate creation for Python services"
audience: "Backend engineers"
tone: "Technical and concise"
model_family: "Anthropic"
tags: [python, flask, backend]
owner: "Platform Engineering"
status: "draft"
variables:
  - name: endpoint_name
    default: "create_order"
    description: "Function name for the new endpoint"
  - name: request_fields
    default: "customer_id: str, items: List[ItemPayload]"
    description: "Parameters the endpoint accepts"
  - name: success_response
    default: "OrderConfirmation"
    description: "Schema returned when the request succeeds"
system_instructions: |
  You are a senior Python engineer following company lint rules (black, ruff) and using Pydantic v2 models.
user_instructions: |
  Write a Flask endpoint named `{{endpoint_name}}` that validates `{{request_fields}}` and returns `{{success_response}}`.
  Include a docstring explaining the purpose and a simple unit test example.
evaluation_criteria: |
  - Code passes black formatting.
  - Validation errors return HTTP 400 with clear messages.
references: ["https://internal.wiki/python-style-guide"]
```

### Marketing prompt
```yaml
name: "Product launch email copy"
description: "Creates a launch announcement email aligned with brand guidelines."
use_case: "Announcing new features to existing customers"
audience: "B2B SaaS admins"
tone: "Upbeat and trustworthy"
model_family: "Azure OpenAI"
tags: [marketing, email, launch]
owner: "Demand Gen Team"
status: "approved"
variables:
  - name: product_name
    default: "InsightHub Analytics"
    description: "Name of the product or feature"
  - name: key_benefits
    default: "Real-time dashboards; Automated alerts; Customizable KPIs"
    description: "Top benefits to highlight"
  - name: call_to_action
    default: "Book a personalized walkthrough"
    description: "Desired next step"
system_instructions: |
  You are a marketing copywriter who maintains a trustworthy, solutions-oriented tone.
user_instructions: |
  Draft an announcement email for `{{product_name}}` emphasizing `{{key_benefits}}`. Close with `{{call_to_action}}`.
  Provide a compelling subject line and three bullet points summarizing benefits.
safety:
  do: ["Follow brand voice", "Stay compliant with CAN-SPAM"]
  dont: ["Overpromise results", "Use negative competitor comparisons"]
evaluation_criteria: |
  - Email length under 250 words.
  - Subject line under 60 characters.
references: ["https://internal.wiki/brand-voice"]
```

---

© 2025 Prompt Repository Starter. MIT License.
