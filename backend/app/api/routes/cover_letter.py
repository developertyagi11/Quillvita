from fastapi import APIRouter

from app.api.deps import CoverLetterGeneratorDep
from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.schemas.errors import ErrorResponse

router = APIRouter(tags=["cover-letter"])


@router.post(
    "/cover-letter",
    responses={
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
async def create_cover_letter(
    request: CoverLetterRequest, generator: CoverLetterGeneratorDep
) -> CoverLetterResponse:
    return await generator.generate(request.resume, request.job_description, request.tone)
