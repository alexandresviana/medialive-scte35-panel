import logging
import time
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import get_settings
from app.models.schemas import ChannelState, ChannelStatus

logger = logging.getLogger(__name__)


class MediaLiveService:
    def __init__(self) -> None:
        self._client = None
        self._connected = False

    @property
    def client(self):
        if self._client is None:
            settings = get_settings()
            kwargs: dict[str, Any] = {"region_name": settings.aws_region}
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                kwargs["aws_access_key_id"] = settings.aws_access_key_id
                kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
            self._client = boto3.client("medialive", **kwargs)
        return self._client

    def check_connection(self) -> bool:
        try:
            self.client.list_channels(MaxResults=1)
            self._connected = True
            return True
        except (ClientError, BotoCoreError) as e:
            logger.warning("AWS connection check failed: %s", e)
            self._connected = False
            return False

    @property
    def is_connected(self) -> bool:
        return self._connected

    def describe_channel(self, channel_id: str) -> dict[str, Any]:
        return self.client.describe_channel(ChannelId=channel_id)

    def get_channel_status(self, channel_id: str, name: str = "") -> ChannelStatus:
        try:
            response = self.describe_channel(channel_id)
            state_str = response.get("State", "IDLE")
            try:
                state = ChannelState(state_str)
            except ValueError:
                state = ChannelState.IDLE

            input_bitrate = None
            output_bitrate = None
            pipeline_details = []

            for encoder in response.get("EncoderSettings", {}).get("AudioDescriptions", []):
                pipeline_details.append({"type": "audio", "name": encoder.get("Name", "")})

            return ChannelStatus(
                channel_id=channel_id,
                name=name or response.get("Name", channel_id),
                state=state,
                input_bitrate=input_bitrate,
                output_bitrate=output_bitrate,
                scte35_status="ready" if state == ChannelState.RUNNING else "idle",
                pipeline_details=pipeline_details,
            )
        except (ClientError, BotoCoreError) as e:
            logger.error("Failed to describe channel %s: %s", channel_id, e)
            return ChannelStatus(
                channel_id=channel_id,
                name=name or channel_id,
                state=ChannelState.IDLE,
                scte35_status="error",
            )

    def trigger_break(self, channel_id: str, duration: int) -> dict[str, Any]:
        event_id = int(time.time())
        response = self.client.batch_update_schedule(
            ChannelId=channel_id,
            Creates={
                "ScheduleActions": [
                    {
                        "ActionName": f"break-{event_id}",
                        "ScheduleActionStartSettings": {
                            "ImmediateModeScheduleActionStartSettings": {}
                        },
                        "ScheduleActionSettings": {
                            "Scte35SpliceInsertSettings": {
                                "SpliceEventId": event_id,
                                "OutOfNetworkIndicator": True,
                                "Duration": duration * 90000,
                                "UniqueProgramId": 1,
                                "AvailNum": 1,
                                "AvailsExpected": 1,
                            }
                        },
                    }
                ]
            },
        )
        return {
            "event_id": event_id,
            "duration": duration,
            "started_at": datetime.now(timezone.utc),
            "aws_response": response,
        }

    def return_to_network(self, channel_id: str) -> dict[str, Any]:
        event_id = int(time.time())
        response = self.client.batch_update_schedule(
            ChannelId=channel_id,
            Creates={
                "ScheduleActions": [
                    {
                        "ActionName": f"return-{event_id}",
                        "ScheduleActionStartSettings": {
                            "ImmediateModeScheduleActionStartSettings": {}
                        },
                        "ScheduleActionSettings": {
                            "Scte35SpliceInsertSettings": {
                                "SpliceEventId": event_id,
                                "OutOfNetworkIndicator": False,
                                "Duration": 0,
                                "UniqueProgramId": 1,
                                "AvailNum": 1,
                                "AvailsExpected": 1,
                            }
                        },
                    }
                ]
            },
        )
        return {"event_id": event_id, "aws_response": response}


medialive_service = MediaLiveService()
