from datetime import datetime
from uuid import UUID

from app.schemas.customize import CustomizeResponse
from app.schemas.resume import BaseSchema


class HistorySummary(BaseSchema):
    id: UUID
    created_at: datetime
    job_title: str
    file_name: str
    match_score: int
    ats_score: int


class HistoryList(BaseSchema):
    items: list[HistorySummary]


class HistoryDetail(HistorySummary):
    job_description: str
    result: CustomizeResponse


class FileDownload(BaseSchema):
    url: str
    file_name: str
