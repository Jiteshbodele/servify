from django.urls import path
from .views import CreateOrderHandler, VerifyPaymentHandler, RefundHandler, TransactionListHandler
urlpatterns = [
    path('create-order/',            CreateOrderHandler.as_view()),
    path('verify/',                  VerifyPaymentHandler.as_view()),
    path('refund/<str:txn_id>/',     RefundHandler.as_view()),
    path('transactions/',            TransactionListHandler.as_view()),
]
