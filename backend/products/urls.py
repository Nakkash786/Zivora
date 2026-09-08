from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    CategoryViewSet,
    ProductViewSet,
    ProductImageViewSet,
    ProductVariantViewSet,
    HomeBannerViewSet,
)


router = DefaultRouter()

router.register(
    r"brands",
    BrandViewSet,
    basename="brand"
)

router.register(
    r"categories",
    CategoryViewSet,
    basename="category"
)

router.register(
    r"products",
    ProductViewSet,
    basename="product"
)

router.register(
    r"images",
    ProductImageViewSet,
    basename="product-image"
)

router.register(
    r"variants",
    ProductVariantViewSet,
    basename="product-variant"
)

router.register(
    r"banners",
    HomeBannerViewSet,
    basename="home-banner"
)


urlpatterns = router.urls