from django.urls import path
from .views import SearchHandler
urlpatterns = [path('', SearchHandler.as_view())]
