from django.urls import path, include
urlpatterns = [
    path('api/reviews/', include('handler.urls')),
    path('health/',      include('handler.health_urls')),
]
