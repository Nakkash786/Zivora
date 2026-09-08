from django.db import models
from django.utils.text import slugify


# ==========================================================
# BRAND
# ==========================================================

class Brand(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    logo = models.ImageField(
        upload_to="brands/",
        null=True,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ==========================================================
# CATEGORY
# ==========================================================

class Category(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="categories/",
        null=True,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ==========================================================
# PRODUCT
# ==========================================================

class Product(models.Model):

    # ------------------------------------------------------
    # GENDER
    # ------------------------------------------------------

    MEN = "MEN"
    WOMEN = "WOMEN"
    UNISEX = "UNISEX"
    KIDS = "KIDS"

    GENDER_CHOICES = [
        (MEN, "Men"),
        (WOMEN, "Women"),
        (UNISEX, "Unisex"),
        (KIDS, "Kids"),
    ]

    # ------------------------------------------------------
    # BASIC INFORMATION
    # ------------------------------------------------------

    name = models.CharField(
        max_length=200
    )

    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name="products"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products"
    )

    description = models.TextField(
        blank=True
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    # ------------------------------------------------------
    # PRICE
    # ------------------------------------------------------

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    # ------------------------------------------------------
    # MAIN IMAGE
    # ------------------------------------------------------

    main_image = models.ImageField(
        upload_to="products/main/",
        null=True,
        blank=True
    )

    # ------------------------------------------------------
    # PRODUCT STATUS
    # ------------------------------------------------------

    is_featured = models.BooleanField(
        default=False
    )

    is_new_arrival = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    # ------------------------------------------------------
    # TIMESTAMPS
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    # ------------------------------------------------------
    # FINAL PRICE
    # ------------------------------------------------------

    @property
    def final_price(self):

        if (
            self.discount_price is not None
            and self.discount_price < self.price
        ):
            return self.discount_price

        return self.price

    # ------------------------------------------------------
    # DISCOUNT PERCENTAGE
    # ------------------------------------------------------

    @property
    def discount_percentage(self):

        if (
            self.discount_price is not None
            and self.discount_price < self.price
            and self.price > 0
        ):
            discount = (
                (self.price - self.discount_price)
                / self.price
            ) * 100

            return round(discount)

        return 0

    def __str__(self):
        return self.name


# ==========================================================
# PRODUCT VARIANT
# ==========================================================

class ProductVariant(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    # ------------------------------------------------------
    # COLOR
    # ------------------------------------------------------

    color = models.CharField(
        max_length=50
    )

    # ------------------------------------------------------
    # SIZE
    # ------------------------------------------------------

    size = models.CharField(
        max_length=30
    )

    # ------------------------------------------------------
    # SKU
    # ------------------------------------------------------

    sku = models.CharField(
        max_length=100,
        unique=True
    )

    # ------------------------------------------------------
    # STOCK
    # ------------------------------------------------------

    stock = models.PositiveIntegerField(
        default=0
    )

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    is_active = models.BooleanField(
        default=True
    )

    # ------------------------------------------------------
    # TIMESTAMPS
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = [
            "color",
            "size"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "color",
                    "size"
                ],
                name="unique_product_color_size"
            )
        ]

    def __str__(self):

        return (
            f"{self.product.name} - "
            f"{self.color} - "
            f"{self.size}"
        )


# ==========================================================
# PRODUCT IMAGE
# ==========================================================

class ProductImage(models.Model):

    FRONT = "FRONT"
    BACK = "BACK"
    SIDE = "SIDE"
    MODEL = "MODEL"
    DETAIL = "DETAIL"
    OTHER = "OTHER"

    IMAGE_TYPE_CHOICES = [
        (FRONT, "Front"),
        (BACK, "Back"),
        (SIDE, "Side"),
        (MODEL, "Model"),
        (DETAIL, "Detail"),
        (OTHER, "Other"),
    ]

    # ------------------------------------------------------
    # PRODUCT
    # ------------------------------------------------------

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    # ------------------------------------------------------
    # COLOR
    # ------------------------------------------------------
    #
    # IMPORTANT:
    # Image belongs to COLOR, not SIZE.
    #
    # Example:
    #
    # Black:
    #   black-front.jpg
    #   black-back.jpg
    #
    # These images are automatically used for:
    #
    # Black S
    # Black M
    # Black L
    #
    # ------------------------------------------------------

    color = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    # ------------------------------------------------------
    # OLD VARIANT FIELD
    # ------------------------------------------------------
    #
    # Kept temporarily for old database records.
    #
    # New images from the admin frontend will use COLOR.
    #
    # ------------------------------------------------------

    variant = models.ForeignKey(
        "ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="images"
    )

    # ------------------------------------------------------
    # IMAGE
    # ------------------------------------------------------

    image = models.ImageField(
        upload_to="products/gallery/"
    )

    # ------------------------------------------------------
    # IMAGE TYPE
    # ------------------------------------------------------

    image_type = models.CharField(
        max_length=10,
        choices=IMAGE_TYPE_CHOICES,
        default=OTHER
    )

    # ------------------------------------------------------
    # PRIMARY
    # ------------------------------------------------------

    is_primary = models.BooleanField(
        default=False
    )

    # ------------------------------------------------------
    # DISPLAY ORDER
    # ------------------------------------------------------

    display_order = models.PositiveIntegerField(
        default=0
    )

    # ------------------------------------------------------
    # TIMESTAMP
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = [
            "display_order",
            "created_at"
        ]

    def save(self, *args, **kwargs):

        # --------------------------------------------------
        # BACKWARD COMPATIBILITY
        # --------------------------------------------------
        # If old image has variant but no color,
        # automatically copy variant color.
        # --------------------------------------------------

        if (
            not self.color
            and self.variant
        ):
            self.color = self.variant.color

        if self.color:
            self.color = self.color.strip()

        super().save(*args, **kwargs)

    def __str__(self):

        color_name = (
            self.color
            if self.color
            else (
                self.variant.color
                if self.variant
                else "No Color"
            )
        )

        return (
            f"{self.product.name} - "
            f"{color_name} - "
            f"{self.image_type}"
        )


# ==========================================================
# HOME BANNER
# ==========================================================

class HomeBanner(models.Model):

    title = models.CharField(
        max_length=200
    )

    subtitle = models.TextField(
        blank=True
    )

    image = models.ImageField(
        upload_to="home_banners/"
    )

    button_text = models.CharField(
        max_length=100,
        default="Shop Now"
    )

    button_link = models.CharField(
        max_length=255,
        default="/products"
    )

    is_active = models.BooleanField(
        default=True
    )

    display_order = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = [
            "display_order",
            "-created_at"
        ]

    def __str__(self):
        return self.title