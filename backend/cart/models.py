from django.db import models
from django.conf import settings

from products.models import Product, ProductVariant


# ==========================================================
# CART
# ==========================================================

class Cart(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart - {self.user.email}"

    @property
    def total_items(self):
        return sum(
            item.quantity
            for item in self.items.all()
        )

    @property
    def subtotal(self):
        return sum(
            item.total_price
            for item in self.items.all()
        )


# ==========================================================
# CART ITEM
# ==========================================================

class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "cart",
                    "variant"
                ],
                name="unique_cart_variant"
            )
        ]

    def __str__(self):
        return (
            f"{self.cart.user.email} - "
            f"{self.product.name} - "
            f"{self.variant.color} - "
            f"{self.variant.size}"
        )

    @property
    def unit_price(self):
        """
        Product-ന്റെ നിലവിലെ final price.
        """

        return self.product.final_price

    @property
    def total_price(self):
        """
        Unit price × quantity
        """

        return self.unit_price * self.quantity