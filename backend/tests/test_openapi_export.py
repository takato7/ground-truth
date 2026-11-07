"""The committed OpenAPI file is the contract the frontend types are generated from."""

import os
import subprocess
import sys

from scripts.export_openapi import BACKEND_DIR, OPENAPI_PATH, render_openapi

RENDER_SNIPPET = (
    "import sys; from scripts.export_openapi import render_openapi; "
    "sys.stdout.write(render_openapi())"
)
CONFIG_VARS = {"DATABASE_URL", "BACKEND_PORT", "FRONTEND_PORT"}


def _render_in_fresh_process(hash_seed: str) -> str:
    env = {key: value for key, value in os.environ.items() if key not in CONFIG_VARS}
    env["PYTHONHASHSEED"] = hash_seed
    result = subprocess.run(
        [sys.executable, "-c", RENDER_SNIPPET],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout


def test_committed_openapi_matches_app() -> None:
    assert OPENAPI_PATH.exists(), "backend/openapi.json is missing: run make gen-api"
    assert OPENAPI_PATH.read_text(encoding="utf-8") == render_openapi(), (
        "backend/openapi.json is stale: run make gen-api"
    )


def test_render_needs_no_config_and_is_deterministic() -> None:
    assert _render_in_fresh_process("1") == _render_in_fresh_process("2")
