from fastapi import APIRouter, Depends, Query

from app.auth import get_current_user
from app.models.schemas import ChannelStatus, HealthResponse
from app.services.break_manager import break_manager
from app.services.medialive import medialive_service

router = APIRouter(prefix="/api", tags=["channels"])


@router.get("/health", response_model=HealthResponse)
async def health():
    aws_ok = medialive_service.check_connection()
    return HealthResponse(status="running", aws_connected=aws_ok)


@router.get("/channels", response_model=list[ChannelStatus])
async def get_channels(
    channel_ids: str = Query(..., description="IDs separados por vírgula"),
    _user: dict = Depends(get_current_user),
):
    ids = [c.strip() for c in channel_ids.split(",") if c.strip()]
    return break_manager.get_channel_statuses(ids)


@router.get("/channels/{channel_id}", response_model=ChannelStatus)
async def get_channel(channel_id: str, _user: dict = Depends(get_current_user)):
    statuses = break_manager.get_channel_statuses([channel_id])
    return statuses[0]
