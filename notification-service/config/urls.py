from django.urls import path, include
urlpatterns = [
    path('api/notifications/', include('handler.urls')),
    path('health/',            include('handler.health_urls')),
]
