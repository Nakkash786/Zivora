from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer


# ==========================================================
# GET WISHLIST
# ==========================================================

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user
        )

        wishlist = (
            Wishlist.objects
            .select_related("user")
            .prefetch_related(
                "items__product__brand"
            )
            .get(pk=wishlist.pk)
        )

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ==========================================================
# ADD TO WISHLIST
# ==========================================================

class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {
                    "detail": "Product is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(
            Product,
            pk=product_id,
            is_active=True
        )

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user
        )

        wishlist_item, item_created = (
            WishlistItem.objects.get_or_create(
                wishlist=wishlist,
                product=product
            )
        )

        if not item_created:
            return Response(
                {
                    "detail": "Product is already in your wishlist.",
                    "wishlist": WishlistSerializer(
                        wishlist,
                        context={"request": request}
                    ).data
                },
                status=status.HTTP_200_OK
            )

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Product added to wishlist successfully.",
                "wishlist": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================================
# REMOVE FROM WISHLIST
# ==========================================================

class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        wishlist = get_object_or_404(
            Wishlist,
            user=request.user
        )

        wishlist_item = get_object_or_404(
            WishlistItem,
            wishlist=wishlist,
            product_id=product_id
        )

        wishlist_item.delete()

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Product removed from wishlist.",
                "wishlist": serializer.data
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# CHECK WISHLIST STATUS
# ==========================================================

class WishlistStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        exists = WishlistItem.objects.filter(
            wishlist__user=request.user,
            product_id=product_id
        ).exists()

        return Response(
            {
                "is_wishlisted": exists
            },
            status=status.HTTP_200_OK
        )