from rest_framework.exceptions import ValidationError, NotFound

from dao.catalog_dao import CategoryDAO, ServiceDAO


class CategoryService:

    @staticmethod
    def list_all() -> list:
        return [_fmt_category(c) for c in CategoryDAO.get_all()]

    @staticmethod
    def get(category_id: str) -> dict:
        cat = CategoryDAO.get_by_id(category_id)
        if not cat:
            raise NotFound('Category not found.')
        return _fmt_category(cat)

    @staticmethod
    def create(name: str, icon_url: str = '') -> dict:
        if CategoryDAO.name_exists(name):
            raise ValidationError({'name': 'Category already exists.'})
        return _fmt_category(CategoryDAO.create(name=name, icon_url=icon_url))

    @staticmethod
    def update(category_id: str, **kwargs) -> dict:
        if not CategoryDAO.update(category_id, **kwargs):
            raise NotFound('Category not found.')
        return CategoryService.get(category_id)

    @staticmethod
    def delete(category_id: str) -> dict:
        if not CategoryDAO.delete(category_id):
            raise NotFound('Category not found.')
        return {'detail': 'Category deleted.'}


class ServiceService:

    @staticmethod
    def list_all(category_id: str = None) -> list:
        return [_fmt_service(s) for s in ServiceDAO.get_all(category_id=category_id)]

    @staticmethod
    def get(service_id: str) -> dict:
        svc = ServiceDAO.get_by_id(service_id)
        if not svc:
            raise NotFound('Service not found.')
        return _fmt_service(svc)

    @staticmethod
    def create(category_id: str, name: str, description: str,
               base_price: float, unit: str) -> dict:
        cat = CategoryDAO.get_by_id(category_id)
        if not cat:
            raise ValidationError({'category_id': 'Category not found.'})
        return _fmt_service(ServiceDAO.create(
            category_id=category_id, name=name,
            description=description, base_price=base_price, unit=unit,
        ))

    @staticmethod
    def update(service_id: str, **kwargs) -> dict:
        if not ServiceDAO.update(service_id, **kwargs):
            raise NotFound('Service not found.')
        return ServiceService.get(service_id)


def _fmt_category(c) -> dict:
    return {'id': str(c.id), 'name': c.name, 'icon_url': c.icon_url,
            'created_at': c.created_at.isoformat()}


def _fmt_service(s) -> dict:
    return {
        'id': str(s.id), 'name': s.name, 'description': s.description,
        'base_price': float(s.base_price), 'unit': s.unit, 'is_active': s.is_active,
        'category': {'id': str(s.category.id), 'name': s.category.name},
        'created_at': s.created_at.isoformat(),
    }
