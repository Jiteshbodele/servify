from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    email     = serializers.EmailField()
    name      = serializers.CharField(min_length=2, max_length=255)
    phone     = serializers.CharField(min_length=7, max_length=20)
    role      = serializers.ChoiceField(choices=['seeker', 'provider'])
    password  = serializers.CharField(min_length=8, write_only=True)

    def validate_phone(self, value):
        if not value.replace('+', '').replace('-', '').isdigit():
            raise serializers.ValidationError('Phone must contain only digits.')
        return value


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class UpdateNameSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=255)


class AddressSerializer(serializers.Serializer):
    label      = serializers.CharField(max_length=50)
    street     = serializers.CharField(max_length=255)
    city       = serializers.CharField(max_length=100)
    state      = serializers.CharField(max_length=100)
    pincode    = serializers.CharField(max_length=10)
    is_default = serializers.BooleanField(default=False)
    latitude   = serializers.FloatField(required=False, allow_null=True)
    longitude  = serializers.FloatField(required=False, allow_null=True)

    def validate_pincode(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Pincode must be numeric.')
        return value
