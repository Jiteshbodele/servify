from django.urls import path
from .views import CategoryListHandler, CategoryDetailHandler, ServiceListHandler, ServiceDetailHandler, InternalGetServiceHandler

urlpatterns = [
    path('categories/',                     CategoryListHandler.as_view()),
    path('categories/<str:category_id>/',   CategoryDetailHandler.as_view()),
    path('services/',                       ServiceListHandler.as_view()),
    path('services/<str:service_id>/',      ServiceDetailHandler.as_view()),
    path('internal/services/<str:service_id>/', InternalGetServiceHandler.as_view()),
]
