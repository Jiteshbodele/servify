from rest_framework.permissions import BasePermission
from django.conf import settings

class IsInternalRequest(BasePermission):
    def has_permission(self, request, view):
        return request.headers.get('X-Internal-Token', '') == settings.INTERNAL_SECRET
