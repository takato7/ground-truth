"""FastAPI application. Importing this module must not require any configuration."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.settings import load_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.settings = load_settings()
    yield


app = FastAPI(
    title="Groundline API",
    version="0.1.0",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)
