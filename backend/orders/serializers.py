from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "product",
            "variant",
            "product_name",
            "brand_name",
            "color",
            "size",
            "sku",
            "quantity",
            "unit_price",
            "total_price",
            "product_image",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "brand_name",
            "color",
            "size",
            "sku",
            "unit_price",
            "total_price",
            "product_image",
            "created_at",
        ]

    def get_product_image(self, obj):

        product = obj.product

        if not product:
            return None

        # --------------------------------------------------
        # 1. PRIMARY PRODUCT IMAGE
        # --------------------------------------------------

        primary_image = product.images.filter(
            is_primary=True
        ).order_by(
            "display_order",
            "id"
        ).first()

        if primary_image and primary_image.image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    primary_image.image.url
                )

            return primary_image.image.url

        # --------------------------------------------------
        # 2. FIRST PRODUCT IMAGE
        # --------------------------------------------------
        # ProductImage model does NOT have is_active.
        # Therefore do not filter using is_active=True.

        first_image = product.images.all().order_by(
            "display_order",
            "id"
        ).first()

        if first_image and first_image.image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    first_image.image.url
                )

            return first_image.image.url

        # --------------------------------------------------
        # 3. PRODUCT MAIN IMAGE
        # --------------------------------------------------

        if product.main_image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    product.main_image.url
                )

            return product.main_image.url

        # --------------------------------------------------
        # 4. NO IMAGE
        # --------------------------------------------------

        return None


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    coupon_code = serializers.CharField(
        source="coupon.code",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Order

        fields = [
            # --------------------------------------------------
            # ORDER BASIC INFORMATION
            # --------------------------------------------------

            "id",
            "order_number",
            "user",
            "user_email",

            # --------------------------------------------------
            # SHIPPING ADDRESS
            # --------------------------------------------------

            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "pincode",
            "country",

            # --------------------------------------------------
            # ORDER ITEMS
            # --------------------------------------------------

            "items",

            # --------------------------------------------------
            # PRICE INFORMATION
            # --------------------------------------------------

            "subtotal",
            "shipping_charge",
            "discount",
            "total_amount",

            # --------------------------------------------------
            # COUPON
            # --------------------------------------------------

            "coupon",
            "coupon_code",

            # --------------------------------------------------
            # PAYMENT
            # --------------------------------------------------

            "payment_method",
            "payment_status",

            # --------------------------------------------------
            # ORDER STATUS
            # --------------------------------------------------

            "status",

            # --------------------------------------------------
            # CANCELLATION
            # --------------------------------------------------

            "cancellation_reason",
            "cancellation_note",
            "cancelled_at",

            # --------------------------------------------------
            # RETURN
            # --------------------------------------------------

            "return_reason",
            "return_note",
            "return_requested_at",
            "return_processed_at",

            # --------------------------------------------------
            # REFUND
            # --------------------------------------------------

            "refund_amount",
            "refund_reference",
            "refund_processed_at",

            # --------------------------------------------------
            # NOTES
            # --------------------------------------------------

            "notes",

            # --------------------------------------------------
            # TIMESTAMPS
            # --------------------------------------------------

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            # --------------------------------------------------
            # ORDER BASIC INFORMATION
            # --------------------------------------------------

            "id",
            "order_number",
            "user",
            "user_email",

            # --------------------------------------------------
            # ORDER ITEMS
            # --------------------------------------------------

            "items",

            # --------------------------------------------------
            # PRICE INFORMATION
            # --------------------------------------------------

            "subtotal",
            "shipping_charge",
            "discount",
            "total_amount",

            # --------------------------------------------------
            # COUPON
            # --------------------------------------------------

            "coupon",
            "coupon_code",

            # --------------------------------------------------
            # PAYMENT
            # --------------------------------------------------

            "payment_status",

            # --------------------------------------------------
            # ORDER STATUS
            # --------------------------------------------------

            "status",

            # --------------------------------------------------
            # CANCELLATION
            # --------------------------------------------------

            "cancellation_reason",
            "cancellation_note",
            "cancelled_at",

            # --------------------------------------------------
            # RETURN
            # --------------------------------------------------

            "return_reason",
            "return_note",
            "return_requested_at",
            "return_processed_at",

            # --------------------------------------------------
            # REFUND
            # --------------------------------------------------

            "refund_amount",
            "refund_reference",
            "refund_processed_at",

            # --------------------------------------------------
            # TIMESTAMPS
            # --------------------------------------------------

            "created_at",
            "updated_at",
        ]