from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from service.booking_service import ProviderServiceManager, AvailabilityManager, BookingManager
from utils.auth import decode_token
from utils.permissions import IsInternalRequest
from handler.serializers import (
    ProviderServiceSerializer, AvailabilitySerializer,
    CreateBookingSerializer, UpdateStatusSerializer, AvailableSlotsQuerySerializer,
)


class ProviderServiceListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        service_id = request.query_params.get('service_id')
        return Response(ProviderServiceManager.list_all(service_id=service_id))

    def post(self, request):
        user = decode_token(request)
        if user['role'] != 'provider':
            return Response({'detail': 'Providers only.'}, status=403)
        s = ProviderServiceSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(ProviderServiceManager.create(
            provider_user_id=user['user_id'], **s.validated_data
        ), status=201)


class MyProviderServicesHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = decode_token(request)
        return Response(ProviderServiceManager.list_mine(user['user_id']))


class AvailableSlotsHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        s = AvailableSlotsQuerySerializer(data=request.query_params)
        s.is_valid(raise_exception=True)
        return Response(AvailabilityManager.get_available_slots(
            str(s.validated_data['provider_service_id']),
            s.validated_data['date'],
        ))


class AvailabilityHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = decode_token(request)
        if user['role'] != 'provider':
            return Response({'detail': 'Providers only.'}, status=403)
        s = AvailabilitySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(AvailabilityManager.add_slot(
            provider_user_id=user['user_id'], **s.validated_data
        ), status=201)


class BookingCreateHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = decode_token(request)
        if user['role'] != 'seeker':
            return Response({'detail': 'Seekers only.'}, status=403)
        s = CreateBookingSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(BookingManager.create(
            seeker_user_id=user['user_id'], **s.validated_data
        ), status=201)


class BookingListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = decode_token(request)
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        return Response(BookingManager.list_mine(
            user['user_id'], user['role'], page=page, page_size=page_size
        ))


class BookingDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, booking_id):
        return Response(BookingManager.get(booking_id))


class BookingStatusHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, booking_id):
        user = decode_token(request)
        s = UpdateStatusSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(BookingManager.update_status(
            booking_id=booking_id,
            new_status=s.validated_data['status'],
            user_id=user['user_id'],
            role=user['role'],
        ))


class InternalGetBookingHandler(APIView):
    permission_classes = [IsInternalRequest]

    def get(self, request, booking_id):
        return Response(BookingManager.get(booking_id))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'booking-service', 'status': 'ok'})
