from django.test import TestCase
from handler.serializers import (
    RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, AddressSerializer,
)


class TestRegisterSerializer(TestCase):

    def _valid_data(self, **overrides):
        data = {
            'email':    'test@example.com',
            'name':     'Test User',
            'phone':    '9876543210',
            'role':     'seeker',
            'password': 'StrongPass123!',
        }
        data.update(overrides)
        return data

    def test_valid_seeker(self):
        s = RegisterSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)

    def test_valid_provider(self):
        s = RegisterSerializer(data=self._valid_data(role='provider'))
        self.assertTrue(s.is_valid(), s.errors)

    def test_admin_role_rejected(self):
        s = RegisterSerializer(data=self._valid_data(role='admin'))
        self.assertFalse(s.is_valid())
        self.assertIn('role', s.errors)

    def test_invalid_email(self):
        s = RegisterSerializer(data=self._valid_data(email='not-an-email'))
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_short_password(self):
        s = RegisterSerializer(data=self._valid_data(password='short'))
        self.assertFalse(s.is_valid())
        self.assertIn('password', s.errors)

    def test_short_name(self):
        s = RegisterSerializer(data=self._valid_data(name='A'))
        self.assertFalse(s.is_valid())
        self.assertIn('name', s.errors)

    def test_invalid_phone(self):
        s = RegisterSerializer(data=self._valid_data(phone='abc123xyz'))
        self.assertFalse(s.is_valid())
        self.assertIn('phone', s.errors)

    def test_missing_required_field(self):
        data = self._valid_data()
        del data['email']
        s = RegisterSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)


class TestAddressSerializer(TestCase):

    def _valid_data(self, **overrides):
        data = {
            'label':   'Home',
            'street':  '123 Main Street',
            'city':    'Pune',
            'state':   'Maharashtra',
            'pincode': '411001',
        }
        data.update(overrides)
        return data

    def test_valid_address(self):
        s = AddressSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)

    def test_invalid_pincode(self):
        s = AddressSerializer(data=self._valid_data(pincode='ABCDE'))
        self.assertFalse(s.is_valid())
        self.assertIn('pincode', s.errors)

    def test_optional_coords(self):
        s = AddressSerializer(data=self._valid_data(latitude=18.5, longitude=73.8))
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data['latitude'], 18.5)
