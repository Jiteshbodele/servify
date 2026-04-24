from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from service.payment_service import PaymentService
from utils.auth import decode_token
from utils.permissions import IsInternalRequest


class CreateOrderHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = decode_token(request)
        if user['role'] != 'seeker':
            return Response({'detail': 'Seekers only.'}, status=403)
        d = request.data
        return Response(PaymentService.create_order(
            booking_id=d['booking_id'],
            seeker_user_id=user['user_id'],
            amount=float(d['amount']),
        ))


class VerifyPaymentHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        decode_token(request)
        d = request.data
        return Response(PaymentService.verify_payment(
            razorpay_order_id=d['razorpay_order_id'],
            razorpay_payment_id=d['razorpay_payment_id'],
            razorpay_signature=d['razorpay_signature'],
        ))


class RefundHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, txn_id):
        user = decode_token(request)
        if user['role'] != 'admin':
            return Response({'detail': 'Admins only.'}, status=403)
        return Response(PaymentService.refund(txn_id))


class TransactionListHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = decode_token(request)
        return Response(PaymentService.list_by_seeker(user['user_id']))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'payment-service', 'status': 'ok'})
