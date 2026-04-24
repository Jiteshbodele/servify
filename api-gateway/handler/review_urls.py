from django.urls import path
from .views import ReviewHandler
urlpatterns = [path('', ReviewHandler.as_view())]
