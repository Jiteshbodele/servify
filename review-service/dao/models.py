import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    class TargetType(models.TextChoices):
        PROVIDER = 'provider', 'Provider'
        SEEKER   = 'seeker',   'Seeker'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_id  = models.UUIDField()
    reviewer_id = models.UUIDField()
    target_id   = models.UUIDField()
    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    rating      = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment     = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label     = 'handler'
        unique_together = ('booking_id', 'reviewer_id', 'target_type')
