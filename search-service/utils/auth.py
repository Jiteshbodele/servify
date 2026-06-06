from jose import jwt, JWTError
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

def decode_token(request) -> dict:
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        raise AuthenticationFailed('Authentication required.')
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return {
            'user_id': payload['user_id'],   # SimpleJWT uses 'user_id' not 'sub'
            'role':    payload.get('role', ''),
            'email':   payload.get('email', ''),
            'name':    payload.get('name', ''),
        }
    except JWTError:
        raise AuthenticationFailed('Invalid or expired token.')