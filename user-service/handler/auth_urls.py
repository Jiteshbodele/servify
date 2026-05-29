from django.urls import path
from .views import (
    RegisterHandler, LoginHandler, RefreshHandler,
    ChangePasswordHandler, LogoutHandler,
)
urlpatterns = [
    path('register/',        RegisterHandler.as_view()),
    path('login/',           LoginHandler.as_view()),
    path('refresh/',         RefreshHandler.as_view()),
    path('logout/',          LogoutHandler.as_view()),
    path('change-password/', ChangePasswordHandler.as_view()),
]
