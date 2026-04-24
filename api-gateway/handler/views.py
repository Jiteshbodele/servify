from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.conf import settings

from utils.proxy import proxy


# ── Auth ──────────────────────────────────────────────────────

class AuthRegisterHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/auth/register/')


class AuthLoginHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/auth/login/')


class AuthRefreshHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/auth/refresh/')


class AuthLogoutHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/auth/change-password/')


# ── Users ─────────────────────────────────────────────────────

class MeHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/users/me/')
    def patch(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/users/me/')


class ChangePasswordHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/auth/change-password/')


class ApproveProviderHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, user_id):
        return proxy(request, settings.USER_SERVICE_URL, f'/api/users/providers/{user_id}/approve/')


class AddressListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/users/me/addresses/')
    def post(self, request):
        return proxy(request, settings.USER_SERVICE_URL, '/api/users/me/addresses/')


class AddressDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def delete(self, request, address_id):
        return proxy(request, settings.USER_SERVICE_URL, f'/api/users/me/addresses/{address_id}/')


# ── Catalog ───────────────────────────────────────────────────

class CategoryListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.CATALOG_SERVICE_URL, '/api/catalog/categories/')
    def post(self, request):
        return proxy(request, settings.CATALOG_SERVICE_URL, '/api/catalog/categories/')


class CategoryDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, category_id):
        return proxy(request, settings.CATALOG_SERVICE_URL, f'/api/catalog/categories/{category_id}/')
    def patch(self, request, category_id):
        return proxy(request, settings.CATALOG_SERVICE_URL, f'/api/catalog/categories/{category_id}/')
    def delete(self, request, category_id):
        return proxy(request, settings.CATALOG_SERVICE_URL, f'/api/catalog/categories/{category_id}/')


class ServiceListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.CATALOG_SERVICE_URL, '/api/catalog/services/')
    def post(self, request):
        return proxy(request, settings.CATALOG_SERVICE_URL, '/api/catalog/services/')


class ServiceDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, service_id):
        return proxy(request, settings.CATALOG_SERVICE_URL, f'/api/catalog/services/{service_id}/')
    def patch(self, request, service_id):
        return proxy(request, settings.CATALOG_SERVICE_URL, f'/api/catalog/services/{service_id}/')


# ── Booking ───────────────────────────────────────────────────

class ProviderServiceListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/provider-services/')
    def post(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/provider-services/')


class MyProviderServicesHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/provider-services/mine/')


class AvailabilityHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/availability/')


class AvailableSlotsHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/available-slots/')


class BookingCreateHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/')


class BookingListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.BOOKING_SERVICE_URL, '/api/booking/list/')


class BookingDetailHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, booking_id):
        return proxy(request, settings.BOOKING_SERVICE_URL, f'/api/booking/{booking_id}/')


class BookingStatusHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def patch(self, request, booking_id):
        return proxy(request, settings.BOOKING_SERVICE_URL, f'/api/booking/{booking_id}/status/')


# ── Payment ───────────────────────────────────────────────────

class CreateOrderHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.PAYMENT_SERVICE_URL, '/api/payment/create-order/')


class VerifyPaymentHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return proxy(request, settings.PAYMENT_SERVICE_URL, '/api/payment/verify/')


class RefundHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, txn_id):
        return proxy(request, settings.PAYMENT_SERVICE_URL, f'/api/payment/refund/{txn_id}/')


class TransactionListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.PAYMENT_SERVICE_URL, '/api/payment/transactions/')


# ── Notifications ─────────────────────────────────────────────

class NotificationListHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.NOTIFICATION_SERVICE_URL, '/api/notifications/')


# ── Reviews ───────────────────────────────────────────────────

class ReviewHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.REVIEW_SERVICE_URL, '/api/reviews/')
    def post(self, request):
        return proxy(request, settings.REVIEW_SERVICE_URL, '/api/reviews/')


# ── Search ────────────────────────────────────────────────────

class SearchHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return proxy(request, settings.SEARCH_SERVICE_URL, '/api/search/')


# ── Chat ──────────────────────────────────────────────────────

class ChatRoomHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, booking_id):
        return proxy(request, settings.CHAT_SERVICE_URL, f'/api/chat/{booking_id}/')


class MarkReadHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, booking_id):
        return proxy(request, settings.CHAT_SERVICE_URL, f'/api/chat/{booking_id}/mark-read/')


# ── Health ────────────────────────────────────────────────────

class GatewayHealthHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({'service': 'api-gateway', 'status': 'ok'})
