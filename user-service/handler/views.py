from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import PermissionDenied

from service.auth_service import AuthService
from service.user_service import UserService
from handler.serializers import (
    RegisterSerializer, LoginSerializer, RefreshSerializer,
    ChangePasswordSerializer, UpdateNameSerializer, AddressSerializer,LogoutSerializer
)

from utils.permissions import IsInternalRequest
from utils.auth import decode_token

class RegisterHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(AuthService.register(**s.validated_data), status=201)


class LoginHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(AuthService.login(**s.validated_data))


class RefreshHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = RefreshSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(AuthService.refresh(s.validated_data['refresh']))



    
# class ChangePasswordHandler(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         # user = decode_token(request)   # ← this needs JWT_SECRET to be set
#         s = ChangePasswordSerializer(data=request.data)
#         s.is_valid(raise_exception=True)
#         return Response(AuthService.change_password(
#             user_id=user['user_id'],
#             old_password=s.validated_data['old_password'],
#             new_password=s.validated_data['new_password'],
#         ))

class ChangePasswordHandler(APIView):
    # No overrides — uses default IsAuthenticated + JWTAuthentication from settings
    # DRF validates the token and populates request.user automatically

    def post(self, request):
        s = ChangePasswordSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        AuthService.change_password(
            user_id=str(request.user.id),
            old_password=s.validated_data['old_password'],
            new_password=s.validated_data['new_password'],
        )
        return Response({'detail': 'Password updated.'})

class MeHandler(APIView):
    def get(self, request):
        return Response(UserService.get_me(str(request.user.id)))
    def patch(self, request):
        s = UpdateNameSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(UserService.update_name(str(request.user.id), s.validated_data['name']))


class ApproveProviderHandler(APIView):
    def post(self, request, user_id):
        if request.user.role != 'admin':
            raise PermissionDenied('Admins only.')
        return Response(UserService.approve_provider(user_id))


class AddressListHandler(APIView):
    def get(self, request):
        return Response(UserService.get_addresses(str(request.user.id)))
    def post(self, request):
        s = AddressSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(UserService.create_address(user_id=str(request.user.id), **s.validated_data), status=201)


class AddressDetailHandler(APIView):
    def delete(self, request, address_id):
        return Response(UserService.delete_address(str(request.user.id), address_id))


class InternalGetUserHandler(APIView):
    permission_classes = [IsInternalRequest]
    def get(self, request, user_id):
        return Response(UserService.get_me(user_id))


class InternalUpdateProviderRatingHandler(APIView):
    permission_classes = [IsInternalRequest]
    def patch(self, request, user_id):
        avg = request.data.get('avg_rating')
        if avg is None:
            return Response({'avg_rating': 'required'}, status=400)
        UserService.update_provider_rating(user_id, float(avg))
        return Response({'detail': 'updated'})


class InternalUpdateSeekerRatingHandler(APIView):
    permission_classes = [IsInternalRequest]
    def patch(self, request, user_id):
        avg = request.data.get('avg_rating')
        if avg is None:
            return Response({'avg_rating': 'required'}, status=400)
        UserService.update_seeker_rating(user_id, float(avg))
        return Response({'detail': 'updated'})


class HealthHandler(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({'service': 'user-service', 'status': 'ok'})



class LogoutHandler(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        response = AuthService.logout(
            serializer.validated_data["refresh"]
        )

        if not response["success"]:
            return Response(
                response,
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            response,
            status=status.HTTP_200_OK
        )

# class LogoutHandler(APIView):
#     permission_classes = [permissions.AllowAny]  # ← was IsAuthenticated

#     def post(self, request):
#         serializer = LogoutSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(
#                 {'success': False, 'errors': serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         response = AuthService.logout(serializer.validated_data['refresh'])
#         if not response['success']:
#             return Response(response, status=status.HTTP_400_BAD_REQUEST)
#         return Response(response, status=status.HTTP_200_OK)