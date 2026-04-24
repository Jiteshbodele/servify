from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
from django.conf import settings
from jose import jwt, JWTError


class IsInternalRequest(BasePermission):
    def has_permission(self, request, view):
        return request.headers.get('X-Internal-Token', '') == settings.INTERNAL_SECRET


class IsAdminToken:
    def check(self, request):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            raise AuthenticationFailed('Authentication required.')
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            if payload.get('role') != 'admin':
                raise PermissionDenied('Admins only.')
        except JWTError:
            raise AuthenticationFailed('Invalid token.')
