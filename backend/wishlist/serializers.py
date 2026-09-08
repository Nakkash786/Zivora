from rest_framework import serializers

from .models import Wishlist, WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
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

    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    final_price = serializers.DecimalField(
        source="product.final_price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    discount_percentage = serializers.IntegerField(
        source="product.discount_percentage",
        read_only=True
    )

    is_active = serializers.BooleanField(
        source="product.is_active",
        read_only=True
    )

    class Meta:
        model = WishlistItem

        fields = [
            "id",
            "product",
            "product_name",
            "brand_name",
            "product_image",
            "price",
            "final_price",
            "discount_percentage",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "brand_name",
            "product_image",
            "price",
            "final_price",
            "discount_percentage",
            "is_active",
            "created_at",
        ]


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(
        many=True,
        read_only=True
    )

    item_count = serializers.IntegerField(
        source="items.count",
        read_only=True
    )

    class Meta:
        model = Wishlist

        fields = [
            "id",
            "user",
            "items",
            "item_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "items",
            "item_count",
            "created_at",
            "updated_at",
        ]