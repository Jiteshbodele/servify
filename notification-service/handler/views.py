from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from service.notification_service import NotificationService
from utils.auth import decode_token


class NotificationListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = decode_token(request)
        return Response(NotificationService.list_for_user(user['user_id']))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'notification-service', 'status': 'ok'})
