from jose import jwt, JWTError
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


def decode_token(request) -> dict:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('Authorization header missing or invalid.')

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return {
            'user_id': payload.get('sub'),
            'role':    payload.get('role'),
            'email':   payload.get('email'),
            'name':    payload.get('name', ''),
        }
    except JWTError as e:
        raise AuthenticationFailed(f'Invalid or expired token: {e}')
