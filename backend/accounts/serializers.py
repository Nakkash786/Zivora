from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Address


User = get_user_model()


# ==========================================================
# REGISTER SERIALIZER
# ==========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "phone",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):

        value = value.lower().strip()

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["password_confirm"]:

            raise serializers.ValidationError({
                "password_confirm":
                "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop(
            "password_confirm"
        )

        password = validated_data.pop(
            "password"
        )

        user = User(
            **validated_data
        )

        user.set_password(password)

        # Normal users must verify email
        user.is_active = False
        user.is_email_verified = False

        user.save()

        return user


# ==========================================================
# LOGIN SERIALIZER
# ==========================================================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs["email"].lower().strip()
        password = attrs["password"]

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "Invalid email or password."
            )

        # --------------------------------------------------
        # PASSWORD CHECK
        # --------------------------------------------------

        if not user.check_password(password):

            raise serializers.ValidationError(
                "Invalid email or password."
            )

        # --------------------------------------------------
        # EMAIL VERIFICATION
        # --------------------------------------------------
        # Normal users must verify email.
        # Admin / staff users can login directly.

        if not user.is_staff and not user.is_email_verified:

            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )

        # --------------------------------------------------
        # ACTIVE ACCOUNT CHECK
        # --------------------------------------------------

        if not user.is_active:

            raise serializers.ValidationError(
                "Your account is inactive."
            )

        attrs["user"] = user

        return attrs


# ==========================================================
# PROFILE SERIALIZER
# ==========================================================

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "first_name",
            "last_name",
            "profile_image",
            "is_email_verified",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "email",
            "is_email_verified",
            "created_at",
            "updated_at",
        ]

    def validate_username(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )

        if len(value) > 150:
            raise serializers.ValidationError(
                "Username cannot exceed 150 characters."
            )

        # Check whether another user already has this username
        if User.objects.filter(
            username__iexact=value
        ).exclude(
            pk=self.instance.pk
        ).exists():

            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_phone(self, value):

        if value:

            value = value.strip()

            if not value.isdigit():

                raise serializers.ValidationError(
                    "Phone number must contain only digits."
                )

            if len(value) < 10 or len(value) > 15:

                raise serializers.ValidationError(
                    "Enter a valid phone number."
                )

        return value

# ==========================================================
# ADDRESS SERIALIZER
# ==========================================================


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address

        fields = [
            "id",
            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "pincode",
            "country",
            "address_type",
            "is_default",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]