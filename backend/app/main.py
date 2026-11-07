"""FastAPI application. Importing this module must not require any configuration."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

from app.api.health import router as health_router
from app.settings import load_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.settings = load_settings()
    # NullPool: each use opens the file, so a pooled connection cannot hide a replaced file.
    app.state.engine = create_engine(app.state.settings.database_url, poolclass=NullPool)
    yield
    app.state.engine.dispose()


app = FastAPI(
    title="Groundline API",
    version="0.1.0",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)
app.include_router(health_router)
