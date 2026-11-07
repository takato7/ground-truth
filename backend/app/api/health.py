"""GET /api/health."""

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.health import check_health
from app.schemas.health import HealthFailed, HealthOk

router = APIRouter(prefix="/api")


@router.get(
    "/health",
    response_model=HealthOk,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": HealthFailed}},
)
def get_health(request: Request) -> HealthOk | JSONResponse:
    result = check_health(request.app.state.engine)
    if isinstance(result, HealthFailed):
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=result.model_dump(),
        )
    return result
