from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from dao.user_dao import UserDAO
from dao.kafka_dao import publish

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class AuthService:

    @staticmethod
    def register(email: str, name: str, phone: str, password: str, role: str) -> dict:
        if role == 'admin':
            raise ValidationError({'role': 'Cannot register as admin.'})
        if UserDAO.email_exists(email):
            raise ValidationError({'email': 'Email already registered.'})
        if UserDAO.phone_exists(phone):
            raise ValidationError({'phone': 'Phone number already registered.'})

        user = UserDAO.create(email=email, name=name, phone=phone, password=password, role=role)

        publish('user.registered', {
            'user_id': str(user.id),
            'email':   user.email,
            'name':    user.name,
            'role':    user.role,
        })

        refresh = RefreshToken.for_user(user)
        return {
            'user':   _fmt_user(user),
            'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)},
        }

    @staticmethod
    def login(email: str, password: str) -> dict:
        user = UserDAO.get_by_email(email)
        if not user or not user.check_password(password):
            raise AuthenticationFailed('Invalid email or password.')
        if not user.is_active:
            raise PermissionDenied('Account is deactivated.')

        refresh = RefreshToken.for_user(user)
        return {
            'user':   _fmt_user(user),
            'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)},
        }

    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> None:
        user = UserDAO.get_by_id(user_id)
        if not user:
            raise ValidationError('User not found.')
        if not user.check_password(old_password):
            raise ValidationError({'old_password': 'Old password is incorrect.'})
        user.set_password(new_password)
        user.save(update_fields=['password'])


    @staticmethod
    def logout(refresh_token):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return {
                "success": True,
                "message": "Successfully logged out."
            }

        except TokenError:
            return {
                "success": False,
                "message": "Invalid or already blacklisted token."
            }


def _fmt_user(user) -> dict:
    return {
        'id':          str(user.id),
        'email':       user.email,
        'name':        user.name,
        'phone':       user.phone,
        'role':        user.role,
        'is_verified': user.is_verified,
        'created_at':  user.created_at.isoformat(),
    }
