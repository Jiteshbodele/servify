from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from service.catalog_service import CategoryService, ServiceService
from utils.permissions import IsInternalRequest, IsAdminToken


class CategoryListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(CategoryService.list_all())

    def post(self, request):
        IsAdminToken().check(request)
        result = CategoryService.create(
            name=request.data['name'],
            icon_url=request.data.get('icon_url', ''),
        )
        return Response(result, status=status.HTTP_201_CREATED)


class CategoryDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, category_id):
        return Response(CategoryService.get(category_id))

    def patch(self, request, category_id):
        IsAdminToken().check(request)
        return Response(CategoryService.update(category_id, **request.data))

    def delete(self, request, category_id):
        IsAdminToken().check(request)
        return Response(CategoryService.delete(category_id))


class ServiceListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category_id')
        return Response(ServiceService.list_all(category_id=category_id))

    def post(self, request):
        IsAdminToken().check(request)
        d = request.data
        result = ServiceService.create(
            category_id=d['category_id'], name=d['name'],
            description=d['description'], base_price=d['base_price'], unit=d['unit'],
        )
        return Response(result, status=status.HTTP_201_CREATED)


class ServiceDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, service_id):
        return Response(ServiceService.get(service_id))

    def patch(self, request, service_id):
        IsAdminToken().check(request)
        return Response(ServiceService.update(service_id, **request.data))


class InternalGetServiceHandler(APIView):
    permission_classes = [IsInternalRequest]

    def get(self, request, service_id):
        return Response(ServiceService.get(service_id))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'catalog-service', 'status': 'ok'})
