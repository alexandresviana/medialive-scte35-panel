import asyncio
import uuid
from datetime import datetime, timezone

from app.models.schemas import BreakHistoryEntry, BreakStatus, ChannelStatus, LogEntry
from app.services.medialive import medialive_service


class BreakManager:
    def __init__(self) -> None:
        self.active_breaks: dict[str, dict] = {}
        self.history: list[BreakHistoryEntry] = []
        self.logs: list[LogEntry] = []
        self.presets: list[dict] = []
        self.scheduled: list[dict] = []
        self._subscribers: list[asyncio.Queue] = []

    def add_log(self, level: str, message: str, channel_id: str | None = None) -> None:
        entry = LogEntry(
            timestamp=datetime.now(timezone.utc),
            level=level,
            message=message,
            channel_id=channel_id,
        )
        self.logs.insert(0, entry)
        self.logs = self.logs[:200]
        self._broadcast({"type": "log", "data": entry.model_dump(mode="json")})

    async def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    def _broadcast(self, message: dict) -> None:
        for queue in self._subscribers:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                pass

    def get_channel_statuses(self, channel_ids: list[str]) -> list[ChannelStatus]:
        statuses = []
        for cid in channel_ids:
            status = medialive_service.get_channel_status(cid)
            if cid in self.active_breaks:
                break_info = self.active_breaks[cid]
                remaining = break_info.get("remaining", 0)
                status.active_break = True
                status.break_event_id = break_info.get("event_id")
                status.break_remaining_seconds = max(0, remaining)
                status.scte35_status = "break_active"
            statuses.append(status)
        return statuses

    async def start_break(
        self, channel_id: str, duration: int, username: str, auto_return: bool = True
    ) -> dict:
        if channel_id in self.active_breaks:
            raise ValueError("Break já ativo neste canal")

        result = medialive_service.trigger_break(channel_id, duration)
        event_id = result["event_id"]

        self.active_breaks[channel_id] = {
            "event_id": event_id,
            "duration": duration,
            "remaining": duration,
            "started_at": result["started_at"],
            "auto_return": auto_return,
        }

        history_entry = BreakHistoryEntry(
            id=str(uuid.uuid4()),
            channel_id=channel_id,
            event_id=event_id,
            duration=duration,
            started_at=result["started_at"],
            status=BreakStatus.ACTIVE,
            triggered_by=username,
        )
        self.history.insert(0, history_entry)

        self.add_log("INFO", f"Break iniciado (Event ID: {event_id}, {duration}s)", channel_id)
        self._broadcast({"type": "break_started", "data": {"channel_id": channel_id, "event_id": event_id, "duration": duration}})

        if auto_return:
            asyncio.create_task(self._countdown(channel_id, duration))

        return {"status": "break_started", "event_id": event_id, "duration": duration}

    async def _countdown(self, channel_id: str, duration: int) -> None:
        for remaining in range(duration, 0, -1):
            if channel_id not in self.active_breaks:
                return
            self.active_breaks[channel_id]["remaining"] = remaining
            self._broadcast({
                "type": "countdown",
                "data": {"channel_id": channel_id, "remaining": remaining},
            })
            await asyncio.sleep(1)

        if channel_id in self.active_breaks and self.active_breaks[channel_id].get("auto_return"):
            await self.return_to_network(channel_id, "system")

    async def return_to_network(self, channel_id: str, username: str) -> dict:
        if channel_id not in self.active_breaks:
            medialive_service.return_to_network(channel_id)
            self.add_log("INFO", "Return to network enviado (sem break ativo)", channel_id)
            return {"status": "return_sent"}

        break_info = self.active_breaks.pop(channel_id)
        result = medialive_service.return_to_network(channel_id)

        for entry in self.history:
            if entry.channel_id == channel_id and entry.status == BreakStatus.ACTIVE:
                entry.status = BreakStatus.COMPLETED
                entry.ended_at = datetime.now(timezone.utc)
                break

        self.add_log("INFO", f"Return to network (Event ID: {result['event_id']})", channel_id)
        self._broadcast({"type": "break_ended", "data": {"channel_id": channel_id}})

        return {"status": "return_to_network", "event_id": result["event_id"]}

    def get_history(self, channel_id: str | None = None, limit: int = 50) -> list[BreakHistoryEntry]:
        if channel_id:
            return [h for h in self.history if h.channel_id == channel_id][:limit]
        return self.history[:limit]

    def get_logs(self, limit: int = 100) -> list[LogEntry]:
        return self.logs[:limit]


break_manager = BreakManager()
