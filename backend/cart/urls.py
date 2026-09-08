from django.urls import path

from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
)


urlpatterns = [

    # View current user's cart
    path(
        "",
        CartView.as_view(),
        name="cart"
    ),

    # Add product to cart
    path(
        "add/",
        AddToCartView.as_view(),
        name="cart-add"
    ),

    # Update cart item quantity
    path(
        "items/<int:item_id>/",
        UpdateCartItemView.as_view(),
        name="cart-item-update"
    ),

    # Remove cart item
    path(
        "items/<int:item_id>/remove/",
        RemoveCartItemView.as_view(),
        name="cart-item-remove"
    ),

    # Clear complete cart
    path(
        "clear/",
        ClearCartView.as_view(),
        name="cart-clear"
    ),
]