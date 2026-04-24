from django.urls import path
from .views import RegisterHandler, LoginHandler, ChangePasswordHandler
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/',        RegisterHandler.as_view(),      name='register'),
    path('login/',           LoginHandler.as_view(),          name='login'),
    path('refresh/',         TokenRefreshView.as_view(),      name='token-refresh'),
    path('change-password/', ChangePasswordHandler.as_view(), name='change-password'),
]
