from rest_framework import serializers
from datetime import date


class ProviderServiceSerializer(serializers.Serializer):
    service_id     = serializers.UUIDField()
    price_override = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    experience     = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_price_override(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Price override must be greater than 0.')
        return value


class AvailabilitySerializer(serializers.Serializer):
    provider_service_id = serializers.UUIDField()
    day_of_week         = serializers.IntegerField(min_value=0, max_value=6)
    slot_start          = serializers.TimeField()
    slot_end            = serializers.TimeField()
    is_recurring        = serializers.BooleanField(default=True)

    def validate(self, attrs):
        if attrs['slot_end'] <= attrs['slot_start']:
            raise serializers.ValidationError(
                {'slot_end': 'slot_end must be after slot_start.'}
            )
        return attrs


class CreateBookingSerializer(serializers.Serializer):
    provider_service_id = serializers.UUIDField()
    address_id          = serializers.UUIDField()
    booking_date        = serializers.DateField()
    booking_time        = serializers.TimeField()
    notes               = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_booking_date(self, value):
        if value < date.today():
            raise serializers.ValidationError('Booking date cannot be in the past.')
        return value


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    )


class AvailableSlotsQuerySerializer(serializers.Serializer):
    provider_service_id = serializers.UUIDField()
    date                = serializers.DateField()

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError('Date cannot be in the past.')
        return value
