from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch


class TestRegisterHandler(TestCase):

    def setUp(self):
        self.client = APIClient()

    @patch('handler.views.AuthService')
    def test_register_returns_201(self, mock_svc):
        mock_svc.register.return_value = {
            'user':   {'id': 'abc', 'email': 'a@b.com', 'role': 'seeker'},
            'tokens': {'access': 'tok', 'refresh': 'ref'},
        }
        resp = self.client.post('/api/auth/register/', {
            'email':    'test@example.com',
            'name':     'Test User',
            'phone':    '9876543210',
            'role':     'seeker',
            'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_register_missing_field_returns_400(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'test@example.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_bad_email_returns_400(self):
        resp = self.client.post('/api/auth/register/', {
            'email':    'not-an-email',
            'name':     'Test User',
            'phone':    '9876543210',
            'role':     'seeker',
            'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password_returns_400(self):
        resp = self.client.post('/api/auth/register/', {
            'email':    'test@example.com',
            'name':     'Test User',
            'phone':    '9876543210',
            'role':     'seeker',
            'password': '123',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_admin_role_returns_400(self):
        resp = self.client.post('/api/auth/register/', {
            'email':    'admin@example.com',
            'name':     'Admin',
            'phone':    '9876543210',
            'role':     'admin',
            'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('handler.views.AuthService')
    def test_login_returns_200(self, mock_svc):
        mock_svc.login.return_value = {
            'user':   {'id': 'abc', 'email': 'a@b.com'},
            'tokens': {'access': 'tok', 'refresh': 'ref'},
        }
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com', 'password': 'StrongPass123!'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_login_missing_password_returns_400(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_health_returns_200(self):
        resp = self.client.get('/health/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['service'], 'user-service')
