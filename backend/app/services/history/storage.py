import asyncio
from typing import TYPE_CHECKING, Protocol

import boto3
from botocore.config import Config

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

DOWNLOAD_URL_TTL_SECONDS = 300
_CLIENT_CONFIG = Config(
    signature_version="s3v4",
    s3={"addressing_style": "path"},
    connect_timeout=5,
    read_timeout=30,
    retries={"max_attempts": 3, "mode": "standard"},
)


class FileStorage(Protocol):
    async def put(self, key: str, content: bytes, *, content_type: str, file_name: str) -> None: ...

    async def download_url(self, key: str) -> str: ...

    async def delete(self, key: str) -> None: ...


def attachment_disposition(file_name: str) -> str:
    ascii_name = file_name.encode("ascii", "ignore").decode().replace('"', "").strip()
    return f'attachment; filename="{ascii_name or "resume"}"'


class S3FileStorage:
    """Neon Object Storage through its S3 API, which requires path-style addressing."""

    def __init__(self, client: "S3Client", bucket: str) -> None:
        self._client = client
        self._bucket = bucket

    @classmethod
    def create(
        cls,
        *,
        endpoint_url: str,
        region: str,
        access_key_id: str,
        secret_access_key: str,
        bucket: str,
    ) -> "S3FileStorage":
        client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            region_name=region or None,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            config=_CLIENT_CONFIG,
        )
        return cls(client, bucket)

    async def put(self, key: str, content: bytes, *, content_type: str, file_name: str) -> None:
        await asyncio.to_thread(
            self._client.put_object,
            Bucket=self._bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
            ContentDisposition=attachment_disposition(file_name),
        )

    async def download_url(self, key: str) -> str:
        return await asyncio.to_thread(
            self._client.generate_presigned_url,
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=DOWNLOAD_URL_TTL_SECONDS,
        )

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self._client.delete_object, Bucket=self._bucket, Key=key)
