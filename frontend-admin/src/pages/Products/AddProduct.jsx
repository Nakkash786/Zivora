import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();

  // ==========================================================
  // BASIC DATA
  // ==========================================================

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // PRODUCT FORM
  // ==========================================================

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    gender: "MEN",
    description: "",
    price: "",
    discount_price: "",

    is_active: true,

    is_featured: false,
    is_new_arrival: false,
  });

  // ==========================================================
  // MAIN IMAGE
  // ==========================================================

  const [mainImage, setMainImage] = useState(null);

  // ==========================================================
  // GALLERY IMAGES
  // ==========================================================

  /*
   * Each gallery image:
   *
   * {
   *   file,
   *   preview,
   *   image_type,
   *   is_primary,
   *   display_order,
   *   color
   * }
   *
   * IMPORTANT:
   *
   * Gallery images are connected to COLOR,
   * NOT to individual size variants.
   *
   * Example:
   *
   * Black - S
   * Black - M
   * Black - L
   * Black - XL
   *
   * All can use:
   *
   * black-front.jpg -> color = Black
   */

  const [galleryImages, setGalleryImages] = useState([]);

  // ==========================================================
  // VARIANTS
  // ==========================================================

  const [variants, setVariants] = useState([
    {
      color: "",
      size: "",
      sku: "",
      stock: 0,
      is_active: true,
    },
  ]);

  // ==========================================================
  // FETCH BRANDS + CATEGORIES
  // ==========================================================

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [
        brandsResponse,
        categoriesResponse,
      ] = await Promise.all([
        api.get("/products/brands/"),
        api.get("/products/categories/"),
      ]);

      setBrands(
        brandsResponse.data.results ||
          brandsResponse.data ||
          []
      );

      setCategories(
        categoriesResponse.data.results ||
          categoriesResponse.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load brands/categories:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load brands and categories."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // ==========================================================
  // FORM INPUT
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================================
  // MAIN IMAGE
  // ==========================================================

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setMainImage(null);
      return;
    }

    setMainImage(file);
  };

  // ==========================================================
  // GALLERY IMAGE
  // ==========================================================

  const handleGalleryImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const newImages = files.map(
      (file, index) => ({
        file,

        preview:
          URL.createObjectURL(file),

        image_type: "OTHER",

        is_primary: false,

        display_order:
          galleryImages.length +
          index,

        /*
         * COLOR ONLY
         *
         * Empty means no color selected.
         */
        color: "",
      })
    );

    setGalleryImages((previous) => [
      ...previous,
      ...newImages,
    ]);

    /*
     * Allow selecting the same file again.
     */
    e.target.value = "";
  };

  // ==========================================================
  // UPDATE GALLERY IMAGE
  // ==========================================================

  const updateGalleryImage = (
    index,
    field,
    value
  ) => {
    setGalleryImages((previous) =>
      previous.map(
        (image, imageIndex) =>
          imageIndex === index
            ? {
                ...image,
                [field]: value,
              }
            : image
      )
    );
  };

  // ==========================================================
  // SET PRIMARY GALLERY IMAGE
  // ==========================================================

  const handlePrimaryImage = (
    index
  ) => {
    setGalleryImages((previous) =>
      previous.map(
        (image, imageIndex) => ({
          ...image,
          is_primary:
            imageIndex === index,
        })
      )
    );
  };

  // ==========================================================
  // REMOVE GALLERY IMAGE
  // ==========================================================

  const removeGalleryImage = (
    index
  ) => {
    setGalleryImages((previous) => {
      const imageToRemove =
        previous[index];

      /*
       * Release preview URL.
       */
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      return previous
        .filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
        .map(
          (
            image,
            imageIndex
          ) => ({
            ...image,
            display_order:
              imageIndex,
          })
        );
    });
  };

  // ==========================================================
  // VARIANT CHANGE
  // ==========================================================

  const handleVariantChange = (
    index,
    field,
    value
  ) => {
    setVariants((previous) =>
      previous.map(
        (
          variant,
          variantIndex
        ) =>
          variantIndex === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      )
    );
  };

  // ==========================================================
  // ADD VARIANT
  // ==========================================================

  const addVariant = () => {
    setVariants((previous) => [
      ...previous,
      {
        color: "",
        size: "",
        sku: "",
        stock: 0,
        is_active: true,
      },
    ]);
  };

  // ==========================================================
  // REMOVE VARIANT
  // ==========================================================

  const removeVariant = (
    index
  ) => {
    setVariants((previous) =>
      previous.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  };

  // ==========================================================
  // UNIQUE COLORS
  // ==========================================================

  /*
   * Get unique colors from variants.
   *
   * Example:
   *
   * Black
   * Black
   * Black
   * White
   * White
   *
   * Result:
   *
   * Black
   * White
   */

  const uniqueColors = [
    ...new Map(
      variants
        .map((variant) => ({
          original:
            variant.color.trim(),
          normalized:
            variant.color
              .trim()
              .toLowerCase(),
        }))
        .filter(
          (item) =>
            item.original
        )
        .map((item) => [
          item.normalized,
          item.original,
        ])
    ).values(),
  ];

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    // --------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------

    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.brand) {
      return "Please select a brand.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (!formData.gender) {
      return "Please select gender.";
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      return "Please enter a valid price.";
    }

    if (
      formData.discount_price &&
      Number(
        formData.discount_price
      ) >= Number(formData.price)
    ) {
      return "Discount price must be lower than the original price.";
    }

    // --------------------------------------------------------
    // VARIANTS
    // --------------------------------------------------------

    if (variants.length === 0) {
      return "Please add at least one product variant.";
    }

    for (
      let i = 0;
      i < variants.length;
      i++
    ) {
      const variant =
        variants[i];

      if (!variant.color.trim()) {
        return `Color is required for variant ${
          i + 1
        }.`;
      }

      if (!variant.size.trim()) {
        return `Size is required for variant ${
          i + 1
        }.`;
      }

      if (!variant.sku.trim()) {
        return `SKU is required for variant ${
          i + 1
        }.`;
      }

      if (
        variant.stock === "" ||
        Number(variant.stock) < 0
      ) {
        return `Stock cannot be negative for variant ${
          i + 1
        }.`;
      }
    }

    // --------------------------------------------------------
    // GALLERY
    // --------------------------------------------------------

    /*
     * Every gallery image must have a valid
     * color selected.
     */

    for (
      let i = 0;
      i < galleryImages.length;
      i++
    ) {
      const galleryImage =
        galleryImages[i];

      if (
        !galleryImage.color.trim()
      ) {
        return `Please select a color for gallery image ${
          i + 1
        }.`;
      }

      const colorExists =
        variants.some(
          (variant) =>
            variant.color
              .trim()
              .toLowerCase() ===
            galleryImage.color
              .trim()
              .toLowerCase()
        );

      if (!colorExists) {
        return `Invalid color selected for gallery image ${
          i + 1
        }.`;
      }
    }

    return "";
  };

  // ==========================================================
  // CREATE PRODUCT
  // ==========================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSubmitting(true);

      // ======================================================
      // STEP 1
      // CREATE PRODUCT
      // ======================================================

      const productFormData =
        new FormData();

      productFormData.append(
        "name",
        formData.name.trim()
      );

      productFormData.append(
        "brand",
        formData.brand
      );

      productFormData.append(
        "category",
        formData.category
      );

      productFormData.append(
        "gender",
        formData.gender
      );

      productFormData.append(
        "description",
        formData.description.trim()
      );

      productFormData.append(
        "price",
        formData.price
      );

      if (
        formData.discount_price
      ) {
        productFormData.append(
          "discount_price",
          formData.discount_price
        );
      }

      productFormData.append(
        "is_active",
        formData.is_active
          ? "true"
          : "false"
      );

      // Featured Product

      productFormData.append(
        "is_featured",
        formData.is_featured
          ? "true"
          : "false"
      );

      // New Arrival

      productFormData.append(
        "is_new_arrival",
        formData.is_new_arrival
          ? "true"
          : "false"
      );

      // Main image

      if (mainImage) {
        productFormData.append(
          "main_image",
          mainImage
        );
      }

      const productResponse =
        await api.post(
          "/products/products/",
          productFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const createdProduct =
        productResponse.data;

      const productId =
        createdProduct.id;

      if (!productId) {
        throw new Error(
          "Product was created but ID was not returned."
        );
      }

      // ======================================================
      // STEP 2
      // CREATE VARIANTS
      // ======================================================

      /*
       * Variants still contain:
       *
       * Color + Size + SKU + Stock
       *
       * Images are NOT connected to variants.
       */

      for (
        const variant of variants
      ) {
        await api.post(
          "/products/variants/",
          {
            product: productId,

            color:
              variant.color.trim(),

            size:
              variant.size.trim(),

            sku:
              variant.sku.trim(),

            stock:
              Number(
                variant.stock
              ),

            is_active:
              variant.is_active,
          }
        );
      }

      // ======================================================
      // STEP 3
      // CREATE COLOR-BASED GALLERY IMAGES
      // ======================================================

      /*
       * Gallery images are now connected
       * directly to COLOR.
       *
       * NO variant ID is sent.
       *
       * Example:
       *
       * {
       *   product: 10,
       *   color: "Black",
       *   image: black-front.jpg
       * }
       */

      for (
        const galleryImage of galleryImages
      ) {
        const imageFormData =
          new FormData();

        // Product

        imageFormData.append(
          "product",
          String(productId)
        );

        // Color

        imageFormData.append(
          "color",
          galleryImage.color.trim()
        );

        // Image

        imageFormData.append(
          "image",
          galleryImage.file
        );

        // Image type

        imageFormData.append(
          "image_type",
          galleryImage.image_type
        );

        // Primary

        imageFormData.append(
          "is_primary",
          galleryImage.is_primary
            ? "true"
            : "false"
        );

        // Display order

        imageFormData.append(
          "display_order",
          String(
            galleryImage.display_order
          )
        );

        await api.post(
          "/products/images/",
          imageFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        "Product created successfully."
      );

      // ======================================================
      // CLEAN PREVIEW URLS
      // ======================================================

      galleryImages.forEach(
        (image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        }
      );

      // ======================================================
      // REDIRECT
      // ======================================================

      setTimeout(() => {
        navigate(
          "/admin/products"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Product creation error:",
        err
      );

      let errorMessage =
        "Failed to create product.";

      if (err.response?.data) {
        const data =
          err.response.data;

        if (
          typeof data === "string"
        ) {
          errorMessage = data;
        } else if (
          data.detail
        ) {
          errorMessage =
            data.detail;
        } else {
          const firstError =
            Object.values(data)
              .flat()
              ?.[0];

          if (firstError) {
            errorMessage =
              firstError;
          }
        }
      } else if (err.message) {
        errorMessage =
          err.message;
      }

      setError(
        errorMessage
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingData) {
    return (
      <div className="add-product-page">

        <div className="add-product-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading product form...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="add-product-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="add-product-header">

        <div>

          <h1>
            Add Product
          </h1>

          <p>
            Create a new product for your store.
          </p>

        </div>

        <Link
          to="/admin/products"
          className="back-products-button"
        >
          ← Back to Products
        </Link>

      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="form-alert form-alert-error">

          <span>
            ⚠
          </span>

          <p>
            {error}
          </p>

        </div>
      )}

      {success && (
        <div className="form-alert form-alert-success">

          <span>
            ✓
          </span>

          <p>
            {success}
          </p>

        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        className="add-product-form"
        onSubmit={handleSubmit}
      >

        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading">

            <div>

              <h2>
                Basic Information
              </h2>

              <p>
                Enter the main details of your product.
              </p>

            </div>

          </div>

          <div className="form-grid">

            {/* Product Name */}

            <div className="form-group full-width">

              <label htmlFor="name">
                Product Name{" "}
                <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product name"
              />

            </div>

            {/* Brand */}

            <div className="form-group">

              <label htmlFor="brand">
                Brand{" "}
                <span>*</span>
              </label>

              <select
                id="brand"
                name="brand"
                value={
                  formData.brand
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Brand
                </option>

                {brands.map(
                  (brand) => (

                    <option
                      key={
                        brand.id
                      }
                      value={
                        brand.id
                      }
                    >
                      {
                        brand.name
                      }
                    </option>

                  )
                )}

              </select>

            </div>

            {/* Category */}

            <div className="form-group">

              <label htmlFor="category">
                Category{" "}
                <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (

                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>

                  )
                )}

              </select>

            </div>

            {/* Gender */}

            <div className="form-group">

              <label htmlFor="gender">
                Gender{" "}
                <span>*</span>
              </label>

              <select
                id="gender"
                name="gender"
                value={
                  formData.gender
                }
                onChange={
                  handleChange
                }
              >

                <option value="MEN">
                  Men
                </option>

                <option value="WOMEN">
                  Women
                </option>

                <option value="UNISEX">
                  Unisex
                </option>

                <option value="KIDS">
                  Kids
                </option>

              </select>

            </div>

            {/* Description */}

            <div className="form-group full-width">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product description"
                rows="6"
              />

            </div>

          </div>

        </section>

        {/* ====================================================
            PRICING
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading">

            <div>

              <h2>
                Pricing
              </h2>

              <p>
                Set the original and discounted price.
              </p>

            </div>

          </div>

          <div className="pricing-grid">

            {/* Original Price */}

            <div className="form-group">

              <label htmlFor="price">
                Original Price{" "}
                <span>*</span>
              </label>

              <div className="price-input">

                <span>
                  ₹
                </span>

                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0.00"
                />

              </div>

            </div>

            {/* Discount Price */}

            <div className="form-group">

              <label htmlFor="discount_price">
                Discount Price
              </label>

              <div className="price-input">

                <span>
                  ₹
                </span>

                <input
                  id="discount_price"
                  type="number"
                  name="discount_price"
                  min="0"
                  step="0.01"
                  value={
                    formData.discount_price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0.00"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            MAIN IMAGE
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading">

            <div>

              <h2>
                Product Image
              </h2>

              <p>
                Upload the main image displayed on product cards.
              </p>

            </div>

          </div>

          <div className="main-image-upload">

            <label
              htmlFor="main-image"
              className="upload-box"
            >

              {mainImage ? (

                <div className="selected-file">

                  <div className="file-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      {
                        mainImage.name
                      }
                    </strong>

                    <span>
                      {(
                        mainImage.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </span>

                  </div>

                </div>

              ) : (

                <>

                  <div className="upload-icon">
                    ↑
                  </div>

                  <strong>
                    Click to upload main image
                  </strong>

                  <span>
                    PNG, JPG or WEBP
                  </span>

                </>

              )}

            </label>

            <input
              id="main-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={
                handleMainImageChange
              }
              hidden
            />

          </div>

        </section>

        {/* ====================================================
            GALLERY
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading gallery-heading">

            <div>

              <h2>
                Gallery Images
              </h2>

              <p>
                Add front, back, side, model and detail images.
                Images are assigned by color, not by size.
              </p>

            </div>

            <label
              htmlFor="gallery-images"
              className="add-image-button"
            >
              + Add Images
            </label>

            <input
              id="gallery-images"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={
                handleGalleryImageChange
              }
              hidden
            />

          </div>

          {galleryImages.length ===
          0 ? (

            <div className="empty-gallery">

              <span>
                🖼
              </span>

              <p>
                No gallery images added yet.
              </p>

            </div>

          ) : (

            <div className="gallery-list">

              {galleryImages.map(
                (
                  galleryImage,
                  index
                ) => (

                  <div
                    className="gallery-card"
                    key={`${galleryImage.file.name}-${index}`}
                  >

                    {/* --------------------------------------
                        IMAGE PREVIEW
                    -------------------------------------- */}

                    <div className="gallery-preview">

                      <img
                        src={
                          galleryImage.preview
                        }
                        alt={`Gallery ${
                          index + 1
                        }`}
                      />

                    </div>

                    <div className="gallery-info">

                      <strong>
                        {
                          galleryImage
                            .file
                            .name
                        }
                      </strong>

                      <div className="gallery-controls">

                        {/* IMAGE TYPE */}

                        <div className="form-group">

                          <label>
                            Image Type
                          </label>

                          <select
                            value={
                              galleryImage.image_type
                            }
                            onChange={(
                              e
                            ) =>
                              updateGalleryImage(
                                index,
                                "image_type",
                                e.target.value
                              )
                            }
                          >

                            <option value="FRONT">
                              Front
                            </option>

                            <option value="BACK">
                              Back
                            </option>

                            <option value="SIDE">
                              Side
                            </option>

                            <option value="MODEL">
                              Model
                            </option>

                            <option value="DETAIL">
                              Detail
                            </option>

                            <option value="OTHER">
                              Other
                            </option>

                          </select>

                        </div>

                        {/* --------------------------------
                            COLOR
                        -------------------------------- */}

                        <div className="form-group">

                          <label>
                            Product Color
                          </label>

                          <select
                            value={
                              galleryImage.color
                            }
                            onChange={(
                              e
                            ) =>
                              updateGalleryImage(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                          >

                            <option value="">
                              Select Color
                            </option>

                            {uniqueColors.map(
                              (
                                color
                              ) => (

                                <option
                                  key={
                                    color
                                  }
                                  value={
                                    color
                                  }
                                >
                                  {
                                    color
                                  }
                                </option>

                              )
                            )}

                          </select>

                          <small>
                            This image will be used for
                            all sizes of this color.
                          </small>

                        </div>

                        {/* --------------------------------
                            PRIMARY IMAGE
                        -------------------------------- */}

                        <label className="primary-checkbox">

                          <input
                            type="checkbox"
                            checked={
                              galleryImage.is_primary
                            }
                            onChange={() =>
                              handlePrimaryImage(
                                index
                              )
                            }
                          />

                          <span>
                            Primary Image
                          </span>

                        </label>

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ====================================================
            VARIANTS
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading variant-heading">

            <div>

              <h2>
                Product Variants
              </h2>

              <p>
                Add different colors, sizes, SKU and stock.
              </p>

            </div>

            <button
              type="button"
              className="add-variant-button"
              onClick={
                addVariant
              }
            >
              + Add Variant
            </button>

          </div>

          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="variant-table-wrapper">

            <table className="variant-table">

              <thead>

                <tr>

                  <th>
                    Color
                  </th>

                  <th>
                    Size
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Active
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {variants.map(
                  (
                    variant,
                    index
                  ) => (

                    <tr
                      key={index}
                    >

                      {/* COLOR */}

                      <td>

                        <input
                          type="text"
                          value={
                            variant.color
                          }
                          onChange={(
                            e
                          ) =>
                            handleVariantChange(
                              index,
                              "color",
                              e.target.value
                            )
                          }
                          placeholder="Black"
                        />

                      </td>

                      {/* SIZE */}

                      <td>

                        <input
                          type="text"
                          value={
                            variant.size
                          }
                          onChange={(
                            e
                          ) =>
                            handleVariantChange(
                              index,
                              "size",
                              e.target.value
                            )
                          }
                          placeholder="M"
                        />

                      </td>

                      {/* SKU */}

                      <td>

                        <input
                          type="text"
                          value={
                            variant.sku
                          }
                          onChange={(
                            e
                          ) =>
                            handleVariantChange(
                              index,
                              "sku",
                              e.target.value
                            )
                          }
                          placeholder="SKU001"
                        />

                      </td>

                      {/* STOCK */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          value={
                            variant.stock
                          }
                          onChange={(
                            e
                          ) =>
                            handleVariantChange(
                              index,
                              "stock",
                              e.target.value
                            )
                          }
                        />

                      </td>

                      {/* ACTIVE */}

                      <td>

                        <input
                          type="checkbox"
                          checked={
                            variant.is_active
                          }
                          onChange={(
                            e
                          ) =>
                            handleVariantChange(
                              index,
                              "is_active",
                              e.target.checked
                            )
                          }
                        />

                      </td>

                      {/* DELETE */}

                      <td>

                        {variants.length >
                          1 && (

                          <button
                            type="button"
                            className="delete-variant-button"
                            onClick={() =>
                              removeVariant(
                                index
                              )
                            }
                          >
                            Delete
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              MOBILE CARDS
          ================================================== */}

          <div className="variant-mobile-list">

            {variants.map(
              (
                variant,
                index
              ) => (

                <div
                  className="variant-mobile-card"
                  key={index}
                >

                  <div className="variant-card-header">

                    <h3>
                      Variant{" "}
                      {index + 1}
                    </h3>

                    {variants.length >
                      1 && (

                      <button
                        type="button"
                        className="delete-variant-button"
                        onClick={() =>
                          removeVariant(
                            index
                          )
                        }
                      >
                        Delete
                      </button>

                    )}

                  </div>

                  <div className="variant-mobile-grid">

                    {/* COLOR */}

                    <div className="form-group">

                      <label>
                        Color
                      </label>

                      <input
                        type="text"
                        value={
                          variant.color
                        }
                        onChange={(
                          e
                        ) =>
                          handleVariantChange(
                            index,
                            "color",
                            e.target.value
                          )
                        }
                        placeholder="Black"
                      />

                    </div>

                    {/* SIZE */}

                    <div className="form-group">

                      <label>
                        Size
                      </label>

                      <input
                        type="text"
                        value={
                          variant.size
                        }
                        onChange={(
                          e
                        ) =>
                          handleVariantChange(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        placeholder="M"
                      />

                    </div>

                    {/* SKU */}

                    <div className="form-group">

                      <label>
                        SKU
                      </label>

                      <input
                        type="text"
                        value={
                          variant.sku
                        }
                        onChange={(
                          e
                        ) =>
                          handleVariantChange(
                            index,
                            "sku",
                            e.target.value
                          )
                        }
                        placeholder="SKU001"
                      />

                    </div>

                    {/* STOCK */}

                    <div className="form-group">

                      <label>
                        Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          variant.stock
                        }
                        onChange={(
                          e
                        ) =>
                          handleVariantChange(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                  {/* ACTIVE */}

                  <label className="variant-active-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        variant.is_active
                      }
                      onChange={(
                        e
                      ) =>
                        handleVariantChange(
                          index,
                          "is_active",
                          e.target.checked
                        )
                      }
                    />

                    <span>
                      Variant Active
                    </span>

                  </label>

                </div>

              )
            )}

          </div>

        </section>

        {/* ====================================================
            STORE PLACEMENT
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading">

            <div>

              <h2>
                Store Placement
              </h2>

              <p>
                Choose where this product should appear on the
                customer website.
              </p>

            </div>

          </div>

          <div className="placement-grid">

            {/* FEATURED */}

            <label
              className={`placement-card ${
                formData.is_featured
                  ? "placement-card-active"
                  : ""
              }`}
            >

              <input
                type="checkbox"
                name="is_featured"
                checked={
                  formData.is_featured
                }
                onChange={
                  handleChange
                }
              />

              <div className="placement-card-content">

                <div className="placement-icon">
                  ★
                </div>

                <div>

                  <h3>
                    Featured Product
                  </h3>

                  <p>
                    Show this product in the Featured Products
                    section on the home page.
                  </p>

                </div>

              </div>

              <span className="placement-check">

                {formData.is_featured
                  ? "✓"
                  : ""}

              </span>

            </label>

            {/* NEW ARRIVAL */}

            <label
              className={`placement-card ${
                formData.is_new_arrival
                  ? "placement-card-active"
                  : ""
              }`}
            >

              <input
                type="checkbox"
                name="is_new_arrival"
                checked={
                  formData.is_new_arrival
                }
                onChange={
                  handleChange
                }
              />

              <div className="placement-card-content">

                <div className="placement-icon">
                  ✨
                </div>

                <div>

                  <h3>
                    New Arrival
                  </h3>

                  <p>
                    Show this product in the New Arrivals
                    section on the home page.
                  </p>

                </div>

              </div>

              <span className="placement-check">

                {formData.is_new_arrival
                  ? "✓"
                  : ""}

              </span>

            </label>

          </div>

        </section>

        {/* ====================================================
            PRODUCT STATUS
        ==================================================== */}

        <section className="form-section">

          <div className="section-heading">

            <div>

              <h2>
                Product Status
              </h2>

              <p>
                Control whether customers can see this product.
              </p>

            </div>

          </div>

          <label
            className={`status-card ${
              formData.is_active
                ? "status-active"
                : "status-inactive"
            }`}
          >

            <input
              type="checkbox"
              name="is_active"
              checked={
                formData.is_active
              }
              onChange={
                handleChange
              }
            />

            <div>

              <strong>

                {formData.is_active
                  ? "Product is Active"
                  : "Product is Inactive"}

              </strong>

              <p>

                {formData.is_active
                  ? "Customers can view this product."
                  : "This product will not be shown to customers."}

              </p>

            </div>

            <span className="status-toggle">

              {formData.is_active
                ? "ON"
                : "OFF"}

            </span>

          </label>

        </section>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="form-actions">

          <Link
            to="/admin/products"
            className="cancel-button"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="submit-product-button"
            disabled={submitting}
          >

            {submitting ? (

              <>

                <span className="button-spinner"></span>

                Creating Product...

              </>

            ) : (

              "Create Product"

            )}

          </button>

        </div>

      </form>

    </div>
  );
}

export default AddProduct;