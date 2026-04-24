from django.urls import path
from .views import GatewayHealthHandler
urlpatterns = [path('', GatewayHealthHandler.as_view())]
