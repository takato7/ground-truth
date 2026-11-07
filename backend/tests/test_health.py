"""GET /api/health reports what a query against the configured SQLite file really returned."""

import sqlite3
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

HTTP_OK = 200
HTTP_SERVICE_UNAVAILABLE = 503
KNOWN_TABLES = ("alpha", "beta", "gamma")
EXPECTED_SCHEMA_OBJECTS = 3


@pytest.fixture
def client_for(monkeypatch: pytest.MonkeyPatch) -> Iterator:
    clients: list[TestClient] = []

    def start(database_path: Path) -> TestClient:
        monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
        client = TestClient(app)
        client.__enter__()
        clients.append(client)
        return client

    yield start
    for client in clients:
        client.__exit__(None, None, None)


def _assert_reports_database_failure(client: TestClient, database_path: Path) -> None:
    response = client.get("/api/health")
    assert response.status_code == HTTP_SERVICE_UNAVAILABLE
    body = response.json()
    assert body["status"] == "database_check_failed"
    assert body["api"] == "up"
    assert "database check failed" in body["detail"].lower()
    assert "schema_objects" not in body
    assert str(database_path) not in response.text


def test_health_reports_the_count_from_the_configured_file(tmp_path: Path, client_for) -> None:
    database_path = tmp_path / "known.db"
    with sqlite3.connect(database_path) as connection:
        for table in KNOWN_TABLES:
            connection.execute(f"CREATE TABLE {table} (id INTEGER)")
    connection.close()

    response = client_for(database_path).get("/api/health")

    assert response.status_code == HTTP_OK
    assert response.json() == {
        "status": "ok",
        "api": "up",
        "schema_objects": EXPECTED_SCHEMA_OBJECTS,
    }


def test_health_fails_for_a_path_in_a_missing_directory(tmp_path: Path, client_for) -> None:
    database_path = tmp_path / "missing" / "absent.db"
    _assert_reports_database_failure(client_for(database_path), database_path)


def test_health_fails_for_a_file_that_is_not_a_database(tmp_path: Path, client_for) -> None:
    database_path = tmp_path / "not-a-database.db"
    database_path.write_text("this is not a SQLite database\n", encoding="utf-8")
    _assert_reports_database_failure(client_for(database_path), database_path)


def test_health_fails_once_the_file_is_replaced_while_running(tmp_path: Path, client_for) -> None:
    # The check must open the file each time, not reuse a connection to the old one.
    database_path = tmp_path / "replaced.db"
    sqlite3.connect(database_path).close()
    client = client_for(database_path)
    assert client.get("/api/health").status_code == HTTP_OK

    database_path.unlink()
    database_path.write_text("this is not a SQLite database\n", encoding="utf-8")

    _assert_reports_database_failure(client, database_path)


def test_openapi_declares_both_health_bodies() -> None:
    responses = app.openapi()["paths"]["/api/health"]["get"]["responses"]
    assert responses[str(HTTP_OK)]["content"]["application/json"]["schema"]["$ref"].endswith(
        "/HealthOk"
    )
    assert responses[str(HTTP_SERVICE_UNAVAILABLE)]["content"]["application/json"]["schema"][
        "$ref"
    ].endswith("/HealthFailed")
