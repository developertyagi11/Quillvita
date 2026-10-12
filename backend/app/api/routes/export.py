from fastapi import APIRouter, Response
from starlette.concurrency import run_in_threadpool

from app.schemas.errors import ErrorResponse
from app.schemas.export import ExportRequest
from app.services.exporter import export_resume

router = APIRouter(tags=["export"])


@router.post(
    "/export",
    response_class=Response,
    responses={
        200: {"content": {"application/octet-stream": {}}, "description": "The resume file"},
        422: {"model": ErrorResponse},
    },
)
async def export(request: ExportRequest) -> Response:
    exported = await run_in_threadpool(export_resume, request.resume, request.format)
    return Response(
        content=exported.content,
        media_type=exported.media_type,
        headers={"Content-Disposition": f'attachment; filename="{exported.filename}"'},
    )
