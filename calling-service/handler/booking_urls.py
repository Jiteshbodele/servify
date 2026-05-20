from django.urls import path
from .views import BookingCallListHandler
urlpatterns = [path('', BookingCallListHandler.as_view())]
