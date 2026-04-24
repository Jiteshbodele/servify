from dao.models import ServiceCategory, Service


class CategoryDAO:

    @staticmethod
    def get_all():
        return ServiceCategory.objects.all()

    @staticmethod
    def get_by_id(category_id: str):
        return ServiceCategory.objects.filter(id=category_id).first()

    @staticmethod
    def name_exists(name: str) -> bool:
        return ServiceCategory.objects.filter(name=name).exists()

    @staticmethod
    def create(name: str, icon_url: str = '') -> ServiceCategory:
        return ServiceCategory.objects.create(name=name, icon_url=icon_url)

    @staticmethod
    def update(category_id: str, **kwargs) -> bool:
        updated = ServiceCategory.objects.filter(id=category_id).update(**kwargs)
        return updated > 0

    @staticmethod
    def delete(category_id: str) -> bool:
        deleted, _ = ServiceCategory.objects.filter(id=category_id).delete()
        return deleted > 0


class ServiceDAO:

    @staticmethod
    def get_all(category_id: str = None, is_active: bool = True):
        qs = Service.objects.select_related('category')
        if is_active is not None:
            qs = qs.filter(is_active=is_active)
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    @staticmethod
    def get_by_id(service_id: str):
        return Service.objects.select_related('category').filter(id=service_id).first()

    @staticmethod
    def create(category_id: str, name: str, description: str,
               base_price: float, unit: str) -> Service:
        return Service.objects.create(
            category_id=category_id, name=name,
            description=description, base_price=base_price, unit=unit,
        )

    @staticmethod
    def update(service_id: str, **kwargs) -> bool:
        updated = Service.objects.filter(id=service_id).update(**kwargs)
        return updated > 0
