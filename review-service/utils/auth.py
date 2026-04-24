from jose import jwt, JWTError
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

def decode_token(request) -> dict:
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        raise AuthenticationFailed('Authentication required.')
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return {'user_id': payload['sub'], 'role': payload['role']}
    except JWTError:
        raise AuthenticationFailed('Invalid or expired token.')
