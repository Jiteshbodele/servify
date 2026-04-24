from django.test import TestCase
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError, NotFound
from service.catalog_service import CategoryService, ServiceService


class TestCategoryService(TestCase):

    @patch('service.catalog_service.CategoryDAO')
    def test_create_duplicate_name_raises(self, mock_dao):
        mock_dao.name_exists.return_value = True
        with self.assertRaises(ValidationError):
            CategoryService.create(name='Plumbing')

    @patch('service.catalog_service.CategoryDAO')
    def test_create_success(self, mock_dao):
        mock_dao.name_exists.return_value = False
        cat = MagicMock()
        cat.id = 'cat-id'
        cat.name = 'Plumbing'
        cat.icon_url = ''
        cat.created_at.isoformat.return_value = '2024-01-01'
        mock_dao.create.return_value = cat
        result = CategoryService.create(name='Plumbing')
        self.assertEqual(result['name'], 'Plumbing')

    @patch('service.catalog_service.CategoryDAO')
    def test_get_not_found_raises(self, mock_dao):
        mock_dao.get_by_id.return_value = None
        with self.assertRaises(NotFound):
            CategoryService.get('nonexistent-id')

    @patch('service.catalog_service.CategoryDAO')
    def test_delete_not_found_raises(self, mock_dao):
        mock_dao.delete.return_value = False
        with self.assertRaises(NotFound):
            CategoryService.delete('nonexistent-id')


class TestServiceService(TestCase):

    @patch('service.catalog_service.ServiceDAO')
    @patch('service.catalog_service.CategoryDAO')
    def test_create_with_invalid_category_raises(self, mock_cat_dao, mock_svc_dao):
        mock_cat_dao.get_by_id.return_value = None
        with self.assertRaises(ValidationError):
            ServiceService.create(
                category_id='bad-id', name='Pipe Fix',
                description='Fix pipes', base_price=500, unit='per visit'
            )

    @patch('service.catalog_service.ServiceDAO')
    @patch('service.catalog_service.CategoryDAO')
    def test_create_success(self, mock_cat_dao, mock_svc_dao):
        cat = MagicMock()
        cat.id = 'cat-id'
        cat.name = 'Plumbing'
        mock_cat_dao.get_by_id.return_value = cat

        svc = MagicMock()
        svc.id = 'svc-id'
        svc.name = 'Pipe Fix'
        svc.description = 'Fix pipes'
        svc.base_price = 500
        svc.unit = 'per visit'
        svc.is_active = True
        svc.category = cat
        svc.created_at.isoformat.return_value = '2024-01-01'
        mock_svc_dao.create.return_value = svc

        result = ServiceService.create(
            category_id='cat-id', name='Pipe Fix',
            description='Fix pipes', base_price=500, unit='per visit'
        )
        self.assertEqual(result['name'], 'Pipe Fix')
