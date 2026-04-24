from rest_framework import serializers


class CategorySerializer(serializers.Serializer):
    name     = serializers.CharField(min_length=2, max_length=100)
    icon_url = serializers.URLField(required=False, allow_blank=True, default='')


class ServiceSerializer(serializers.Serializer):
    category_id = serializers.UUIDField()
    name        = serializers.CharField(min_length=2, max_length=255)
    description = serializers.CharField(min_length=10)
    base_price  = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit        = serializers.CharField(max_length=50)

    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Base price must be greater than 0.')
        return value


class UpdateServiceSerializer(serializers.Serializer):
    name        = serializers.CharField(min_length=2, max_length=255, required=False)
    description = serializers.CharField(min_length=10, required=False)
    base_price  = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    unit        = serializers.CharField(max_length=50, required=False)
    is_active   = serializers.BooleanField(required=False)
