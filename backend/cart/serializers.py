from rest_framework import serializers

from .models import Cart, CartItem


# ==========================================================
# CART ITEM SERIALIZER
# ==========================================================

class CartItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    brand_name = serializers.CharField(
        source="product.brand.name",
        read_only=True
    )

    product_image = serializers.ImageField(
        source="product.main_image",
        read_only=True
    )

    color = serializers.CharField(
        source="variant.color",
        read_only=True
    )

    size = serializers.CharField(
        source="variant.size",
        read_only=True
    )

    sku = serializers.CharField(
        source="variant.sku",
        read_only=True
    )

    stock = serializers.IntegerField(
        source="variant.stock",
        read_only=True
    )

    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:

        model = CartItem

        fields = [
            "id",
            "product",
            "product_name",
            "brand_name",
            "product_image",
            "variant",
            "color",
            "size",
            "sku",
            "stock",
            "quantity",
            "unit_price",
            "total_price",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "brand_name",
            "product_image",
            "color",
            "size",
            "sku",
            "stock",
            "unit_price",
            "total_price",
            "created_at",
            "updated_at",
        ]

    # ======================================================
    # VALIDATE QUANTITY
    # ======================================================

    def validate_quantity(self, value):

        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return value


# ==========================================================
# CART SERIALIZER
# ==========================================================

class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total_items = serializers.IntegerField(
        read_only=True
    )

    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:

        model = Cart

        fields = [
            "id",
            "user",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        ]