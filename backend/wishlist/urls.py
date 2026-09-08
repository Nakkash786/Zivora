from django.urls import path

from .views import (
    WishlistView,
    AddToWishlistView,
    RemoveFromWishlistView,
    WishlistStatusView,
)

urlpatterns = [
    # Get wishlist
    path(
        "",
        WishlistView.as_view(),
        name="wishlist",
    ),

    # Add product to wishlist
    path(
        "add/",
        AddToWishlistView.as_view(),
        name="wishlist-add",
    ),

    # Remove product from wishlist
    path(
        "remove/<int:product_id>/",
        RemoveFromWishlistView.as_view(),
        name="wishlist-remove",
    ),

    # Check wishlist status
    path(
        "status/<int:product_id>/",
        WishlistStatusView.as_view(),
        name="wishlist-status",
    ),
]