from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "product",
        "rating",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "rating",
        "created_at",
    )

    search_fields = (
        "user__email",
        "user__username",
        "product__name",
        "title",
        "comment",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25