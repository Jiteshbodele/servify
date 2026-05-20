from django.urls import path, include
urlpatterns = [
    path('api/calls/', include('handler.urls')),
    path('api/calls/', include('handler.booking_urls')),
    path('health/',    include('handler.health_urls')),
]
