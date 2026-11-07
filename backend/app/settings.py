"""Server configuration, read from the environment only. Nothing here has a default."""

from pydantic import ValidationError, field_validator
from pydantic_settings import BaseSettings
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError

IN_MEMORY_DATABASES = {None, "", ":memory:"}


class ConfigError(RuntimeError):
    """Required configuration is missing or invalid."""


class Settings(BaseSettings):
    database_url: str

    @field_validator("database_url")
    @classmethod
    def _must_be_a_sqlite_file(cls, value: str) -> str:
        try:
            url = make_url(value)
        except ArgumentError as error:
            raise ValueError("not a valid database URL") from error
        if url.get_backend_name() != "sqlite" or url.database in IN_MEMORY_DATABASES:
            raise ValueError("must be a SQLite file URL, such as sqlite:///./local.db")
        return value


def load_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as error:
        problems = "; ".join(
            f"{'.'.join(str(part) for part in item['loc']).upper()}: {item['msg']}"
            for item in error.errors()
        )
        raise ConfigError(f"Invalid configuration. {problems}") from None
