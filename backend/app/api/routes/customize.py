from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import CustomizerDep, OptionalHistoryDep, OptionalUserDep, SettingsDep
from app.api.uploads import read_upload_limited
from app.schemas.customize import CustomizeResponse
from app.schemas.errors import ErrorResponse
from app.schemas.resume import SectionName

router = APIRouter(tags=["customize"])


@router.post(
    "/customize",
    responses={
        401: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def customize_resume(
    resume: Annotated[UploadFile, File(description="Resume as PDF or DOCX")],
    job_description: Annotated[str, Form()],
    customizer: CustomizerDep,
    settings: SettingsDep,
    user: OptionalUserDep,
    history: OptionalHistoryDep,
    sections: Annotated[list[SectionName] | None, Form()] = None,
) -> CustomizeResponse:
    content = await read_upload_limited(resume, settings.max_file_size_bytes)
    outcome = await customizer.customize_upload(
        filename=resume.filename or "",
        content_type=resume.content_type or "",
        content=content,
        job_description=job_description,
        sections=sections,
    )
    if user is None or history is None:
        return outcome.response
    history_id = await history.save(user, outcome.file, outcome.job_description, outcome.response)
    return outcome.response.model_copy(update={"history_id": history_id})
