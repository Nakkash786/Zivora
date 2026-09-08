from rest_framework import serializers

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    HomeBanner,
)


# ==========================================================
# BRAND SERIALIZER
# ==========================================================

class BrandSerializer(serializers.ModelSerializer):

    class Meta:

        model = Brand

        fields = [
            "id",
            "name",
            "slug",
            "logo",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]


# ==========================================================
# CATEGORY SERIALIZER
# ==========================================================

class CategorySerializer(serializers.ModelSerializer):

    class Meta:

        model = Category

        fields = [
            "id",
            "name",
            "slug",
            "image",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]


# ==========================================================
# PRODUCT IMAGE SERIALIZER
# ==========================================================

class ProductImageSerializer(serializers.ModelSerializer):

    # ------------------------------------------------------
    # COLOR FOR FRONTEND
    # ------------------------------------------------------

    variant_color = serializers.SerializerMethodField()

    # ------------------------------------------------------
    # SIZE
    # ------------------------------------------------------
    #
    # Kept for backward compatibility.
    # New color-based images do not have a size.
    #
    # ------------------------------------------------------

    variant_size = serializers.SerializerMethodField()

    class Meta:

        model = ProductImage

        fields = [
            "id",
            "product",

            # New color mapping
            "color",

            # Frontend compatibility
            "variant_color",
            "variant_size",

            # Old field retained for existing data
            "variant",

            "image",
            "image_type",
            "is_primary",
            "display_order",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "variant_color",
            "variant_size",
            "created_at",
        ]

    # ------------------------------------------------------
    # GET COLOR
    # ------------------------------------------------------

    def get_variant_color(self, obj):

        if obj.color:
            return obj.color

        if obj.variant:
            return obj.variant.color

        return None

    # ------------------------------------------------------
    # GET SIZE
    # ------------------------------------------------------

    def get_variant_size(self, obj):

        # New images are color-based.
        return None

    # ------------------------------------------------------
    # VALIDATE
    # ------------------------------------------------------

    def validate(self, attrs):

        product = attrs.get("product")

        color = attrs.get("color")

        variant = attrs.get("variant")

        # --------------------------------------------------
        # UPDATE
        # --------------------------------------------------

        if product is None:

            instance = getattr(
                self,
                "instance",
                None
            )

            if instance:
                product = instance.product

        # --------------------------------------------------
        # NEW COLOR IMAGE
        # --------------------------------------------------

        if color:

            color = color.strip()

            if not color:

                raise serializers.ValidationError(
                    {
                        "color":
                        "Color cannot be empty."
                    }
                )

            if product:

                exists = ProductVariant.objects.filter(
                    product=product,
                    color__iexact=color,
                    is_active=True
                ).exists()

                if not exists:

                    raise serializers.ValidationError(
                        {
                            "color":
                            "This color does not exist "
                            "for the selected product."
                        }
                    )

            attrs["color"] = color

        # --------------------------------------------------
        # OLD VARIANT COMPATIBILITY
        # --------------------------------------------------

        if variant and product:

            if variant.product_id != product.id:

                raise serializers.ValidationError(
                    {
                        "variant":
                        "Selected variant does not belong "
                        "to this product."
                    }
                )

        return attrs


# ==========================================================
# PRODUCT VARIANT SERIALIZER
# ==========================================================

class ProductVariantSerializer(serializers.ModelSerializer):

    class Meta:

        model = ProductVariant

        fields = [
            "id",
            "product",
            "color",
            "size",
            "sku",
            "stock",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_stock(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value


# ==========================================================
# PRODUCT LIST SERIALIZER
# ==========================================================

class ProductListSerializer(serializers.ModelSerializer):

    brand_name = serializers.CharField(
        source="brand.name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    discount_percentage = serializers.IntegerField(
        read_only=True
    )

    total_stock = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = [
            "id",
            "name",
            "slug",

            "brand",
            "brand_name",

            "category",
            "category_name",

            "gender",

            "price",
            "discount_price",
            "final_price",
            "discount_percentage",

            "main_image",

            "total_stock",

            "is_featured",
            "is_new_arrival",
            "is_active",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "final_price",
            "discount_percentage",
            "total_stock",
            "created_at",
            "updated_at",
        ]

    def get_total_stock(self, obj):

        return sum(
            variant.stock
            for variant in obj.variants.all()
            if variant.is_active
        )


# ==========================================================
# PRODUCT DETAIL SERIALIZER
# ==========================================================

class ProductDetailSerializer(serializers.ModelSerializer):

    brand_name = serializers.CharField(
        source="brand.name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    discount_percentage = serializers.IntegerField(
        read_only=True
    )

    images = serializers.SerializerMethodField()

    variants = serializers.SerializerMethodField()

    total_stock = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = [
            "id",
            "name",
            "slug",

            "brand",
            "brand_name",

            "category",
            "category_name",

            "description",
            "gender",

            "price",
            "discount_price",
            "final_price",
            "discount_percentage",

            "main_image",

            "images",
            "variants",

            "total_stock",

            "is_featured",
            "is_new_arrival",
            "is_active",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "final_price",
            "discount_percentage",
            "images",
            "variants",
            "total_stock",
            "created_at",
            "updated_at",
        ]

    # ------------------------------------------------------
    # IMAGES
    # ------------------------------------------------------

    def get_images(self, obj):

        images = obj.images.all()

        return ProductImageSerializer(
            images,
            many=True,
            context=self.context
        ).data

    # ------------------------------------------------------
    # ACTIVE VARIANTS
    # ------------------------------------------------------

    def get_variants(self, obj):

        variants = obj.variants.filter(
            is_active=True
        )

        return ProductVariantSerializer(
            variants,
            many=True,
            context=self.context
        ).data

    # ------------------------------------------------------
    # TOTAL STOCK
    # ------------------------------------------------------

    def get_total_stock(self, obj):

        return sum(
            variant.stock
            for variant in obj.variants.filter(
                is_active=True
            )
        )


# ==========================================================
# HOME BANNER SERIALIZER
# ==========================================================

class HomeBannerSerializer(serializers.ModelSerializer):

    class Meta:

        model = HomeBanner

        fields = [
            "id",
            "title",
            "subtitle",
            "image",
            "button_text",
            "button_link",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]