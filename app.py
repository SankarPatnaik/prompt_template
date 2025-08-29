\
import json
import os
import re
import time
from datetime import datetime
from typing import List, Dict, Any

import streamlit as st
import yaml
from slugify import slugify

DATA_PATH = "data/prompts.json"
VERSIONS_DIR = "data/versions"
IMPORTS_DIR = "data/imports"

# --------------- Utilities ---------------

def _ensure_dirs():
    os.makedirs("data", exist_ok=True)
    os.makedirs(VERSIONS_DIR, exist_ok=True)
    os.makedirs(IMPORTS_DIR, exist_ok=True)

def load_store() -> Dict[str, Any]:
    _ensure_dirs()
    if not os.path.exists(DATA_PATH):
        return {"meta": {"version": 1, "updated_at": datetime.utcnow().isoformat() + "Z"}, "templates": []}
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def save_store(store: Dict[str, Any]) -> None:
    _ensure_dirs()
    # version snapshot
    ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    snap_path = os.path.join(VERSIONS_DIR, f"prompts-{ts}.json")
    with open(snap_path, "w") as f:
        json.dump(store, f, indent=2)
    # current
    store["meta"]["updated_at"] = datetime.utcnow().isoformat() + "Z"
    with open(DATA_PATH, "w") as f:
        json.dump(store, f, indent=2)

def extract_placeholders(text: str) -> List[str]:
    # Find {{var}} patterns
    return sorted(set(re.findall(r"\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}", text or "")))

def render_with_vars(text: str, variables: Dict[str, str]) -> str:
    def replacer(m):
        key = m.group(1).strip()
        return str(variables.get(key, m.group(0)))
    return re.sub(r"\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}", replacer, text or "")

def token_estimate(s: str) -> int:
    # Naive token estimate (~4 chars per token heuristic). For rough sizing only.
    if not s:
        return 0
    return max(1, int(len(s) / 4))

def find_template(store: Dict[str, Any], template_id: str) -> Dict[str, Any] | None:
    for t in store.get("templates", []):
        if t.get("id") == template_id:
            return t
    return None

# --------------- UI: Sidebar ---------------

st.set_page_config(page_title="GenAI Prompt Template Repository", page_icon="🧩", layout="wide")

st.sidebar.title("🧩 Prompt Repo")
st.sidebar.caption("Curate, version, and share prompt templates.")

store = load_store()

# Import/export
with st.sidebar.expander("📤 Import / Export", expanded=False):
    fmt = st.radio("Format", ["JSON", "YAML"], horizontal=True)
    col_imp, col_exp = st.columns(2)
    with col_imp:
        up = st.file_uploader(f"Import {fmt}", type=["json"] if fmt=="JSON" else ["yml", "yaml"])
        if up is not None:
            try:
                raw = up.read()
                if fmt == "JSON":
                    imported = json.loads(raw)
                else:
                    imported = yaml.safe_load(raw)
                if isinstance(imported, dict) and "templates" in imported:
                    # Merge strategy: upsert by id
                    existing_ids = {t["id"] for t in store.get("templates", [])}
                    new_count, upd_count = 0, 0
                    for t in imported["templates"]:
                        if t["id"] in existing_ids:
                            # replace existing
                            for i, ex in enumerate(store["templates"]):
                                if ex["id"] == t["id"]:
                                    store["templates"][i] = t
                                    upd_count += 1
                                    break
                        else:
                            store["templates"].append(t)
                            new_count += 1
                    save_store(store)
                    # keep original file
                    with open(os.path.join(IMPORTS_DIR, f"import-{int(time.time())}.{fmt.lower()}"), "wb") as f:
                        f.write(raw)
                    st.success(f"Imported {new_count} new, updated {upd_count} templates.")
                else:
                    st.error("Invalid structure: expected an object with a 'templates' array.")
            except Exception as e:
                st.exception(e)
    with col_exp:
        if st.button(f"Export {fmt}"):
            payload = store
            if fmt == "JSON":
                st.download_button("Download JSON", data=json.dumps(payload, indent=2), file_name="prompts-export.json")
            else:
                st.download_button("Download YAML", data=yaml.safe_dump(payload, sort_keys=False), file_name="prompts-export.yaml")

# Filters
with st.sidebar.expander("🔎 Filters", expanded=True):
    q = st.text_input("Keyword search (name/desc/text/tags/owner)", placeholder="e.g., email, onboarding, RAG")
    all_tags = sorted({tag for t in store.get("templates", []) for tag in t.get("tags", [])})
    tag_sel = st.multiselect("Tags", options=all_tags)
    model_sel = st.multiselect("Model family", options=sorted({t.get("model_family","") for t in store.get("templates", []) if t.get("model_family")}))
    status_sel = st.multiselect("Status", options=["draft","approved","deprecated"])
    owner_sel = st.multiselect("Owner", options=sorted({t.get("owner","") for t in store.get("templates", []) if t.get("owner")}))

# --------------- UI: Main ---------------

st.title("GenAI Prompt Template Repository")
st.write("A local-first catalog for your best prompts.")

# Create / Edit form
st.subheader("✍️ Create or Edit Template")
with st.form("editor", clear_on_submit=False):
    col1, col2 = st.columns([2,1])
    with col1:
        name = st.text_input("Name*", placeholder="e.g., Welcome Email (Friendly)")
        description = st.text_area("Description", height=80, placeholder="What this template is for and how to use it.")
        use_case = st.text_input("Use Case", placeholder="e.g., Email Copy, Code Generation, Summarization")
        audience = st.text_input("Audience", placeholder="e.g., End Users, Developers, Analysts")
        tone = st.text_input("Tone", placeholder="e.g., Friendly, Professional, Playful, Formal")
        model_family = st.selectbox("Model Family", ["OpenAI", "Anthropic", "Azure OpenAI", "Mistral", "Local", "Other"])
        tags = st.text_input("Tags (comma-separated)", placeholder="e.g., email, onboarding, marketing")
        owner = st.text_input("Owner / Team", placeholder="e.g., templates-core, marketing")
        status = st.selectbox("Status", ["draft", "approved", "deprecated"], index=0)
    with col2:
        sys_prompt = st.text_area("System", height=120, placeholder="High-level system instructions for the model.")
        user_prompt = st.text_area("User", height=220, placeholder="User-facing template text. Use {{variables}}.")
        tools = st.text_area("Tools/Functions (optional)", height=80, placeholder="Describe tool instructions or functions if any.")
        eval_criteria = st.text_area("Evaluation Criteria (optional)", height=80, placeholder="Acceptance tests for outputs.")
        references = st.text_area("References (optional, one per line)", height=60, placeholder="Links / docs / examples")
        safety_do = st.text_area("Safety – Do (optional, one per line)", height=60)
        safety_dont = st.text_area("Safety – Don't (optional, one per line)", height=60)

    # Variables block
    st.markdown("#### Variables")
    # auto-detect
    detected = sorted(set(extract_placeholders(user_prompt)) | set(extract_placeholders(sys_prompt)))
    st.caption("Detected from prompts: " + (", ".join(detected) if detected else "—"))
    var_rows = st.session_state.get("var_rows", [])
    # sync session var list with detected (add if missing)
    for d in detected:
        if d not in [v.get("name") for v in var_rows]:
            var_rows.append({"name": d, "description": "", "default": ""})
    # show editable table
    new_rows = []
    for i, row in enumerate(var_rows):
        c1, c2, c3 = st.columns([1,2,2])
        with c1:
            name_i = st.text_input(f"Var name {i+1}", key=f"vn_{i}", value=row["name"])
        with c2:
            desc_i = st.text_input(f"Description {i+1}", key=f"vd_{i}", value=row.get("description",""))
        with c3:
            def_i = st.text_input(f"Default {i+1}", key=f"vv_{i}", value=row.get("default",""))
        new_rows.append({"name": name_i, "description": desc_i, "default": def_i})
    st.session_state["var_rows"] = new_rows
    add_var = st.form_submit_button("➕ Add variable")
    if add_var:
        var_rows.append({"name": f"var_{len(var_rows)+1}", "description": "", "default": ""})
        st.session_state["var_rows"] = var_rows
        st.experimental_rerun()

    # Identify existing template id from name slug
    tid = slugify(name) if name else ""
    submit = st.form_submit_button("💾 Save Template")
    if submit:
        if not name:
            st.error("Name is required.")
        else:
            tpl = {
                "id": tid,
                "name": name,
                "description": description,
                "use_case": use_case,
                "audience": audience,
                "tone": tone,
                "model_family": model_family,
                "tags": [t.strip() for t in tags.split(",") if t.strip()],
                "owner": owner,
                "status": status,
                "variables": [{"name": r["name"], "description": r["description"], "default": r["default"]} for r in new_rows if r["name"]],
                "system": sys_prompt,
                "user": user_prompt,
                "tools": tools,
                "safety": {"do": [l for l in safety_do.splitlines() if l.strip()],
                           "dont": [l for l in safety_dont.splitlines() if l.strip()]},
                "evaluation": eval_criteria,
                "references": [l for l in references.splitlines() if l.strip()],
                "updated_at": datetime.utcnow().isoformat() + "Z",
            }
            existing = find_template(store, tid)
            if existing:
                # keep created_at
                tpl["created_at"] = existing.get("created_at", datetime.utcnow().isoformat() + "Z")
                # replace
                for i, ex in enumerate(store["templates"]):
                    if ex["id"] == tid:
                        store["templates"][i] = tpl
                        break
                st.success(f"Updated template '{name}'.")
            else:
                tpl["created_at"] = datetime.utcnow().isoformat() + "Z"
                store["templates"].append(tpl)
                st.success(f"Created template '{name}'.")
            save_store(store)

# Preview panel
st.subheader("🔍 Preview & Tryout")
col_l, col_r = st.columns(2)
with col_l:
    # Pick a template
    all_names = [t["name"] for t in store.get("templates", [])]
    pick = st.selectbox("Select a template", options=["—"] + all_names, index=0)
    chosen = None
    if pick != "—":
        chosen = next((t for t in store["templates"] if t["name"] == pick), None)
        if chosen:
            st.json({k: v for k, v in chosen.items() if k not in ["system","user","tools"]})
with col_r:
    if chosen:
        st.markdown("**System**")
        st.code(chosen.get("system","") or "—")
        st.markdown("**User**")
        st.code(chosen.get("user","") or "—")
        if (chosen.get("tools") or "").strip():
            st.markdown("**Tools/Functions**")
            st.code(chosen.get("tools",""))

# Runtime variable fill + render
if pick != "—" and chosen:
    st.markdown("### 🧪 Fill Variables & Render")
    runtime_vals = {}
    for v in chosen.get("variables", []):
        runtime_vals[v["name"]] = st.text_input(f"{v['name']} ({v.get('description','')})", value=v.get("default",""))
    rendered_system = render_with_vars(chosen.get("system",""), runtime_vals)
    rendered_user = render_with_vars(chosen.get("user",""), runtime_vals)
    st.markdown("**Rendered Prompt**")
    st.code(f"[SYSTEM]\n{rendered_system}\n\n[USER]\n{rendered_user}")
    est = token_estimate(rendered_system + rendered_user)
    st.caption(f"Estimated tokens: ~{est}")

    st.download_button("⬇️ Download rendered prompt (txt)",
                       data=(f"[SYSTEM]\n{rendered_system}\n\n[USER]\n{rendered_user}").encode("utf-8"),
                       file_name=f"{chosen['id']}-rendered.txt")

# --------------- Catalog Table ---------------

st.subheader("📚 Catalog")
# apply filters
def match_filters(t):
    textblob = " ".join([
        t.get("name",""), t.get("description",""),
        t.get("system",""), t.get("user",""),
        " ".join(t.get("tags", [])), t.get("owner","")
    ]).lower()
    if q and q.lower() not in textblob:
        return False
    if tag_sel and not set(tag_sel).issubset(set(t.get("tags", []))):
        return False
    if model_sel and t.get("model_family") not in set(model_sel):
        return False
    if status_sel and t.get("status") not in set(status_sel):
        return False
    if owner_sel and t.get("owner") not in set(owner_sel):
        return False
    return True

filtered = [t for t in store.get("templates", []) if match_filters(t)]
# light "table"
for t in filtered:
    with st.expander(f"🧩 {t['name']}  •  {', '.join(t.get('tags', []))}  •  {t.get('status','draft')}", expanded=False):
        colA, colB = st.columns([2,1])
        with colA:
            st.write(t.get("description","—"))
            st.json({k: t[k] for k in ["use_case","audience","tone","model_family","owner","status"]})
            st.caption(f"Created: {t.get('created_at','?')}  •  Updated: {t.get('updated_at','?')}")
        with colB:
            st.code((t.get("system","") or "—") + "\n\n" + (t.get("user","") or "—"), language="markdown")
        st.markdown("**Actions**")
        c1, c2, c3 = st.columns(3)
        with c1:
            if st.button(f"Delete '{t['name']}'", key=f"del_{t['id']}"):
                store["templates"] = [x for x in store["templates"] if x["id"] != t["id"]]
                save_store(store)
                st.warning(f"Deleted '{t['name']}'.")
                st.experimental_rerun()
        with c2:
            if st.button(f"Duplicate '{t['name']}'", key=f"dup_{t['id']}"):
                dup = json.loads(json.dumps(t))
                dup["id"] = f"{t['id']}-copy"
                dup["name"] = f"{t['name']} (Copy)"
                dup["created_at"] = datetime.utcnow().isoformat() + "Z"
                dup["updated_at"] = datetime.utcnow().isoformat() + "Z"
                store["templates"].append(dup)
                save_store(store)
                st.success(f"Duplicated '{t['name']}'.")
                st.experimental_rerun()
        with c3:
            st.download_button("Export (YAML)",
                               data=yaml.safe_dump({"templates":[t]}, sort_keys=False),
                               file_name=f"{t['id']}.yaml")
