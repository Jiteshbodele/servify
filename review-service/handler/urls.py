from django.urls import path
from .views import ReviewListCreateHandler
urlpatterns = [path('', ReviewListCreateHandler.as_view())]
