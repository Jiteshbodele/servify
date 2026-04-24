from django.urls import path
from .views import NotificationListHandler
urlpatterns = [path('', NotificationListHandler.as_view())]
