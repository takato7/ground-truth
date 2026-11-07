"""The contract of GET /api/health."""

from typing import Literal

from pydantic import BaseModel

ApiStatus = Literal["up"]
HealthOkStatus = Literal["ok"]
HealthFailedStatus = Literal["database_check_failed"]


class HealthOk(BaseModel):
    """The API is up and the query against the database succeeded."""

    status: HealthOkStatus
    api: ApiStatus
    schema_objects: int


class HealthFailed(BaseModel):
    """The API is up, but the database could not be opened or queried."""

    status: HealthFailedStatus
    api: ApiStatus
    detail: str
