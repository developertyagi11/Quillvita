from fastapi import UploadFile

from app.core.config import BYTES_PER_MB
from app.errors import FileTooLargeError


async def read_upload_limited(upload: UploadFile, max_bytes: int) -> bytes:
    """Read at most one byte past the limit so oversized files are rejected without buffering."""
    content = await upload.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise FileTooLargeError(f"The resume must be {max_bytes // BYTES_PER_MB} MB or smaller.")
    return content
