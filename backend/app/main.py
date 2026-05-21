import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings
from app.routers import auth, breaks, channels, websocket
from app.services.break_manager import break_manager
from app.services.medialive import medialive_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.getLogger().setLevel(settings.log_level)
    break_manager.add_log("INFO", "SCTE-35 Controller iniciado")
    medialive_service.check_connection()
    yield
    break_manager.add_log("INFO", "SCTE-35 Controller encerrado")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AWS MediaLive SCTE-35 Controller",
        description="API para controle de breaks SCTE-35 no AWS MediaLive",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins + ["*"] if not origins else origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(breaks.router)
    app.include_router(channels.router)
    app.include_router(websocket.router)

    @app.get("/")
    @limiter.limit(settings.rate_limit)
    async def root(request: Request):
        return {"status": "running", "service": "scte35-controller"}

    return app


app = create_app()
