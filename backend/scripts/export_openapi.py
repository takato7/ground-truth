"""Write the app's OpenAPI schema to backend/openapi.json with deterministic output."""

import importlib
import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
OPENAPI_PATH = BACKEND_DIR / "openapi.json"
JSON_INDENT = 2


def render_openapi() -> str:
    # Run as a file, this script has scripts/ on sys.path instead of backend/.
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    app = importlib.import_module("app.main").app
    return json.dumps(app.openapi(), indent=JSON_INDENT, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> None:
    OPENAPI_PATH.write_text(render_openapi(), encoding="utf-8")


if __name__ == "__main__":
    main()
