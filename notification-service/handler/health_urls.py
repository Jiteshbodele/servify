from django.urls import path
from .views import HealthHandler
urlpatterns = [path('', HealthHandler.as_view())]
