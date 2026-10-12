from typing import Any
from uuid import UUID

from fastapi import APIRouter, status

from app.api.deps import CurrentUserDep, HistoryServiceDep
from app.schemas.errors import ErrorResponse
from app.schemas.history import FileDownload, HistoryDetail, HistoryList

router = APIRouter(
    prefix="/history",
    tags=["history"],
    responses={
        401: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)

_NOT_FOUND: dict[int | str, dict[str, Any]] = {404: {"model": ErrorResponse}}


@router.get("")
async def list_history(user: CurrentUserDep, history: HistoryServiceDep) -> HistoryList:
    return HistoryList(items=await history.list(user))


@router.get("/{entry_id}", responses=_NOT_FOUND)
async def get_history_entry(
    entry_id: UUID, user: CurrentUserDep, history: HistoryServiceDep
) -> HistoryDetail:
    return await history.get(user, entry_id)


@router.get("/{entry_id}/file", responses=_NOT_FOUND)
async def get_history_file(
    entry_id: UUID, user: CurrentUserDep, history: HistoryServiceDep
) -> FileDownload:
    return await history.file_download(user, entry_id)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT, responses=_NOT_FOUND)
async def delete_history_entry(
    entry_id: UUID, user: CurrentUserDep, history: HistoryServiceDep
) -> None:
    await history.delete(user, entry_id)
