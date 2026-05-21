from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.models.schemas import BreakRequest, ChannelPreset, ReturnRequest, ScheduledBreak
from app.services.break_manager import break_manager

router = APIRouter(prefix="/api", tags=["breaks"])


@router.post("/break")
async def trigger_break(req: BreakRequest, user: dict = Depends(get_current_user)):
    try:
        result = await break_manager.start_break(
            req.channel_id, req.duration, user["username"], req.auto_return
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
    except Exception as e:
        break_manager.add_log("ERROR", f"Falha ao iniciar break: {e}", req.channel_id)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/return")
async def return_to_network(req: ReturnRequest, user: dict = Depends(get_current_user)):
    try:
        result = await break_manager.return_to_network(req.channel_id, user["username"])
        return result
    except Exception as e:
        break_manager.add_log("ERROR", f"Falha no return: {e}", req.channel_id)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/history")
async def get_history(
    channel_id: str | None = None,
    limit: int = Query(default=50, le=200),
    _user: dict = Depends(get_current_user),
):
    return break_manager.get_history(channel_id, limit)


@router.get("/logs")
async def get_logs(
    limit: int = Query(default=100, le=200),
    _user: dict = Depends(get_current_user),
):
    return break_manager.get_logs(limit)


@router.get("/presets")
async def get_presets(_user: dict = Depends(get_current_user)):
    return break_manager.presets


@router.post("/presets")
async def create_preset(preset: ChannelPreset, _user: dict = Depends(get_current_user)):
    break_manager.presets.append(preset.model_dump())
    break_manager.add_log("INFO", f"Preset criado: {preset.name}")
    return preset


@router.get("/scheduled")
async def get_scheduled(_user: dict = Depends(get_current_user)):
    return break_manager.scheduled


@router.post("/scheduled")
async def schedule_break(break_item: ScheduledBreak, _user: dict = Depends(get_current_user)):
    break_manager.scheduled.append(break_item.model_dump(mode="json"))
    break_manager.add_log("INFO", f"Break agendado para {break_item.scheduled_at}", break_item.channel_id)
    return break_item
