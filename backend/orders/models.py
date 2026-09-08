from django.db import models
from django.conf import settings

from products.models import Product, ProductVariant
from coupons.models import Coupon


class Order(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("PROCESSING", "Processing"),
        ("SHIPPED", "Shipped"),
        ("OUT_FOR_DELIVERY", "Out for Delivery"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
        ("RETURN_REQUESTED", "Return Requested"),
        ("RETURN_APPROVED", "Return Approved"),
        ("RETURN_REJECTED", "Return Rejected"),
        ("RETURNED", "Returned"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
        ("REFUND_PENDING", "Refund Pending"),
        ("REFUNDED", "Refunded"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("COD", "Cash on Delivery"),
        ("ONLINE", "Online Payment"),
    ]

    RETURN_REASON_CHOICES = [
        ("WRONG_ITEM", "Wrong item received"),
        ("DAMAGED", "Product damaged"),
        ("DEFECTIVE", "Product defective"),
        ("SIZE_ISSUE", "Size issue"),
        ("COLOR_ISSUE", "Color issue"),
        ("NOT_AS_EXPECTED", "Product not as expected"),
        ("OTHER", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    order_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    # ------------------------------------------------------
    # SHIPPING ADDRESS SNAPSHOT
    # ------------------------------------------------------

    full_name = models.CharField(max_length=150)

    phone = models.CharField(max_length=20)

    address_line = models.TextField()

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    pincode = models.CharField(max_length=20)

    country = models.CharField(
        max_length=100,
        default="India",
    )

    # ------------------------------------------------------
    # PRICE DETAILS
    # ------------------------------------------------------

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    shipping_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # ------------------------------------------------------
    # COUPON
    # ------------------------------------------------------

    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    # ------------------------------------------------------
    # PAYMENT
    # ------------------------------------------------------

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="COD",
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING",
    )

    # ------------------------------------------------------
    # RAZORPAY PAYMENT
    # ------------------------------------------------------

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    razorpay_signature = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # ORDER STATUS
    # ------------------------------------------------------

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    # ------------------------------------------------------
    # CANCELLATION
    # ------------------------------------------------------

    cancellation_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    cancellation_note = models.TextField(
        blank=True,
        null=True,
    )

    cancelled_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return_reason = models.CharField(
        max_length=30,
        choices=RETURN_REASON_CHOICES,
        blank=True,
        null=True,
    )

    return_note = models.TextField(
        blank=True,
        null=True,
    )

    return_requested_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    return_processed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # REFUND
    # ------------------------------------------------------

    refund_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    refund_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    refund_processed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # NOTES
    # ------------------------------------------------------

    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} - {self.user.email}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    # ------------------------------------------------------
    # PRODUCT SNAPSHOT
    # ------------------------------------------------------

    product_name = models.CharField(
        max_length=255,
    )

    brand_name = models.CharField(
        max_length=255,
        blank=True,
    )

    color = models.CharField(
        max_length=100,
    )

    size = models.CharField(
        max_length=50,
    )

    sku = models.CharField(
        max_length=100,
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.product_name}"
        )

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)