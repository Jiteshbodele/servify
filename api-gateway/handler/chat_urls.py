from django.urls import path
from .views import ChatRoomHandler, MarkReadHandler
urlpatterns = [
    path('<str:booking_id>/',           ChatRoomHandler.as_view()),
    path('<str:booking_id>/mark-read/', MarkReadHandler.as_view()),
]
