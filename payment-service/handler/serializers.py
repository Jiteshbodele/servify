from rest_framework import serializers


class CreateOrderSerializer(serializers.Serializer):
    booking_id = serializers.UUIDField()
    amount     = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0.')
        return value


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id   = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature  = serializers.CharField()


class RefundSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default='')
