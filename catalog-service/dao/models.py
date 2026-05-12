import uuid
from django.db import models


class ServiceCategory(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name       = models.CharField(max_length=100, unique=True)
    icon_url   = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

   

    def __str__(self): return self.name


class Service(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category    = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name='services')
    name        = models.CharField(max_length=255)
    description = models.TextField()
    base_price  = models.DecimalField(max_digits=10, decimal_places=2)
    unit        = models.CharField(max_length=50)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)


    def __str__(self): return self.name
