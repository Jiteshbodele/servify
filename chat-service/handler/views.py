from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from service.chat_service import ChatService
from utils.auth import decode_token


class ChatRoomHandler(APIView):
    """REST fallback — get chat history for a booking."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, booking_id):
        decode_token(request)
        return Response(ChatService.get_or_create_room(booking_id))


class MarkReadHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, booking_id):
        user = decode_token(request)
        ChatService.mark_read(booking_id, user['user_id'])
        return Response({'detail': 'Messages marked as read.'})


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'chat-service', 'status': 'ok'})
