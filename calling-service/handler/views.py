from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from service.call_service import CallService
from utils.auth import decode_token


class InitiateCallHandler(APIView):
    """
    POST /api/calls/
    Seeker or provider initiates a masked call for a booking.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = decode_token(request)
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({'booking_id': 'This field is required.'}, status=400)

        result = CallService.initiate(
            caller_user_id=user['user_id'],
            caller_role=user['role'],
            booking_id=booking_id,
        )
        return Response(result, status=status.HTTP_201_CREATED)


class CallCallbackHandler(APIView):
    """
    POST /api/calls/callback/
    Exotel calls this webhook when call status changes.
    No auth — Exotel doesn't send JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        CallService.handle_callback(
            call_sid=request.data.get('CallSid', ''),
            status=request.data.get('Status', ''),
            duration=int(request.data.get('Duration', 0)),
            recording_url=request.data.get('RecordingUrl', ''),
        )
        return Response({'detail': 'ok'})


class BookingCallListHandler(APIView):
    """GET /api/calls/?booking_id=<id>"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        booking_id = request.query_params.get('booking_id')
        if not booking_id:
            return Response({'booking_id': 'Required.'}, status=400)
        return Response(CallService.list_for_booking(booking_id))


class MyCallsHandler(APIView):
    """GET /api/calls/mine/"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = decode_token(request)
        return Response(CallService.list_for_user(user['user_id']))


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'service': 'calling-service', 'status': 'ok'})
