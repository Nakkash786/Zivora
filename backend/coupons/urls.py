from django.urls import path

from .views import (
    AdminCouponsView,
    AdminCouponDetailView,
    ValidateCouponView,
    AdminCouponUsageView,
)


urlpatterns = [
    path(
        "admin/",
        AdminCouponsView.as_view(),
        name="admin-coupons"
    ),

    path(
        "admin/<int:coupon_id>/",
        AdminCouponDetailView.as_view(),
        name="admin-coupon-detail"
    ),

    path(
        "validate/",
        ValidateCouponView.as_view(),
        name="validate-coupon"
    ),

    path(
        "admin/usages/",
        AdminCouponUsageView.as_view(),
        name="admin-coupon-usages"
    ),
]