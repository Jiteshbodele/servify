from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from service.search_service import SearchService


class SearchHandler(APIView):
    """
    GET /api/search/?q=plumbing&category=Plumbing&city=Pune&min_price=200&min_rating=4
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qp = request.query_params
        return Response(SearchService.search_providers(
            query=qp.get('q'),
            category=qp.get('category'),
            city=qp.get('city'),
            min_price=float(qp['min_price']) if qp.get('min_price') else None,
            max_price=float(qp['max_price']) if qp.get('max_price') else None,
            min_rating=float(qp['min_rating']) if qp.get('min_rating') else None,
            page=int(qp.get('page', 1)),
            page_size=int(qp.get('page_size', 20)),
        ))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'search-service', 'status': 'ok'})
