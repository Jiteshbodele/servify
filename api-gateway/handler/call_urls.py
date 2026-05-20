from django.urls import path
from .views import InitiateCallGatewayHandler, CallCallbackGatewayHandler, MyCallsGatewayHandler, BookingCallsGatewayHandler
urlpatterns = [
    path('',          InitiateCallGatewayHandler.as_view()),
    path('callback/', CallCallbackGatewayHandler.as_view()),
    path('mine/',     MyCallsGatewayHandler.as_view()),
    path('list/',     BookingCallsGatewayHandler.as_view()),
]
