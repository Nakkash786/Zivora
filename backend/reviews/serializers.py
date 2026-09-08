from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )
    user_profile_image = serializers.SerializerMethodField()

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_image = serializers.SerializerMethodField()

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "user_profile_image",
            "product",
            "product_name",
            "product_image",
            "order",
            "order_number",
            "rating",
            "title",
            "comment",
            "status",
            "admin_note",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "user",
            "user_name",
            "user_email",
            "user_profile_image",
            "product_name",
            "product_image",
            "order_number",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        user = obj.user

        full_name = f"{user.first_name} {user.last_name}".strip()

        if full_name:
            return full_name

        return user.username or user.email

    def get_user_profile_image(self, obj):
        request = self.context.get("request")

        if not obj.user.profile_image:
            return None

        try:
            url = obj.user.profile_image.url

            if request:
                return request.build_absolute_uri(url)

            return url

        except ValueError:
            return None

    def get_product_image(self, obj):
        request = self.context.get("request")

        if not obj.product.main_image:
            return None

        try:
            url = obj.product.main_image.url

            if request:
                return request.build_absolute_uri(url)

            return url

        except ValueError:
            return None