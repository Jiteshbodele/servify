import uuid
from django.db import models


class Transaction(models.Model):
    class Type(models.TextChoices):
        PAYMENT = 'payment', 'Payment'
        REFUND  = 'refund',  'Refund'

    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        SUCCESS  = 'success',  'Success'
        FAILED   = 'failed',   'Failed'
        REFUNDED = 'refunded', 'Refunded'

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_id       = models.UUIDField()
    seeker_user_id   = models.UUIDField()
    amount           = models.DecimalField(max_digits=10, decimal_places=2)
    currency         = models.CharField(max_length=10, default='INR')
    type             = models.CharField(max_length=10, choices=Type.choices, default=Type.PAYMENT)
    status           = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    gateway_order_id = models.CharField(max_length=255, blank=True)
    gateway_ref      = models.CharField(max_length=255, blank=True)
    failure_reason   = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    
