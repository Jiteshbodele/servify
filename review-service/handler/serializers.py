from rest_framework import serializers


class CreateReviewSerializer(serializers.Serializer):
    booking_id  = serializers.UUIDField()
    target_type = serializers.ChoiceField(choices=['provider', 'seeker'])
    rating      = serializers.IntegerField(min_value=1, max_value=5)
    comment     = serializers.CharField(
        required=False, allow_blank=True, default='', max_length=1000
    )


class ReviewQuerySerializer(serializers.Serializer):
    target_id   = serializers.UUIDField()
    target_type = serializers.ChoiceField(
        choices=['provider', 'seeker'], default='provider'
    )
