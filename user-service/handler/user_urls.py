from django.urls import path
from .views import MeHandler, ApproveProviderHandler, AddressListHandler, AddressDetailHandler

urlpatterns = [
    path('me/',                          MeHandler.as_view(),             name='me'),
    path('providers/<str:user_id>/approve/', ApproveProviderHandler.as_view(), name='approve-provider'),
    path('me/addresses/',                AddressListHandler.as_view(),    name='address-list'),
    path('me/addresses/<str:address_id>/', AddressDetailHandler.as_view(), name='address-detail'),
]
