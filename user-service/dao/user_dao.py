from dao.models import User, SeekerProfile, ProviderProfile, Address


class UserDAO:

    @staticmethod
    def get_by_email(email: str):
        return User.objects.filter(email=email).select_related(
            'seeker_profile', 'provider_profile'
        ).first()

    @staticmethod
    def get_by_id(user_id: str):
        return User.objects.filter(id=user_id).select_related(
            'seeker_profile', 'provider_profile'
        ).prefetch_related('addresses').first()

    @staticmethod
    def email_exists(email: str) -> bool:
        return User.objects.filter(email=email).exists()

    @staticmethod
    def phone_exists(phone: str) -> bool:
        return User.objects.filter(phone=phone).exists()

    @staticmethod
    def create(email: str, name: str, phone: str, password: str, role: str) -> User:
        user = User.objects.create_user(
            email=email, name=name, phone=phone, password=password, role=role
        )
        if role == User.Role.SEEKER:
            SeekerProfile.objects.create(user=user)
        elif role == User.Role.PROVIDER:
            ProviderProfile.objects.create(user=user)
        return user

    @staticmethod
    def update_name(user_id: str, name: str) -> None:
        User.objects.filter(id=user_id).update(name=name)

    @staticmethod
    def update_password(user_id: str, password_hash: str) -> None:
        user = User.objects.get(id=user_id)
        user.password = password_hash
        user.save(update_fields=['password'])

    @staticmethod
    def approve_provider(user_id: str) -> bool:
        updated = ProviderProfile.objects.filter(user_id=user_id).update(is_approved=True)
        return updated > 0

    @staticmethod
    def update_provider_rating(user_id: str, avg_rating: float) -> None:
        ProviderProfile.objects.filter(user_id=user_id).update(avg_rating=avg_rating)

    @staticmethod
    def update_seeker_rating(user_id: str, avg_rating: float) -> None:
        SeekerProfile.objects.filter(user_id=user_id).update(avg_rating=avg_rating)


class AddressDAO:

    @staticmethod
    def get_all(user_id: str):
        return Address.objects.filter(user_id=user_id)

    @staticmethod
    def get_by_id(address_id: str, user_id: str):
        return Address.objects.filter(id=address_id, user_id=user_id).first()

    @staticmethod
    def create(user_id: str, label: str, street: str, city: str,
               state: str, pincode: str, is_default: bool,
               latitude=None, longitude=None) -> Address:
        if is_default:
            Address.objects.filter(user_id=user_id).update(is_default=False)
        return Address.objects.create(
            user_id=user_id, label=label, street=street,
            city=city, state=state, pincode=pincode,
            is_default=is_default, latitude=latitude, longitude=longitude,
        )

    @staticmethod
    def delete(address_id: str, user_id: str) -> bool:
        deleted, _ = Address.objects.filter(id=address_id, user_id=user_id).delete()
        return deleted > 0
