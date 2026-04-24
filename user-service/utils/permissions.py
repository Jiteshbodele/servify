from rest_framework.permissions import BasePermission
from django.conf import settings

class IsInternalRequest(BasePermission):
    def has_permission(self, request, view):
        token = request.headers.get('X-Internal-Token', '')
        return token == settings.INTERNAL_SECRET
