from django.urls import path, include
urlpatterns = [
    path('api/chat/', include('handler.urls')),
    path('health/',   include('handler.health_urls')),
]
