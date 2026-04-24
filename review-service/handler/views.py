from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from service.review_service import ReviewService
from utils.auth import decode_token


class ReviewListCreateHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        target_id   = request.query_params.get('target_id')
        target_type = request.query_params.get('target_type', 'provider')
        if not target_id:
            return Response({'detail': 'target_id is required.'}, status=400)
        return Response(ReviewService.list_for_target(target_id, target_type))

    def post(self, request):
        user = decode_token(request)
        d    = request.data
        result = ReviewService.create(
            reviewer_id=user['user_id'],
            reviewer_role=user['role'],
            booking_id=d['booking_id'],
            rating=int(d['rating']),
            comment=d.get('comment', ''),
        )
        return Response(result, status=status.HTTP_201_CREATED)


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'review-service', 'status': 'ok'})
