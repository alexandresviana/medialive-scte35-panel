from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ChannelState(str, Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    STARTING = "STARTING"
    STOPPING = "STOPPING"
    RECOVERING = "RECOVERING"


class BreakStatus(str, Enum):
    NONE = "none"
    ACTIVE = "active"
    RETURNING = "returning"
    COMPLETED = "completed"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BreakRequest(BaseModel):
    channel_id: str
    duration: int = Field(default=30, ge=5, le=600)
    auto_return: bool = True


class ReturnRequest(BaseModel):
    channel_id: str


class ChannelPreset(BaseModel):
    id: str
    name: str
    channel_id: str
    default_duration: int = 30


class ScheduledBreak(BaseModel):
    id: str
    channel_id: str
    scheduled_at: datetime
    duration: int
    status: str = "pending"


class BreakHistoryEntry(BaseModel):
    id: str
    channel_id: str
    event_id: int
    duration: int
    started_at: datetime
    ended_at: datetime | None = None
    status: BreakStatus
    triggered_by: str


class ChannelStatus(BaseModel):
    channel_id: str
    name: str
    state: ChannelState
    input_bitrate: float | None = None
    output_bitrate: float | None = None
    active_break: bool = False
    break_event_id: int | None = None
    break_remaining_seconds: int | None = None
    scte35_status: str = "idle"
    pipeline_details: list[dict[str, Any]] = []


class LogEntry(BaseModel):
    timestamp: datetime
    level: str
    message: str
    channel_id: str | None = None


class HealthResponse(BaseModel):
    status: str
    aws_connected: bool
    version: str = "1.0.0"
