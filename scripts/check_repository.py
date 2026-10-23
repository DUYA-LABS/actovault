"""Validate repository documentation and synthetic fixtures; not a security test."""
import json
import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md", "AGENTS.md",
    "ROADMAP.md", "docs/PROJECT_BRIEF.md", "docs/ARCHITECTURE.md",
    "docs/CONTRACTS.md", "docs/THREAT_MODEL.md", "docs/MVP_ACCEPTANCE.md",
    "packages/core/README.md", "packages/verify/README.md",
    "packages/runtime/README.md", "examples/tenant-demo/fixtures.json",
]
errors = []
for name in REQUIRED:
    path = ROOT / name
    if not path.is_file() or not path.read_text(encoding="utf-8").strip():
        errors.append(f"Missing or empty required file: {name}")

# Validate relative file targets, excluding remote URLs and in-document anchors.
# This intentionally does not validate heading anchors or external websites.
for path in ROOT.rglob("*.md"):
    if any(part in {".git", "node_modules", ".venv"} for part in path.parts):
        continue
    content = path.read_text(encoding="utf-8")
    for target in re.findall(r"\[[^\]]*\]\(([^)\s]+)\)", content):
        if target.startswith(("#", "/")) or re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target):
            continue
        relative = unquote(target.split("#", 1)[0])
        if relative and not (path.parent / relative).exists():
            errors.append(f"{path.relative_to(ROOT)}: broken local link {target}")

for path in ROOT.rglob("*.json"):
    if any(part in {".git", "node_modules", ".venv"} for part in path.parts):
        continue
    try:
        json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")

fixture_path = ROOT / "examples/tenant-demo/fixtures.json"
if fixture_path.is_file():
    try:
        fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
        assert fixture["synthetic"] is True, "fixture must be explicitly synthetic"
        tenants = {item["id"] for item in fixture["tenants"]}
        assert len(tenants) == 2, "demo requires two distinct tenants"
        assert len(fixture["principals"]) == 2, "demo requires two principals"
        assert len(fixture["records"]) == 2, "demo requires two records"
        for collection in ("principals", "records"):
            items = fixture[collection]
            assert len({item["id"] for item in items}) == len(items), "duplicate identifiers"
            assert {item["tenantId"] for item in items} == tenants, "invalid tenant coverage"
    except (ValueError, KeyError, TypeError, AssertionError) as exc:
        errors.append(f"Invalid demo fixture: {exc}")

if errors:
    raise SystemExit("\n".join(errors))
print("Repository checks passed: required files, local file links, JSON, and synthetic fixtures.")
