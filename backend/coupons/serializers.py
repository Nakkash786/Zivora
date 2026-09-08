from rest_framework import serializers
from .models import Coupon, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    usage_count = serializers.IntegerField(
        source="used_count",
        read_only=True
    )

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_discount_amount",
            "usage_limit",
            "usage_limit_per_user",
            "used_count",
            "usage_count",
            "valid_from",
            "valid_until",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "used_count",
            "usage_count",
            "created_at",
            "updated_at",
        ]

    def validate_code(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        discount_type = attrs.get(
            "discount_type",
            getattr(self.instance, "discount_type", "PERCENTAGE")
        )

        discount_value = attrs.get(
            "discount_value",
            getattr(self.instance, "discount_value", None)
        )

        if discount_value is not None and discount_value <= 0:
            raise serializers.ValidationError({
                "discount_value": "Discount value must be greater than 0."
            })

        if discount_type == "PERCENTAGE":
            if discount_value is not None and discount_value > 100:
                raise serializers.ValidationError({
                    "discount_value": "Percentage discount cannot exceed 100."
                })

        valid_from = attrs.get(
            "valid_from",
            getattr(self.instance, "valid_from", None)
        )

        valid_until = attrs.get(
            "valid_until",
            getattr(self.instance, "valid_until", None)
        )

        if valid_from and valid_until and valid_until <= valid_from:
            raise serializers.ValidationError({
                "valid_until": "Valid until must be after valid from."
            })

        return attrs


class CouponUsageSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(
        source="coupon.code",
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = CouponUsage
        fields = [
            "id",
            "coupon",
            "coupon_code",
            "user",
            "user_email",
            "order",
            "order_number",
            "discount_amount",
            "used_at",
        ]