from django.urls import path, include

urlpatterns = [
    path('api/auth/',    include('handler.auth_urls')),
    path('api/users/',   include('handler.user_urls')),
    path('internal/',    include('handler.internal_urls')),
    path('health/',      include('handler.health_urls')),
]
