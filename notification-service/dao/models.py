import uuid
from django.db import models


class Notification(models.Model):
    class Channel(models.TextChoices):
        EMAIL = 'email', 'Email'
        SMS   = 'sms',   'SMS'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT    = 'sent',    'Sent'
        FAILED  = 'failed',  'Failed'

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id    = models.UUIDField()
    channel    = models.CharField(max_length=10, choices=Channel.choices, default=Channel.EMAIL)
    subject    = models.CharField(max_length=255, blank=True)
    body       = models.TextField()
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    sent_at    = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'handler'
