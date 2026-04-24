from django.urls import path
from .views import (
    ProviderServiceListHandler, MyProviderServicesHandler,
    AvailabilityHandler, AvailableSlotsHandler,
    BookingCreateHandler, BookingListHandler, BookingDetailHandler, BookingStatusHandler,
)
urlpatterns = [
    path('provider-services/',                ProviderServiceListHandler.as_view()),
    path('provider-services/mine/',           MyProviderServicesHandler.as_view()),
    path('availability/',                     AvailabilityHandler.as_view()),
    path('available-slots/',                  AvailableSlotsHandler.as_view()),
    path('',                                  BookingCreateHandler.as_view()),
    path('list/',                             BookingListHandler.as_view()),
    path('<str:booking_id>/',                 BookingDetailHandler.as_view()),
    path('<str:booking_id>/status/',          BookingStatusHandler.as_view()),
]
