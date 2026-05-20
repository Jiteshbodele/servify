from django.urls import path
from .views import InitiateCallHandler, CallCallbackHandler, BookingCallListHandler, MyCallsHandler

urlpatterns = [
    path('',          InitiateCallHandler.as_view()),
    path('callback/', CallCallbackHandler.as_view()),
    path('mine/',     MyCallsHandler.as_view()),
]
