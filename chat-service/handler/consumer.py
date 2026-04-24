import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from jose import jwt, JWTError
from django.conf import settings


class ChatConsumer(AsyncWebsocketConsumer):
    """
    ws://host:8008/ws/chat/<booking_id>/?token=<access_token>
    """

    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.group_name = f"chat_{self.booking_id}"

        # Authenticate from query param token
        token = self._extract_token()
        if not token:
            await self.close(code=4001)
            return
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            self.user_id   = payload['sub']
            self.user_role = payload['role']
            self.user_name = payload.get('name', 'User')
        except JWTError:
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send message history on connect
        history = await self._get_history()
        await self.send(text_data=json.dumps({'type': 'history', 'messages': history}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data    = json.loads(text_data)
        content = data.get('message', '').strip()
        if not content:
            return

        saved = await self._save_message(content)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type':    'chat_message',
                **saved,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', **event}))

    def _extract_token(self) -> str | None:
        qs = self.scope.get('query_string', b'').decode()
        for part in qs.split('&'):
            if part.startswith('token='):
                return part.split('=', 1)[1]
        return None

    @database_sync_to_async
    def _get_history(self) -> list:
        from service.chat_service import ChatService
        room_data = ChatService.get_or_create_room(self.booking_id)
        return room_data['messages']

    @database_sync_to_async
    def _save_message(self, content: str) -> dict:
        from service.chat_service import ChatService
        return ChatService.save_message(
            booking_id=self.booking_id,
            sender_id=self.user_id,
            sender_name=self.user_name,
            content=content,
        )
