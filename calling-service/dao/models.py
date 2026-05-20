import uuid
from django.db import models


class Call(models.Model):

    class Status(models.TextChoices):
        INITIATED  = 'initiated',  'Initiated'
        CONNECTED  = 'connected',  'Connected'
        COMPLETED  = 'completed',  'Completed'
        FAILED     = 'failed',     'Failed'
        MISSED     = 'missed',     'Missed'

    class Direction(models.TextChoices):
        SEEKER_TO_PROVIDER   = 'seeker_to_provider',   'Seeker to Provider'
        PROVIDER_TO_SEEKER   = 'provider_to_seeker',   'Provider to Seeker'

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_id      = models.UUIDField()
    caller_user_id  = models.UUIDField()
    callee_user_id  = models.UUIDField()
    direction       = models.CharField(max_length=25, choices=Direction.choices)
    status          = models.CharField(max_length=15, choices=Status.choices, default=Status.INITIATED)

    # Exotel fields
    exotel_call_sid = models.CharField(max_length=100, blank=True)
    virtual_number  = models.CharField(max_length=20)   # company number shown to both parties
    duration_sec    = models.IntegerField(default=0)
    recording_url   = models.CharField(max_length=500, blank=True)

    initiated_at    = models.DateTimeField(auto_now_add=True)
    ended_at        = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-initiated_at']
