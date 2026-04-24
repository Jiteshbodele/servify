from django.test import TestCase
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from unittest.mock import patch, MagicMock
from service.auth_service import AuthService


class TestAuthServiceRegister(TestCase):

    @patch('service.auth_service.UserDAO')
    @patch('service.auth_service.publish')
    def test_register_seeker_success(self, mock_publish, mock_dao):
        mock_dao.email_exists.return_value = False
        mock_dao.phone_exists.return_value = False
        mock_user         = MagicMock()
        mock_user.id      = '11111111-1111-1111-1111-111111111111'
        mock_user.email   = 'seeker@test.com'
        mock_user.name    = 'Test Seeker'
        mock_user.phone   = '9876543210'
        mock_user.role    = 'seeker'
        mock_user.is_verified = False
        mock_user.created_at.isoformat.return_value = '2024-01-01T00:00:00'
        mock_dao.create.return_value = mock_user

        result = AuthService.register(
            email='seeker@test.com', name='Test Seeker',
            phone='9876543210', password='StrongPass123!', role='seeker',
        )

        self.assertIn('user', result)
        self.assertIn('tokens', result)
        self.assertIn('access', result['tokens'])
        self.assertIn('refresh', result['tokens'])
        mock_publish.assert_called_once()

    @patch('service.auth_service.UserDAO')
    def test_register_admin_blocked(self, mock_dao):
        with self.assertRaises(ValidationError):
            AuthService.register(
                email='admin@test.com', name='Admin',
                phone='9876543210', password='StrongPass123!', role='admin',
            )

    @patch('service.auth_service.UserDAO')
    def test_register_duplicate_email(self, mock_dao):
        mock_dao.email_exists.return_value = True
        with self.assertRaises(ValidationError):
            AuthService.register(
                email='dup@test.com', name='Dup',
                phone='9876543210', password='StrongPass123!', role='seeker',
            )

    @patch('service.auth_service.UserDAO')
    def test_register_duplicate_phone(self, mock_dao):
        mock_dao.email_exists.return_value = False
        mock_dao.phone_exists.return_value = True
        with self.assertRaises(ValidationError):
            AuthService.register(
                email='new@test.com', name='New',
                phone='9876543210', password='StrongPass123!', role='seeker',
            )


class TestAuthServiceLogin(TestCase):

    @patch('service.auth_service.UserDAO')
    def test_login_wrong_password(self, mock_dao):
        mock_user = MagicMock()
        mock_user.check_password.return_value = False
        mock_dao.get_by_email.return_value = mock_user
        with self.assertRaises(AuthenticationFailed):
            AuthService.login(email='a@b.com', password='wrong')

    @patch('service.auth_service.UserDAO')
    def test_login_user_not_found(self, mock_dao):
        mock_dao.get_by_email.return_value = None
        with self.assertRaises(AuthenticationFailed):
            AuthService.login(email='ghost@test.com', password='pass')

    @patch('service.auth_service.UserDAO')
    def test_login_inactive_account(self, mock_dao):
        from rest_framework.exceptions import PermissionDenied
        mock_user = MagicMock()
        mock_user.check_password.return_value = True
        mock_user.is_active = False
        mock_dao.get_by_email.return_value = mock_user
        with self.assertRaises(PermissionDenied):
            AuthService.login(email='a@b.com', password='pass')
