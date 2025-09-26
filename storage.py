"""Storage utilities for prompt repository."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional


@dataclass
class PromptStorage:
    """File-based storage backend for prompt templates."""

    data_path: str = "data/prompts.json"
    versions_dir: str = "data/versions"
    imports_dir: str = "data/imports"

    def __post_init__(self) -> None:
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        os.makedirs(os.path.dirname(self.data_path) or ".", exist_ok=True)
        os.makedirs(self.versions_dir, exist_ok=True)
        os.makedirs(self.imports_dir, exist_ok=True)

    def load(self) -> Dict[str, Any]:
        """Load the store from disk, creating a default skeleton if missing."""
        if not os.path.exists(self.data_path):
            return {
                "meta": {"version": 1, "updated_at": datetime.utcnow().isoformat() + "Z"},
                "templates": [],
            }
        with open(self.data_path, "r", encoding="utf-8") as fh:
            return json.load(fh)

    def save(self, store: Dict[str, Any]) -> None:
        """Persist the store and capture a timestamped snapshot."""
        self._ensure_dirs()
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        snapshot_path = os.path.join(self.versions_dir, f"prompts-{timestamp}.json")
        with open(snapshot_path, "w", encoding="utf-8") as fh:
            json.dump(store, fh, indent=2)

        store.setdefault("meta", {})
        store["meta"]["updated_at"] = datetime.utcnow().isoformat() + "Z"
        with open(self.data_path, "w", encoding="utf-8") as fh:
            json.dump(store, fh, indent=2)

    def record_import(self, payload: bytes, extension: str) -> Optional[str]:
        """Persist a copy of an imported file for traceability."""
        self._ensure_dirs()
        safe_ext = extension.lstrip(".") or "dat"
        filename = f"import-{int(datetime.utcnow().timestamp())}.{safe_ext}"
        path = os.path.join(self.imports_dir, filename)
        with open(path, "wb") as fh:
            fh.write(payload)
        return path
