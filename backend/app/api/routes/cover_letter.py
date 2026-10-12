from fastapi import APIRouter

from app.api.deps import CoverLetterGeneratorDep, OptionalHistoryDep, OptionalUserDep
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
    request: CoverLetterRequest,
    generator: CoverLetterGeneratorDep,
    user: OptionalUserDep,
    history: OptionalHistoryDep,
) -> CoverLetterResponse:
    letter = await generator.generate(request.resume, request.job_description, request.tone)
    if user is not None and history is not None and request.history_id is not None:
        await history.save_cover_letter(user, request.history_id, letter)
    return letter
