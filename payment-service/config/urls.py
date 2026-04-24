from django.urls import path, include
urlpatterns = [
    path('api/payment/', include('handler.urls')),
    path('health/',      include('handler.health_urls')),
]
