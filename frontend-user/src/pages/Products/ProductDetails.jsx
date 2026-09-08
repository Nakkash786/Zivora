import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistStatus,
} from "../../services/wishlistApi";
import Reviews from "../Reviews/Reviews";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // PRODUCT
  // ==========================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // RELATED PRODUCTS
  // ==========================================================

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // ==========================================================
  // VARIANT
  // ==========================================================

  const [selectedVariant, setSelectedVariant] = useState(null);

  // ==========================================================
  // IMAGE
  // ==========================================================

  const [selectedImage, setSelectedImage] = useState(null);

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const [quantity, setQuantity] = useState(1);

  // ==========================================================
  // CART
  // ==========================================================

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ==========================================================
  // IMAGE URL
  // ==========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://127.0.0.1:8000${image}`;
  };

  // ==========================================================
  // FETCH PRODUCT
  // ==========================================================

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/products/products/${id}/`
      );

      const productData = response.data;

      setProduct(productData);

      // ======================================================
      // VARIANTS
      // ======================================================

      const variants = productData?.variants || [];

      const activeVariants = variants.filter(
        (variant) =>
          variant.is_active !== false
      );

      // Prefer active variant with stock
      const availableVariant =
        activeVariants.find(
          (variant) =>
            Number(variant.stock || 0) > 0
        ) || activeVariants[0];

      if (availableVariant) {
        setSelectedVariant(
          availableVariant
        );
      } else {
        setSelectedVariant(null);
      }

      // ======================================================
      // INITIAL IMAGE
      // ======================================================

      const images =
        productData?.images || [];

      if (images.length > 0) {
        const primaryImage =
          images.find(
            (image) => image.is_primary
          ) || images[0];

        setSelectedImage(
          primaryImage.image
        );
      } else if (
        productData?.main_image
      ) {
        setSelectedImage(
          productData.main_image
        );
      } else {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error(
        "Product details error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH RELATED PRODUCTS
  // ==========================================================

  const fetchRelatedProducts =
    async () => {
      try {
        setRelatedLoading(true);

        const response =
          await api.get(
            `/products/products/${id}/related/`
          );

        const relatedData =
          Array.isArray(response.data)
            ? response.data
            : [];

        setRelatedProducts(
          relatedData
        );
      } catch (err) {
        console.error(
          "Related products error:",
          err
        );

        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

  // ==========================================================
  // LOAD PRODUCT
  // ==========================================================

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // ==========================================================
  // LOAD RELATED PRODUCTS
  // ==========================================================

  useEffect(() => {
    fetchRelatedProducts();
  }, [id]);

  // ==========================================================
  // GET COLOR-SPECIFIC IMAGES
  // ==========================================================

  const getVariantImages = (
    variant
  ) => {
    if (!product) {
      return [];
    }

    const images =
      product.images || [];

    // --------------------------------------------------------
    // If no variant is selected
    // --------------------------------------------------------

    if (!variant?.color) {
      return images.filter(
        (image) => !image.variant
      );
    }

    const selectedColor =
      String(variant.color)
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // ONLY SELECTED COLOR IMAGES
    // --------------------------------------------------------

    const colorImages =
      images.filter((image) => {
        if (!image.variant_color) {
          return false;
        }

        const imageColor =
          String(
            image.variant_color
          )
            .trim()
            .toLowerCase();

        return (
          imageColor === selectedColor
        );
      });

    return colorImages;
  };

  // ==========================================================
  // UPDATE IMAGE WHEN COLOR CHANGES
  // ==========================================================

  const updateImageForVariant = (
    variant
  ) => {
    if (!product || !variant) {
      return;
    }

    const variantImages =
      getVariantImages(variant);

    // --------------------------------------------------------
    // If selected color has images
    // --------------------------------------------------------

    if (variantImages.length > 0) {
      const primaryImage =
        variantImages.find(
          (image) => image.is_primary
        ) || variantImages[0];

      setSelectedImage(
        primaryImage.image
      );

      return;
    }

    // --------------------------------------------------------
    // No color-specific images
    // --------------------------------------------------------

    setSelectedImage(null);
  };

  // ==========================================================
  // WISHLIST STATUS
  // ==========================================================

  const fetchWishlistStatus =
    async () => {
      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      if (!accessToken) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response =
          await getWishlistStatus(id);

        setIsWishlisted(
          response?.is_wishlisted ===
            true
        );
      } catch (err) {
        console.error(
          "Wishlist status error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          setIsWishlisted(false);
        }
      }
    };

  useEffect(() => {
    fetchWishlistStatus();
  }, [id]);

  // ==========================================================
  // WISHLIST TOGGLE
  // ==========================================================

  const handleWishlistToggle =
    async () => {
      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      if (!accessToken) {
        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });

        return;
      }

      if (wishlistLoading) {
        return;
      }

      try {
        setWishlistLoading(true);

        // ----------------------------------------------------
        // REMOVE
        // ----------------------------------------------------

        if (isWishlisted) {
          await removeFromWishlist(id);

          setIsWishlisted(false);

          window.dispatchEvent(
            new Event(
              "wishlistUpdated"
            )
          );
        }

        // ----------------------------------------------------
        // ADD
        // ----------------------------------------------------

        else {
          await addToWishlist(id);

          setIsWishlisted(true);

          window.dispatchEvent(
            new Event(
              "wishlistUpdated"
            )
          );
        }
      } catch (err) {
        console.error(
          "Wishlist toggle error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );

          localStorage.removeItem(
            "user"
          );

          setIsWishlisted(false);

          window.dispatchEvent(
            new Event("authChanged")
          );

          navigate("/login", {
            state: {
              from: `/products/${id}`,
            },
          });

          return;
        }

        await fetchWishlistStatus();
      } finally {
        setWishlistLoading(false);
      }
    };

  // ==========================================================
  // SELECT VARIANT
  // ==========================================================

  const handleVariantSelect = (
    variant
  ) => {
    if (!variant) {
      return;
    }

    setSelectedVariant(variant);

    setQuantity(1);

    setCartMessage("");
    setCartError("");

    updateImageForVariant(
      variant
    );
  };

  // ==========================================================
  // SELECT COLOR
  // ==========================================================

  const handleColorSelect = (
    color
  ) => {
    if (!color) {
      return;
    }

    const variants =
      product?.variants || [];

    // --------------------------------------------------------
    // Try same size + selected color
    // --------------------------------------------------------

    let matchingVariant =
      variants.find(
        (variant) =>
          variant.color === color &&
          variant.size ===
            selectedVariant?.size &&
          variant.is_active !== false
      );

    // --------------------------------------------------------
    // Try available variant of color
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.color === color &&
            variant.is_active !== false &&
            Number(
              variant.stock || 0
            ) > 0
        );
    }

    // --------------------------------------------------------
    // Try any active variant of color
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.color === color &&
            variant.is_active !== false
        );
    }

    // --------------------------------------------------------
    // Final fallback
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.color === color
        );
    }

    if (matchingVariant) {
      handleVariantSelect(
        matchingVariant
      );
    }
  };

  // ==========================================================
  // SELECT SIZE
  // ==========================================================

  const handleSizeSelect = (
    size
  ) => {
    if (!size) {
      return;
    }

    const variants =
      product?.variants || [];

    // --------------------------------------------------------
    // Try selected color + size
    // --------------------------------------------------------

    let matchingVariant =
      variants.find(
        (variant) =>
          variant.size === size &&
          variant.color ===
            selectedVariant?.color &&
          variant.is_active !== false
      );

    // --------------------------------------------------------
    // Try available variant of size
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.size === size &&
            variant.is_active !== false &&
            Number(
              variant.stock || 0
            ) > 0
        );
    }

    // --------------------------------------------------------
    // Try any active variant
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.size === size &&
            variant.is_active !== false
        );
    }

    // --------------------------------------------------------
    // Final fallback
    // --------------------------------------------------------

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.size === size
        );
    }

    if (matchingVariant) {
      handleVariantSelect(
        matchingVariant
      );
    }
  };

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const increaseQuantity = () => {
    const stock = selectedVariant
      ? Number(
          selectedVariant.stock || 0
        )
      : Number(
          product?.total_stock || 0
        );

    if (quantity < stock) {
      setQuantity(
        (previous) =>
          previous + 1
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(
        (previous) =>
          previous - 1
      );
    }
  };

  // ==========================================================
  // BACKEND ERROR
  // ==========================================================

  const getBackendErrorMessage = (
    error
  ) => {
    const backendError =
      error.response?.data;

    if (!backendError) {
      return "Unable to add product to cart.";
    }

    if (
      typeof backendError ===
      "string"
    ) {
      return backendError;
    }

    if (
      typeof backendError.detail ===
      "string"
    ) {
      return backendError.detail;
    }

    const firstError =
      Object.values(
        backendError
      )[0];

    if (
      Array.isArray(firstError) &&
      firstError.length > 0
    ) {
      return firstError[0];
    }

    if (
      typeof firstError === "string"
    ) {
      return firstError;
    }

    return "Unable to add product to cart.";
  };

  // ==========================================================
  // AUTH REDIRECT
  // ==========================================================

  const redirectToLogin = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("authChanged")
    );

    navigate("/login", {
      state: {
        from: `/products/${id}`,
      },
    });
  };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart =
    async () => {
      setCartMessage("");
      setCartError("");

      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      if (!accessToken) {
        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });

        return;
      }

      // ------------------------------------------------------
      // VARIANT CHECK
      // ------------------------------------------------------

      if (!selectedVariant) {
        setCartError(
          "Please select a color and size."
        );

        return;
      }

      // ------------------------------------------------------
      // STOCK CHECK
      // ------------------------------------------------------

      const stock = Number(
        selectedVariant.stock || 0
      );

      if (stock <= 0) {
        setCartError(
          "This product is out of stock."
        );

        return;
      }

      if (quantity > stock) {
        setCartError(
          `Only ${stock} items are available.`
        );

        return;
      }

      // ------------------------------------------------------
      // ADD TO CART
      // ------------------------------------------------------

      try {
        setAddingToCart(true);

        const requestData = {
          product: product.id,
          variant:
            selectedVariant.id,
          quantity: quantity,
        };

        console.log(
          "Adding to cart:",
          requestData
        );

        const response =
          await api.post(
            "/cart/add/",
            requestData
          );

        console.log(
          "Cart response:",
          response.data
        );

        setCartMessage(
          "Product added to cart successfully."
        );

        window.dispatchEvent(
          new Event("cartUpdated")
        );
      } catch (err) {
        console.error(
          "Add to cart error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          redirectToLogin();
          return;
        }

        setCartError(
          getBackendErrorMessage(
            err
          )
        );
      } finally {
        setAddingToCart(false);
      }
    };

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow =
    async () => {
      setCartMessage("");
      setCartError("");

      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      if (!accessToken) {
        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });

        return;
      }

      // ------------------------------------------------------
      // VARIANT CHECK
      // ------------------------------------------------------

      if (!selectedVariant) {
        setCartError(
          "Please select a color and size."
        );

        return;
      }

      // ------------------------------------------------------
      // STOCK CHECK
      // ------------------------------------------------------

      const stock = Number(
        selectedVariant.stock || 0
      );

      if (stock <= 0) {
        setCartError(
          "This product is out of stock."
        );

        return;
      }

      if (quantity > stock) {
        setCartError(
          `Only ${stock} items are available.`
        );

        return;
      }

      // ------------------------------------------------------
      // BUY NOW
      // ------------------------------------------------------

      try {
        setAddingToCart(true);

        const requestData = {
          product: product.id,
          variant:
            selectedVariant.id,
          quantity: quantity,
        };

        console.log(
          "Buy Now:",
          requestData
        );

        await api.post(
          "/cart/add/",
          requestData
        );

        window.dispatchEvent(
          new Event("cartUpdated")
        );

        navigate("/cart");
      } catch (err) {
        console.error(
          "Buy now error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          redirectToLogin();
          return;
        }

        setCartError(
          getBackendErrorMessage(
            err
          )
        );
      } finally {
        setAddingToCart(false);
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-loading">

          <div className="product-spinner"></div>

          <p>
            Loading product...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !product) {
    return (
      <div className="product-details-page">

        <div className="product-error">

          <h2>
            Product not found
          </h2>

          <p>
            {error ||
              "This product does not exist."}
          </p>

          <Link
            to="/products"
            className="back-products-btn"
          >
            Back to Products
          </Link>

        </div>

      </div>
    );
  }

  // ==========================================================
  // PRODUCT DATA
  // ==========================================================

  const images =
    product.images || [];

  const variants =
    product.variants || [];

  // ==========================================================
  // COLORS
  // ==========================================================

  const colors = [
    ...new Set(
      variants
        .filter(
          (variant) =>
            variant.color
        )
        .map(
          (variant) =>
            variant.color
        )
    ),
  ];

  // ==========================================================
  // SIZES
  // ==========================================================

  const sizes = [
    ...new Set(
      variants
        .filter(
          (variant) =>
            variant.size
        )
        .map(
          (variant) =>
            variant.size
        )
    ),
  ];

  // ==========================================================
  // VISIBLE IMAGES
  // ==========================================================

  const visibleImages =
    getVariantImages(
      selectedVariant
    );

  // ==========================================================
  // PRICE
  // ==========================================================

  const currentPrice =
    product.final_price ??
    product.discount_price ??
    product.price;

  const originalPrice =
    Number(
      product.price || 0
    );

  const finalPrice =
    Number(
      currentPrice || 0
    );

  const discountPercentage =
    product.discount_percentage ??
    (originalPrice > finalPrice
      ? Math.round(
          ((originalPrice -
            finalPrice) /
            originalPrice) *
            100
        )
      : 0);

  // ==========================================================
  // STOCK
  // ==========================================================

  const currentStock =
    selectedVariant
      ? Number(
          selectedVariant.stock || 0
        )
      : Number(
          product.total_stock || 0
        );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="product-details-page">

      {/* ====================================================
          BREADCRUMB
      ==================================================== */}

      <div className="product-breadcrumb">

        <Link to="/">
          Home
        </Link>

        <span>/</span>

        <Link to="/products">
          Shop
        </Link>

        <span>/</span>

        <span>
          {product.name}
        </span>

      </div>

      {/* ====================================================
          PRODUCT CONTAINER
      ==================================================== */}

      <div className="product-details-container">

        {/* ==================================================
            GALLERY
        ================================================== */}

        <div className="product-gallery">

          <div className="product-thumbnails">

            {visibleImages.length >
              0 ? (
              visibleImages.map(
                (image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={`product-thumbnail ${
                      selectedImage ===
                      image.image
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedImage(
                        image.image
                      )
                    }
                  >
                    <img
                      src={getImageUrl(
                        image.image
                      )}
                      alt={
                        image.variant_color
                          ? `${product.name} ${image.variant_color}`
                          : product.name
                      }
                    />
                  </button>
                )
              )
            ) : (
              product.main_image && (
                <button
                  type="button"
                  className={`product-thumbnail ${
                    selectedImage ===
                    product.main_image
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedImage(
                      product.main_image
                    )
                  }
                >
                  <img
                    src={getImageUrl(
                      product.main_image
                    )}
                    alt={product.name}
                  />
                </button>
              )
            )}

          </div>

          {/* MAIN IMAGE */}

          <div className="product-main-image">

            {selectedImage ? (
              <img
                src={getImageUrl(
                  selectedImage
                )}
                alt={product.name}
              />
            ) : (
              <div className="no-product-image">
                No Image
              </div>
            )}

            {discountPercentage >
              0 && (
              <span className="product-discount-badge">
                {discountPercentage}% OFF
              </span>
            )}

          </div>

        </div>

        {/* ==================================================
            PRODUCT INFO
        ================================================== */}

        <div className="product-info">

          {/* BRAND */}

          {product.brand_name && (
            <p className="product-brand">
              {product.brand_name}
            </p>
          )}

          {/* TITLE */}

          <div className="product-title-row">

            <h1 className="product-title">
              {product.name}
            </h1>

            {/* WISHLIST */}

            <button
              type="button"
              className={`wishlist-button ${
                isWishlisted
                  ? "active"
                  : ""
              }`}
              onClick={
                handleWishlistToggle
              }
              disabled={
                wishlistLoading
              }
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              title={
                isWishlisted
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"
              }
            >
              {wishlistLoading
                ? "..."
                : isWishlisted
                ? "♥"
                : "♡"}
            </button>

          </div>

          {/* DESCRIPTION */}

          {product.description && (
            <p className="product-description">
              {product.description}
            </p>
          )}

          {/* PRICE */}

          <div className="product-price-section">

            <span className="product-current-price">
              ₹
              {finalPrice.toLocaleString(
                "en-IN"
              )}
            </span>

            {originalPrice >
              finalPrice && (
              <span className="product-original-price">
                ₹
                {originalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}

            {discountPercentage >
              0 && (
              <span className="product-discount-text">
                {discountPercentage}% OFF
              </span>
            )}

          </div>

          {/* ==================================================
              COLOR
          ================================================== */}

          {colors.length > 0 && (
            <div className="variant-section">

              <div className="variant-heading">

                <span>
                  Color
                </span>

                {selectedVariant?.color && (
                  <strong>
                    {
                      selectedVariant.color
                    }
                  </strong>
                )}

              </div>

              <div className="color-options">

                {colors.map(
                  (color) => {

                    const isActive =
                      selectedVariant?.color ===
                      color;

                    return (
                      <button
                        type="button"
                        key={color}
                        className={`color-option ${
                          isActive
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleColorSelect(
                            color
                          )
                        }
                      >
                        {color}
                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* ==================================================
              SIZE
          ================================================== */}

          {sizes.length > 0 && (
            <div className="variant-section">

              <div className="variant-heading">

                <span>
                  Size
                </span>

                {selectedVariant?.size && (
                  <strong>
                    {
                      selectedVariant.size
                    }
                  </strong>
                )}

              </div>

              <div className="size-options">

                {sizes.map(
                  (size) => {

                    const sizeVariant =
                      variants.find(
                        (variant) =>
                          variant.size ===
                            size &&
                          variant.color ===
                            selectedVariant?.color
                      ) ||
                      variants.find(
                        (variant) =>
                          variant.size ===
                          size
                      );

                    const sizeStock =
                      Number(
                        sizeVariant?.stock ||
                          0
                      );

                    const isActive =
                      selectedVariant?.size ===
                        size &&
                      selectedVariant?.color ===
                        sizeVariant?.color;

                    return (
                      <button
                        type="button"
                        key={size}
                        disabled={
                          sizeStock <= 0
                        }
                        className={`size-option ${
                          isActive
                            ? "active"
                            : ""
                        } ${
                          sizeStock <= 0
                            ? "disabled"
                            : ""
                        }`}
                        onClick={() =>
                          handleSizeSelect(
                            size
                          )
                        }
                      >
                        {size}
                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* STOCK */}

          <div className="product-stock">

            {currentStock > 0 ? (
              <>
                <span className="stock-dot"></span>

                <span>
                  {currentStock} available
                </span>
              </>
            ) : (
              <span className="out-of-stock">
                Out of stock
              </span>
            )}

          </div>

          {/* QUANTITY */}

          <div className="quantity-section">

            <span className="quantity-label">
              Quantity
            </span>

            <div className="quantity-control">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1 ||
                  addingToCart
                }
              >
                −
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  quantity >=
                    currentStock ||
                  currentStock <= 0 ||
                  addingToCart
                }
              >
                +
              </button>

            </div>

          </div>

          {/* SUCCESS */}

          {cartMessage && (
            <div className="cart-success-message">

              <span>
                {cartMessage}
              </span>

              <Link to="/cart">
                View Cart
              </Link>

            </div>
          )}

          {/* ERROR */}

          {cartError && (
            <div className="cart-error-message">
              {cartError}
            </div>
          )}

          {/* ACTIONS */}

          <div className="product-actions">

            <button
              type="button"
              className="add-to-cart-btn"
              onClick={
                handleAddToCart
              }
              disabled={
                addingToCart ||
                currentStock <= 0
              }
            >
              {addingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>

            <button
              type="button"
              className="buy-now-btn"
              onClick={
                handleBuyNow
              }
              disabled={
                addingToCart ||
                currentStock <= 0
              }
            >
              {addingToCart
                ? "Please wait..."
                : "Buy Now"}
            </button>

          </div>

          {/* EXTRA INFO */}

          <div className="product-extra-info">

            <div className="extra-info-item">

              <span>🚚</span>

              <div>

                <strong>
                  Free Delivery
                </strong>

                <p>
                  Free delivery on your order
                </p>

              </div>

            </div>

            <div className="extra-info-item">

              <span>↩️</span>

              <div>

                <strong>
                  Easy Returns
                </strong>

                <p>
                  Easy return and exchange
                </p>

              </div>

            </div>

            <div className="extra-info-item">

              <span>🔒</span>

              <div>

                <strong>
                  Secure Payment
                </strong>

                <p>
                  100% secure payment
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ====================================================
          CUSTOMER REVIEWS
      ==================================================== */}

      <Reviews />

      {/* ====================================================
          RELATED PRODUCTS
      ==================================================== */}

      {relatedLoading ? (
        <div className="related-products-section">

          <div className="related-products-header">
            <h2>
              Related Products
            </h2>
          </div>

          <div className="related-products-loading">
            Loading related products...
          </div>

        </div>
      ) : (
        relatedProducts.length > 0 && (
          <section className="related-products-section">

            {/* HEADER */}

            <div className="related-products-header">

              <div>
                <span className="related-products-subtitle">
                  YOU MAY ALSO LIKE
                </span>

                <h2>
                  Related Products
                </h2>
              </div>

              <Link
                to="/products"
                className="related-view-all"
              >
                View All
              </Link>

            </div>

            {/* PRODUCTS */}

            <div className="related-products-grid">

              {relatedProducts.map(
                (relatedProduct) => {

                  const relatedOriginalPrice =
                    Number(
                      relatedProduct.price ||
                        0
                    );

                  const relatedFinalPrice =
                    Number(
                      relatedProduct.final_price ??
                        relatedProduct.discount_price ??
                        relatedProduct.price ??
                        0
                    );

                  const relatedDiscount =
                    relatedProduct.discount_percentage ??
                    (relatedOriginalPrice >
                    relatedFinalPrice
                      ? Math.round(
                          ((relatedOriginalPrice -
                            relatedFinalPrice) /
                            relatedOriginalPrice) *
                            100
                        )
                      : 0);

                  return (
                    <Link
                      key={
                        relatedProduct.id
                      }
                      to={`/products/${relatedProduct.id}`}
                      className="related-product-card"
                    >

                      {/* IMAGE */}

                      <div className="related-product-image">

                        {relatedProduct.main_image ? (
                          <img
                            src={getImageUrl(
                              relatedProduct.main_image
                            )}
                            alt={
                              relatedProduct.name
                            }
                          />
                        ) : (
                          <div className="related-no-image">
                            No Image
                          </div>
                        )}

                        {relatedDiscount >
                          0 && (
                          <span className="related-discount">
                            {relatedDiscount}% OFF
                          </span>
                        )}

                        {relatedProduct.is_new_arrival && (
                          <span className="related-new-badge">
                            NEW
                          </span>
                        )}

                      </div>

                      {/* INFO */}

                      <div className="related-product-info">

                        {relatedProduct.brand_name && (
                          <span className="related-product-brand">
                            {
                              relatedProduct.brand_name
                            }
                          </span>
                        )}

                        <h3>
                          {
                            relatedProduct.name
                          }
                        </h3>

                        <div className="related-product-price">

                          <span className="related-current-price">
                            ₹
                            {relatedFinalPrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {relatedOriginalPrice >
                            relatedFinalPrice && (
                            <span className="related-original-price">
                              ₹
                              {relatedOriginalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          </section>
        )
      )}

    </div>
  );
}

export default ProductDetails;