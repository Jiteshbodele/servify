from django.urls import path
from .views import AuthRegisterHandler, AuthLoginHandler, AuthRefreshHandler, AuthLogoutHandler
urlpatterns = [
    path('register/', AuthRegisterHandler.as_view()),
    path('login/',    AuthLoginHandler.as_view()),
    path('refresh/',  AuthRefreshHandler.as_view()),
    path('logout/',   AuthLogoutHandler.as_view()),
]
