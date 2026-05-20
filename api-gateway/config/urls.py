from django.urls import path, include

urlpatterns = [
    path('api/auth/',          include('handler.auth_urls')),
    path('api/users/',         include('handler.user_urls')),
    path('api/catalog/',       include('handler.catalog_urls')),
    path('api/booking/',       include('handler.booking_urls')),
    path('api/payment/',       include('handler.payment_urls')),
    path('api/notifications/', include('handler.notification_urls')),
    path('api/reviews/',       include('handler.review_urls')),
    path('api/search/',        include('handler.search_urls')),
    path('api/calls/',         include('handler.call_urls')),
    path('health/',            include('handler.health_urls')),
]
