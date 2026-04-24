import uuid
from django.db import models


class ProviderService(models.Model):
    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_user_id = models.UUIDField()          # FK to user-service
    service_id       = models.UUIDField()          # FK to catalog-service
    price_override   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    experience       = models.TextField(blank=True)
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'handler'
        unique_together = ('provider_user_id', 'service_id')


class Availability(models.Model):
    class Day(models.IntegerChoices):
        MON = 0; TUE = 1; WED = 2; THU = 3; FRI = 4; SAT = 5; SUN = 6

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_service = models.ForeignKey(ProviderService, on_delete=models.CASCADE, related_name='slots')
    day_of_week      = models.IntegerField(choices=Day.choices)
    slot_start       = models.TimeField()
    slot_end         = models.TimeField()
    is_recurring     = models.BooleanField(default=True)

    class Meta:
        app_label = 'handler'
        unique_together = ('provider_service', 'day_of_week', 'slot_start')


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING     = 'pending',     'Pending'
        CONFIRMED   = 'confirmed',   'Confirmed'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED   = 'completed',   'Completed'
        CANCELLED   = 'cancelled',   'Cancelled'

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seeker_user_id   = models.UUIDField()
    provider_service = models.ForeignKey(ProviderService, on_delete=models.PROTECT, related_name='bookings')
    address_id       = models.UUIDField()
    booking_date     = models.DateField()
    booking_time     = models.TimeField()
    status           = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes            = models.TextField(blank=True)
    amount_charged   = models.DecimalField(max_digits=10, decimal_places=2)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'handler'
