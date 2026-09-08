from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product, ProductVariant

from .models import Cart, CartItem
from .serializers import CartSerializer


# ==========================================================
# GET USER CART
# ==========================================================

class CartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product__brand",
                "items__variant"
            )
            .get(pk=cart.pk)
        )

        serializer = CartSerializer(
            cart,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADD TO CART
# ==========================================================

class AddToCartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        product_id = request.data.get("product")
        variant_id = request.data.get("variant")
        quantity = request.data.get("quantity", 1)

        # --------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------

        if not product_id:
            return Response(
                {
                    "detail": "Product is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not variant_id:
            return Response(
                {
                    "detail": "Product variant is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # QUANTITY VALIDATION
        # --------------------------------------------------

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):

            return Response(
                {
                    "detail": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:

            return Response(
                {
                    "detail": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # PRODUCT
        # --------------------------------------------------

        product = get_object_or_404(
            Product,
            pk=product_id,
            is_active=True
        )

        # --------------------------------------------------
        # VARIANT
        # --------------------------------------------------

        variant = get_object_or_404(
            ProductVariant,
            pk=variant_id,
            product=product,
            is_active=True
        )

        # --------------------------------------------------
        # STOCK CHECK
        # --------------------------------------------------

        if variant.stock <= 0:

            return Response(
                {
                    "detail": "This product variant is out of stock."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > variant.stock:

            return Response(
                {
                    "detail": (
                        f"Only {variant.stock} item(s) "
                        "are available in stock."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # GET / CREATE CART
        # --------------------------------------------------

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        # --------------------------------------------------
        # GET / CREATE CART ITEM
        # --------------------------------------------------

        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={
                "product": product,
                "quantity": quantity,
            }
        )

        # --------------------------------------------------
        # EXISTING ITEM
        # --------------------------------------------------

        if not item_created:

            new_quantity = (
                cart_item.quantity + quantity
            )

            if new_quantity > variant.stock:

                return Response(
                    {
                        "detail": (
                            f"You already have "
                            f"{cart_item.quantity} item(s) "
                            "in your cart. "
                            f"Only {variant.stock} available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = new_quantity

            cart_item.save()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        serializer = CartSerializer(
            cart,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Product added to cart successfully.",
                "cart": serializer.data,
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# UPDATE CART ITEM
# ==========================================================

class UpdateCartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):

        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart=cart
        )

        quantity = request.data.get("quantity")

        if quantity is None:

            return Response(
                {
                    "detail": "Quantity is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):

            return Response(
                {
                    "detail": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:

            return Response(
                {
                    "detail": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # CHECK PRODUCT / VARIANT
        # --------------------------------------------------

        if not cart_item.product.is_active:

            return Response(
                {
                    "detail": "This product is no longer available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not cart_item.variant.is_active:

            return Response(
                {
                    "detail": "This product variant is no longer available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # STOCK CHECK
        # --------------------------------------------------

        if cart_item.variant.stock < quantity:

            return Response(
                {
                    "detail": (
                        f"Only {cart_item.variant.stock} "
                        "item(s) are available in stock."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity

        cart_item.save()

        serializer = CartSerializer(
            cart,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Cart updated successfully.",
                "cart": serializer.data,
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# REMOVE CART ITEM
# ==========================================================

class RemoveCartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):

        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart=cart
        )

        cart_item.delete()

        serializer = CartSerializer(
            cart,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Item removed from cart.",
                "cart": serializer.data,
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# CLEAR CART
# ==========================================================

class ClearCartView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        cart.items.all().delete()

        serializer = CartSerializer(
            cart,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Cart cleared successfully.",
                "cart": serializer.data,
            },
            status=status.HTTP_200_OK
        )