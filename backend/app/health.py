"""The health check: a real query against the configured database."""

import logging

from sqlalchemy import Engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.schemas.health import HealthFailed, HealthOk

logger = logging.getLogger(__name__)

# Not `SELECT 1`: that succeeds on a file that is not a database, because it reads no page.
SCHEMA_OBJECT_COUNT_QUERY = text("SELECT count(*) FROM sqlite_master")
# The cause goes to the log, because it can name the file path.
FAILURE_DETAIL = "Database check failed: the database could not be opened or queried."


def check_health(engine: Engine) -> HealthOk | HealthFailed:
    try:
        with engine.connect() as connection:
            schema_objects = connection.execute(SCHEMA_OBJECT_COUNT_QUERY).scalar_one()
    except SQLAlchemyError:
        logger.exception("Database check failed")
        return HealthFailed(status="database_check_failed", api="up", detail=FAILURE_DETAIL)
    return HealthOk(status="ok", api="up", schema_objects=schema_objects)
