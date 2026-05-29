from django.urls import path
from .views import AuthRegisterHandler, AuthLoginHandler, AuthRefreshHandler, AuthLogoutHandler, ChangePasswordHandler
urlpatterns = [
    path('register/',         AuthRegisterHandler.as_view()),
    path('login/',            AuthLoginHandler.as_view()),
    path('refresh/',          AuthRefreshHandler.as_view()),
    path('logout/',           AuthLogoutHandler.as_view()),
    path('change-password/',  ChangePasswordHandler.as_view()),

]
