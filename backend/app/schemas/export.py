from typing import Literal

from app.schemas.resume import BaseSchema, ResumeContent

ExportFormat = Literal["pdf", "docx", "txt"]


class ExportRequest(BaseSchema):
    resume: ResumeContent
    format: ExportFormat
