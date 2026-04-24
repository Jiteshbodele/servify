from django.urls import path, include
urlpatterns = [
    path('api/search/', include('handler.urls')),
    path('health/',     include('handler.health_urls')),
]
