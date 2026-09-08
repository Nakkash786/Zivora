from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "code",
        "discount_type",
        "discount_value",
        "min_order_amount",
        "usage_limit",
        "used_count",
        "valid_from",
        "valid_until",
        "is_active",
    )

    list_filter = (
        "discount_type",
        "is_active",
        "valid_from",
        "valid_until",
    )

    search_fields = (
        "code",
        "description",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "used_count",
        "created_at",
        "updated_at",
    )

    list_per_page = 25


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "coupon",
        "user",
        "order",
        "discount_amount",
        "used_at",
    )

    list_filter = (
        "used_at",
        "coupon",
    )

    search_fields = (
        "coupon__code",
        "user__email",
        "user__username",
    )

    ordering = (
        "-used_at",
    )

    readonly_fields = (
        "coupon",
        "user",
        "order",
        "discount_amount",
        "used_at",
    )

    list_per_page = 25