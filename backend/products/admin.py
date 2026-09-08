from django.contrib import admin

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    HomeBanner,
)


# ==========================================================
# BRAND ADMIN
# ==========================================================

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "slug",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    ordering = (
        "name",
    )


# ==========================================================
# CATEGORY ADMIN
# ==========================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "slug",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    ordering = (
        "name",
    )


# ==========================================================
# PRODUCT IMAGE INLINE
# ==========================================================

class ProductImageInline(admin.TabularInline):

    model = ProductImage

    extra = 1

    fields = (
        "color",
        "image",
        "image_type",
        "is_primary",
        "display_order",
    )

    ordering = (
        "display_order",
        "created_at",
    )


# ==========================================================
# PRODUCT VARIANT INLINE
# ==========================================================

class ProductVariantInline(admin.TabularInline):

    model = ProductVariant

    extra = 1

    fields = (
        "color",
        "size",
        "sku",
        "stock",
        "is_active",
    )

    ordering = (
        "color",
        "size",
    )


# ==========================================================
# PRODUCT ADMIN
# ==========================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    # ------------------------------------------------------
    # PRODUCT LIST
    # ------------------------------------------------------

    list_display = (
        "id",
        "name",
        "brand",
        "category",
        "gender",
        "price",
        "discount_price",
        "final_price_display",
        "is_featured",
        "is_new_arrival",
        "is_active",
        "created_at",
    )

    # ------------------------------------------------------
    # FILTERS
    # ------------------------------------------------------

    list_filter = (
        "gender",
        "brand",
        "category",
        "is_featured",
        "is_new_arrival",
        "is_active",
    )

    # ------------------------------------------------------
    # SEARCH
    # ------------------------------------------------------

    search_fields = (
        "name",
        "description",
        "brand__name",
        "category__name",
        "variants__sku",
        "images__color",
    )

    # ------------------------------------------------------
    # READ ONLY
    # ------------------------------------------------------

    readonly_fields = (
        "created_at",
        "updated_at",
        "final_price_display",
    )

    # ------------------------------------------------------
    # SLUG
    # ------------------------------------------------------

    prepopulated_fields = {
        "slug": ("name",),
    }

    # ------------------------------------------------------
    # LIST EDITABLE
    # ------------------------------------------------------

    list_editable = (
        "is_featured",
        "is_new_arrival",
        "is_active",
    )

    # ------------------------------------------------------
    # FIELDSETS
    # ------------------------------------------------------

    fieldsets = (

        (
            "Basic Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "brand",
                    "category",
                    "gender",
                    "description",
                )
            },
        ),

        (
            "Pricing",
            {
                "fields": (
                    "price",
                    "discount_price",
                    "final_price_display",
                )
            },
        ),

        (
            "Product Image",
            {
                "fields": (
                    "main_image",
                )
            },
        ),

        (
            "Store Placement",
            {
                "description": (
                    "Control where this product appears "
                    "on the customer website."
                ),
                "fields": (
                    "is_featured",
                    "is_new_arrival",
                ),
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "is_active",
                )
            },
        ),

        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    # ------------------------------------------------------
    # INLINE
    # ------------------------------------------------------

    inlines = (
        ProductImageInline,
        ProductVariantInline,
    )

    # ------------------------------------------------------
    # FINAL PRICE
    # ------------------------------------------------------

    @admin.display(
        description="Final Price",
    )
    def final_price_display(self, obj):

        return obj.final_price


# ==========================================================
# PRODUCT IMAGE ADMIN
# ==========================================================

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "color",
        "image_type",
        "is_primary",
        "display_order",
        "created_at",
    )

    list_filter = (
        "image_type",
        "is_primary",
        "color",
    )

    search_fields = (
        "product__name",
        "color",
    )

    readonly_fields = (
        "created_at",
    )

    list_editable = (
        "is_primary",
        "display_order",
    )

    ordering = (
        "product",
        "color",
        "display_order",
        "created_at",
    )


# ==========================================================
# PRODUCT VARIANT ADMIN
# ==========================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "color",
        "size",
        "sku",
        "stock",
        "is_active",
        "created_at",
    )

    list_filter = (
        "color",
        "size",
        "is_active",
    )

    search_fields = (
        "product__name",
        "sku",
        "color",
        "size",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_editable = (
        "stock",
        "is_active",
    )

    ordering = (
        "product",
        "color",
        "size",
    )


# ==========================================================
# HOME BANNER ADMIN
# ==========================================================

@admin.register(HomeBanner)
class HomeBannerAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "button_text",
        "display_order",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "title",
        "subtitle",
        "button_text",
        "button_link",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    fieldsets = (

        (
            "Banner Information",
            {
                "fields": (
                    "title",
                    "subtitle",
                    "image",
                )
            },
        ),

        (
            "Button",
            {
                "fields": (
                    "button_text",
                    "button_link",
                )
            },
        ),

        (
            "Display Settings",
            {
                "description": (
                    "Control the order and visibility "
                    "of this banner."
                ),
                "fields": (
                    "display_order",
                    "is_active",
                ),
            },
        ),

        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    ordering = (
        "display_order",
        "-created_at",
    )