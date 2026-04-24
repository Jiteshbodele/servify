from rest_framework.exceptions import ValidationError, NotFound

from dao.user_dao import UserDAO, AddressDAO
from dao.kafka_dao import publish


class UserService:

    @staticmethod
    def get_me(user_id: str) -> dict:
        user = UserDAO.get_by_id(user_id)
        if not user:
            raise NotFound('User not found.')
        return _fmt_user_full(user)

    @staticmethod
    def update_name(user_id: str, name: str) -> dict:
        UserDAO.update_name(user_id, name)
        return UserService.get_me(user_id)

    @staticmethod
    def approve_provider(user_id: str) -> dict:
        approved = UserDAO.approve_provider(user_id)
        if not approved:
            raise NotFound('Provider not found.')
        publish('provider.approved', {'user_id': user_id})
        return {'detail': 'Provider approved.'}

    @staticmethod
    def get_addresses(user_id: str) -> list:
        return [_fmt_address(a) for a in AddressDAO.get_all(user_id)]

    @staticmethod
    def create_address(user_id: str, **kwargs) -> dict:
        addr = AddressDAO.create(user_id=user_id, **kwargs)
        return _fmt_address(addr)

    @staticmethod
    def delete_address(user_id: str, address_id: str) -> dict:
        deleted = AddressDAO.delete(address_id, user_id)
        if not deleted:
            raise NotFound('Address not found.')
        return {'detail': 'Address deleted.'}

    @staticmethod
    def update_provider_rating(user_id: str, avg_rating: float) -> None:
        UserDAO.update_provider_rating(user_id, avg_rating)

    @staticmethod
    def update_seeker_rating(user_id: str, avg_rating: float) -> None:
        UserDAO.update_seeker_rating(user_id, avg_rating)


def _fmt_user_full(user) -> dict:
    data = {
        'id': str(user.id), 'email': user.email, 'name': user.name,
        'phone': user.phone, 'role': user.role,
        'is_verified': user.is_verified, 'created_at': user.created_at.isoformat(),
    }
    if hasattr(user, 'seeker_profile') and user.seeker_profile:
        data['seeker_profile'] = {
            'id': str(user.seeker_profile.id),
            'avg_rating': float(user.seeker_profile.avg_rating),
        }
    if hasattr(user, 'provider_profile') and user.provider_profile:
        data['provider_profile'] = {
            'id': str(user.provider_profile.id),
            'bio': user.provider_profile.bio,
            'avg_rating': float(user.provider_profile.avg_rating),
            'is_approved': user.provider_profile.is_approved,
        }
    return data


def _fmt_address(addr) -> dict:
    return {
        'id': str(addr.id), 'label': addr.label,
        'street': addr.street, 'city': addr.city,
        'state': addr.state, 'pincode': addr.pincode,
        'latitude': float(addr.latitude) if addr.latitude else None,
        'longitude': float(addr.longitude) if addr.longitude else None,
        'is_default': addr.is_default,
        'created_at': addr.created_at.isoformat(),
    }
