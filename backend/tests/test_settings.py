"""DATABASE_URL is required at server startup, and only there."""

import os
import subprocess
import sys

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.settings import ConfigError, load_settings
from scripts.export_openapi import BACKEND_DIR

STARTUP_TIMEOUT_SECONDS = 30
HTTP_OK = 200
HTTP_NOT_FOUND = 404


def _run_server(extra_env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    # Port 0: uvicorn binds only after startup succeeds, and this must not need a free fixed port.
    return subprocess.run(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "0"],
        cwd=BACKEND_DIR,
        env={"PATH": os.environ["PATH"], **extra_env},
        capture_output=True,
        text=True,
        timeout=STARTUP_TIMEOUT_SECONDS,
    )


@pytest.mark.parametrize(
    "url",
    [
        "sqlite:////data/ground-truth.db",  # the compose value in .env.example
        "sqlite:///./local.db",  # a local file, relative to the working directory
    ],
)
def test_load_settings_accepts_a_sqlite_file_url(monkeypatch: pytest.MonkeyPatch, url: str) -> None:
    monkeypatch.setenv("DATABASE_URL", url)
    assert load_settings().database_url == url


def test_load_settings_names_a_missing_value(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(ConfigError, match="DATABASE_URL.*required"):
        load_settings()


@pytest.mark.parametrize(
    "url",
    [
        "",
        "   ",
        "not a url",
        "postgresql://db.example/groundline",
        "sqlite://",  # in memory: every restart would silently lose the data
        "sqlite:///:memory:",
    ],
)
def test_load_settings_names_an_invalid_value(monkeypatch: pytest.MonkeyPatch, url: str) -> None:
    monkeypatch.setenv("DATABASE_URL", url)
    with pytest.raises(ConfigError, match="DATABASE_URL"):
        load_settings()


def test_startup_validates_settings_through_the_lifespan(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(ConfigError, match="DATABASE_URL"), TestClient(app):
        pass


def test_startup_succeeds_with_a_valid_value(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./local.db")
    with TestClient(app) as client:
        assert client.get("/api/openapi.json").status_code == HTTP_OK


@pytest.mark.slow
def test_server_exits_naming_a_missing_value() -> None:
    result = _run_server({})
    assert result.returncode != 0
    assert "DATABASE_URL" in result.stderr


@pytest.mark.slow
def test_server_exits_naming_an_invalid_value() -> None:
    result = _run_server({"DATABASE_URL": "postgresql://db.example/groundline"})
    assert result.returncode != 0
    assert "DATABASE_URL" in result.stderr


def test_openapi_is_served_under_api_only_without_config(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    client = TestClient(app)  # no `with`: the lifespan does not run
    assert client.get("/api/openapi.json").status_code == HTTP_OK
    assert client.get("/openapi.json").status_code == HTTP_NOT_FOUND
