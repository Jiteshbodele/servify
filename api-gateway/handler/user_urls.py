from django.urls import path
from .views import MeHandler, ApproveProviderHandler, AddressListHandler, AddressDetailHandler
urlpatterns = [
    path('me/',                              MeHandler.as_view()),
    path('me/addresses/',                    AddressListHandler.as_view()),
    path('me/addresses/<str:address_id>/',   AddressDetailHandler.as_view()),
    path('providers/<str:user_id>/approve/', ApproveProviderHandler.as_view()),
]
