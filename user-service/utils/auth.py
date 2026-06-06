# utils/auth.py
def decode_token(request) -> dict:
    token = request.headers['Authorization'].split(' ')[1]
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    return {
        'user_id': payload.get('sub'),    # the user's UUID
        'role':    payload.get('role'),   # 'seeker', 'provider', or 'admin'
        'email':   payload.get('email'),
        'name':    payload.get('name', ''),
    }