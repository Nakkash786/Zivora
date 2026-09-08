from django.urls import path

from .views import (
    ProductReviewsView,
    CreateReviewView,
    MyReviewsView,
    AdminReviewsView,
    AdminReviewDetailView,
)


urlpatterns = [

    # ======================================================
    # USER
    # ======================================================

    path(
        "product/<int:product_id>/",
        ProductReviewsView.as_view(),
        name="product-reviews",
    ),

    path(
        "create/",
        CreateReviewView.as_view(),
        name="create-review",
    ),

    path(
        "my/",
        MyReviewsView.as_view(),
        name="my-reviews",
    ),

    # ======================================================
    # ADMIN
    # ======================================================

    path(
        "admin/",
        AdminReviewsView.as_view(),
        name="admin-reviews",
    ),

    path(
        "admin/<int:review_id>/",
        AdminReviewDetailView.as_view(),
        name="admin-review-detail",
    ),
]