from django.urls import path
from .views import InternalGetUserHandler, InternalUpdateProviderRatingHandler, InternalUpdateSeekerRatingHandler

urlpatterns = [
    path('users/<str:user_id>/',                      InternalGetUserHandler.as_view()),
    path('users/<str:user_id>/provider-rating/',      InternalUpdateProviderRatingHandler.as_view()),
    path('users/<str:user_id>/seeker-rating/',        InternalUpdateSeekerRatingHandler.as_view()),
]
