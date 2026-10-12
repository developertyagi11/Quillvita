import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import cover_letter, customize, export, health, history
from app.core.config import Settings, get_settings
from app.errors import register_exception_handlers
from app.services.history.setup import history_service_lifespan

API_PREFIX = "/api"


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()
    logging.basicConfig(level=logging.INFO)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        async with history_service_lifespan(resolved) as history_service:
            app.state.history_service = history_service
            yield

    app = FastAPI(title="Quillvita API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[resolved.frontend_url],
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Content-Disposition", "Retry-After"],
    )
    register_exception_handlers(app)
    routers = (health.router, customize.router, export.router, cover_letter.router, history.router)
    for router in routers:
        app.include_router(router, prefix=API_PREFIX)
    return app


app = create_app()
