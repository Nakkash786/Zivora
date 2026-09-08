from django.core.files.base import ContentFile
from django.db.models import Q
import os

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    HomeBanner,
)

from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductVariantSerializer,
    HomeBannerSerializer,
)


# ==========================================================
# BRAND VIEWSET
# ==========================================================

class BrandViewSet(viewsets.ModelViewSet):

    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve",
        ]:
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):

        queryset = Brand.objects.all()

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):
            queryset = queryset.filter(
                is_active=True
            )

        return queryset


# ==========================================================
# CATEGORY VIEWSET
# ==========================================================

class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve",
        ]:
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):

        queryset = Category.objects.all()

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):
            queryset = queryset.filter(
                is_active=True
            )

        return queryset


# ==========================================================
# PRODUCT VIEWSET
# ==========================================================

class ProductViewSet(viewsets.ModelViewSet):

    queryset = (
        Product.objects
        .select_related(
            "brand",
            "category",
        )
        .prefetch_related(
            "images",
            "images__variant",
            "variants",
        )
    )

    def get_permissions(self):

        # --------------------------------------------------
        # PUBLIC ACTIONS
        # --------------------------------------------------

        if self.action in [
            "list",
            "retrieve",
            "related",
        ]:
            return [AllowAny()]

        # --------------------------------------------------
        # ADMIN ACTIONS
        # --------------------------------------------------

        return [IsAdminUser()]

    def get_serializer_class(self):

        if self.action == "retrieve":
            return ProductDetailSerializer

        return ProductListSerializer

    def get_queryset(self):

        queryset = (
            Product.objects
            .select_related(
                "brand",
                "category",
            )
            .prefetch_related(
                "images",
                "images__variant",
                "variants",
            )
        )

        # --------------------------------------------------
        # PUBLIC USERS
        # --------------------------------------------------

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):

            queryset = queryset.filter(
                is_active=True,
                brand__is_active=True,
                category__is_active=True,
            )

        # --------------------------------------------------
        # STATUS
        # --------------------------------------------------

        status_filter = (
            self.request.query_params.get("status")
        )

        if status_filter:

            status_filter = (
                status_filter
                .lower()
                .strip()
            )

            if status_filter == "active":

                queryset = queryset.filter(
                    is_active=True
                )

            elif status_filter == "inactive":

                queryset = queryset.filter(
                    is_active=False
                )

        # --------------------------------------------------
        # FEATURED
        # --------------------------------------------------

        featured = (
            self.request.query_params.get("featured")
        )

        if featured:

            featured = (
                featured
                .lower()
                .strip()
            )

            if featured == "true":

                queryset = queryset.filter(
                    is_featured=True
                )

            elif featured == "false":

                queryset = queryset.filter(
                    is_featured=False
                )

        # --------------------------------------------------
        # NEW ARRIVAL
        # --------------------------------------------------

        new_arrival = (
            self.request.query_params.get("new_arrival")
        )

        if new_arrival:

            new_arrival = (
                new_arrival
                .lower()
                .strip()
            )

            if new_arrival == "true":

                queryset = queryset.filter(
                    is_new_arrival=True
                )

            elif new_arrival == "false":

                queryset = queryset.filter(
                    is_new_arrival=False
                )

        # --------------------------------------------------
        # GENDER
        # --------------------------------------------------

        gender = (
            self.request.query_params.get("gender")
        )

        if gender:

            queryset = queryset.filter(
                gender=gender.upper().strip()
            )

        # --------------------------------------------------
        # BRAND
        # --------------------------------------------------

        brand = (
            self.request.query_params.get("brand")
        )

        if brand:

            queryset = queryset.filter(
                brand_id=brand
            )

        # --------------------------------------------------
        # CATEGORY
        # --------------------------------------------------

        category = (
            self.request.query_params.get("category")
        )

        if category:

            queryset = queryset.filter(
                category_id=category
            )

        # --------------------------------------------------
        # SEARCH
        # --------------------------------------------------

        search = (
            self.request.query_params.get("search")
        )

        if search:

            search = search.strip()

            if search:

                queryset = queryset.filter(
                    name__icontains=search
                )

        # --------------------------------------------------
        # MIN PRICE
        # --------------------------------------------------

        min_price = (
            self.request.query_params.get("min_price")
        )

        if min_price:

            queryset = queryset.filter(
                price__gte=min_price
            )

        # --------------------------------------------------
        # MAX PRICE
        # --------------------------------------------------

        max_price = (
            self.request.query_params.get("max_price")
        )

        if max_price:

            queryset = queryset.filter(
                price__lte=max_price
            )

        # --------------------------------------------------
        # SORT
        # --------------------------------------------------

        sort = (
            self.request.query_params.get("sort")
        )

        if sort:

            sort = sort.lower().strip()

            if sort == "price_low":

                queryset = queryset.order_by(
                    "price"
                )

            elif sort == "price_high":

                queryset = queryset.order_by(
                    "-price"
                )

            elif sort == "oldest":

                queryset = queryset.order_by(
                    "created_at"
                )

            elif sort == "newest":

                queryset = queryset.order_by(
                    "-created_at"
                )

        return queryset

    # ======================================================
    # RELATED PRODUCTS
    # ======================================================

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="related",
    )
    def related(
        self,
        request,
        pk=None,
    ):

        # --------------------------------------------------
        # CURRENT PRODUCT
        # --------------------------------------------------

        product = self.get_object()

        # --------------------------------------------------
        # ACTIVE PRODUCTS
        # --------------------------------------------------

        queryset = (
            Product.objects
            .select_related(
                "brand",
                "category",
            )
            .prefetch_related(
                "variants",
            )
            .filter(
                is_active=True,
                brand__is_active=True,
                category__is_active=True,
            )
            .exclude(
                id=product.id
            )
        )

        # --------------------------------------------------
        # PRIORITY 1
        # SAME CATEGORY + SAME GENDER
        # --------------------------------------------------

        same_category_gender = (
            queryset
            .filter(
                category_id=product.category_id,
                gender=product.gender,
            )
            .order_by(
                "-is_featured",
                "-is_new_arrival",
                "-created_at",
            )
        )

        # --------------------------------------------------
        # PRIORITY 2
        # SAME CATEGORY
        # --------------------------------------------------

        same_category = (
            queryset
            .filter(
                category_id=product.category_id
            )
            .exclude(
                id__in=same_category_gender.values("id")
            )
            .order_by(
                "-is_featured",
                "-is_new_arrival",
                "-created_at",
            )
        )

        # --------------------------------------------------
        # PRIORITY 3
        # SAME GENDER
        # --------------------------------------------------

        same_gender = (
            queryset
            .filter(
                gender=product.gender
            )
            .exclude(
                id__in=same_category_gender.values("id")
            )
            .exclude(
                id__in=same_category.values("id")
            )
            .order_by(
                "-is_featured",
                "-is_new_arrival",
                "-created_at",
            )
        )

        # --------------------------------------------------
        # BUILD RELATED PRODUCTS
        # MAXIMUM 8 PRODUCTS
        # --------------------------------------------------

        related_products = list(
            same_category_gender[:8]
        )

        remaining = (
            8 - len(related_products)
        )

        # --------------------------------------------------
        # ADD SAME CATEGORY PRODUCTS
        # --------------------------------------------------

        if remaining > 0:

            related_products.extend(
                list(
                    same_category[:remaining]
                )
            )

        remaining = (
            8 - len(related_products)
        )

        # --------------------------------------------------
        # ADD SAME GENDER PRODUCTS
        # --------------------------------------------------

        if remaining > 0:

            related_products.extend(
                list(
                    same_gender[:remaining]
                )
            )

        # --------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------

        serializer = ProductListSerializer(
            related_products,
            many=True,
            context={
                "request": request,
            },
        )

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# PRODUCT IMAGE VIEWSET
# ==========================================================

class ProductImageViewSet(viewsets.ModelViewSet):

    queryset = (
        ProductImage.objects
        .select_related(
            "product",
            "variant",
        )
    )

    serializer_class = ProductImageSerializer

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve",
        ]:
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):

        queryset = (
            ProductImage.objects
            .select_related(
                "product",
                "variant",
            )
        )

        # --------------------------------------------------
        # PUBLIC USERS
        # --------------------------------------------------

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):

            queryset = queryset.filter(
                product__is_active=True,
                product__brand__is_active=True,
                product__category__is_active=True,
            ).filter(
                Q(
                    variant__is_active=True
                )
                |
                Q(
                    variant__isnull=True
                )
            )

        # --------------------------------------------------
        # PRODUCT FILTER
        # --------------------------------------------------

        product_id = (
            self.request.query_params.get("product")
        )

        if product_id:

            queryset = queryset.filter(
                product_id=product_id
            )

        # --------------------------------------------------
        # OLD VARIANT FILTER
        # --------------------------------------------------

        variant_id = (
            self.request.query_params.get("variant")
        )

        if variant_id:

            queryset = queryset.filter(
                variant_id=variant_id
            )

        # --------------------------------------------------
        # COLOR FILTER
        # --------------------------------------------------

        color = (
            self.request.query_params.get("color")
        )

        if color:

            color = color.strip()

            if color:

                queryset = queryset.filter(
                    Q(
                        color__iexact=color
                    )
                    |
                    Q(
                        color="",
                        variant__color__iexact=color
                    )
                )

        # --------------------------------------------------
        # IMAGE TYPE FILTER
        # --------------------------------------------------

        image_type = (
            self.request.query_params.get("image_type")
        )

        if image_type:

            queryset = queryset.filter(
                image_type=image_type.upper().strip()
            )

        return queryset

    # ======================================================
    # SET MAIN IMAGE
    # ======================================================

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminUser],
        url_path="set-main",
    )
    def set_main(
        self,
        request,
        pk=None,
    ):

        try:

            image = self.get_object()
            product = image.product

            # --------------------------------------------------
            # CHECK IMAGE
            # --------------------------------------------------

            if not image.image:

                return Response(
                    {
                        "detail":
                        "This image file does not exist."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # --------------------------------------------------
            # READ IMAGE
            # --------------------------------------------------

            image.image.open("rb")

            image_content = image.image.read()

            image.image.close()

            # --------------------------------------------------
            # FILE NAME
            # --------------------------------------------------

            original_name = os.path.basename(
                image.image.name
            )

            if not original_name:

                original_name = (
                    f"product-{product.id}.jpg"
                )

            # --------------------------------------------------
            # SAVE MAIN IMAGE
            # --------------------------------------------------

            product.main_image.save(
                original_name,
                ContentFile(image_content),
                save=True,
            )

            # --------------------------------------------------
            # RESET PRIMARY
            # --------------------------------------------------

            ProductImage.objects.filter(
                product=product
            ).update(
                is_primary=False
            )

            # --------------------------------------------------
            # SET PRIMARY
            # --------------------------------------------------

            image.is_primary = True

            image.save(
                update_fields=[
                    "is_primary"
                ]
            )

            # --------------------------------------------------
            # RESPONSE
            # --------------------------------------------------

            return Response(
                {
                    "detail":
                    "Main image updated successfully.",

                    "product_id":
                    product.id,

                    "main_image":
                    (
                        product.main_image.url
                        if product.main_image
                        else None
                    ),

                    "image_id":
                    image.id,

                    "color":
                    image.color
                    if image.color
                    else (
                        image.variant.color
                        if image.variant
                        else None
                    ),

                    "variant":
                    (
                        image.variant_id
                        if image.variant
                        else None
                    ),

                    "variant_color":
                    (
                        image.color
                        if image.color
                        else (
                            image.variant.color
                            if image.variant
                            else None
                        )
                    ),

                    "variant_size":
                    None,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:

            print(
                "Set main image error:",
                exc
            )

            return Response(
                {
                    "detail":
                    "Unable to set this image as the main image."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ==========================================================
# PRODUCT VARIANT VIEWSET
# ==========================================================

class ProductVariantViewSet(viewsets.ModelViewSet):

    queryset = (
        ProductVariant.objects
        .select_related(
            "product"
        )
    )

    serializer_class = ProductVariantSerializer

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve",
        ]:
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):

        queryset = (
            ProductVariant.objects
            .select_related(
                "product"
            )
        )

        # --------------------------------------------------
        # PUBLIC USERS
        # --------------------------------------------------

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):

            queryset = queryset.filter(
                is_active=True,
                product__is_active=True,
                product__brand__is_active=True,
                product__category__is_active=True,
            )

        # --------------------------------------------------
        # PRODUCT
        # --------------------------------------------------

        product_id = (
            self.request.query_params.get("product")
        )

        if product_id:

            queryset = queryset.filter(
                product_id=product_id
            )

        # --------------------------------------------------
        # COLOR
        # --------------------------------------------------

        color = (
            self.request.query_params.get("color")
        )

        if color:

            queryset = queryset.filter(
                color__iexact=color.strip()
            )

        # --------------------------------------------------
        # SIZE
        # --------------------------------------------------

        size = (
            self.request.query_params.get("size")
        )

        if size:

            queryset = queryset.filter(
                size__iexact=size.strip()
            )

        return queryset


# ==========================================================
# HOME BANNER VIEWSET
# ==========================================================

class HomeBannerViewSet(viewsets.ModelViewSet):

    queryset = HomeBanner.objects.all()
    serializer_class = HomeBannerSerializer

    def get_permissions(self):

        if self.action in [
            "list",
            "retrieve",
        ]:
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):

        queryset = HomeBanner.objects.all()

        if not getattr(
            self.request.user,
            "is_staff",
            False
        ):

            queryset = queryset.filter(
                is_active=True
            )

        return queryset