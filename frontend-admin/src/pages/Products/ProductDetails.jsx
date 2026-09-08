import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import "./ProductDetails.css";


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const mainImageInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [product, setProduct] = useState(null);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [variantSaving, setVariantSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(false);

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  const [newGalleryImages, setNewGalleryImages] = useState([]);

  const [settingMainId, setSettingMainId] = useState(null);

  const [variantForm, setVariantForm] = useState({
    color: "",
    size: "",
    sku: "",
    stock: 0,
    is_active: true,
  });

  const [editingVariantId, setEditingVariantId] = useState(null);


  /* =========================================================
     PRODUCT FORM
  ========================================================= */

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    gender: "MEN",
    description: "",
    price: "",
    discount_price: "",
    is_featured: false,
    is_new_arrival: false,
    is_active: true,
  });


  /* =========================================================
     FETCH PRODUCT
  ========================================================= */

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/products/products/${id}/`
      );

      const data = response.data;

      setProduct(data);

      setForm({
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "",
        gender: data.gender || "MEN",
        description: data.description || "",
        price: data.price || "",
        discount_price: data.discount_price || "",
        is_featured: data.is_featured ?? false,
        is_new_arrival: data.is_new_arrival ?? false,
        is_active: data.is_active ?? true,
      });
    } catch (err) {
      console.error(
        "Product details error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     FETCH BRANDS + CATEGORIES
  ========================================================= */

  const fetchOptions = async () => {
    try {
      const [
        brandsResponse,
        categoriesResponse,
      ] = await Promise.all([
        api.get("/products/brands/"),
        api.get("/products/categories/"),
      ]);

      const brandsData = brandsResponse.data;
      const categoriesData = categoriesResponse.data;

      setBrands(
        Array.isArray(brandsData)
          ? brandsData
          : brandsData.results || []
      );

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.results || []
      );
    } catch (err) {
      console.error(
        "Options fetch error:",
        err
      );
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchProduct();
    fetchOptions();
  }, [id]);


  /* =========================================================
     IMAGE URL
  ========================================================= */

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


  /* =========================================================
     UNIQUE PRODUCT COLORS
     
     Example:
     Black - S
     Black - M
     Black - L
     White - S
     White - M

     Dropdown becomes:
     Black
     White
  ========================================================= */

  const uniqueColors = [
    ...new Set(
      (product?.variants || [])
        .map((variant) =>
          variant.color?.trim()
        )
        .filter(Boolean)
    ),
  ];


  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  /* =========================================================
     MAIN IMAGE SELECT
  ========================================================= */

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setMainImage(file);

    setMainImagePreview(
      URL.createObjectURL(file)
    );
  };


  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!form.brand) {
      setError(
        "Please select a brand."
      );
      return;
    }

    if (!form.category) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError(
        "Enter a valid product price."
      );
      return;
    }

    if (
      form.discount_price &&
      Number(form.discount_price) >=
        Number(form.price)
    ) {
      setError(
        "Discount price must be lower than the original price."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "brand",
        form.brand
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "gender",
        form.gender
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "discount_price",
        form.discount_price || ""
      );

      formData.append(
        "is_featured",
        form.is_featured
      );

      formData.append(
        "is_new_arrival",
        form.is_new_arrival
      );

      formData.append(
        "is_active",
        form.is_active
      );

      if (mainImage) {
        formData.append(
          "main_image",
          mainImage
        );
      }

      await api.patch(
        `/products/products/${id}/`,
        formData
      );

      setSuccess(
        "Product updated successfully."
      );

      setEditing(false);

      if (mainImagePreview) {
        URL.revokeObjectURL(
          mainImagePreview
        );
      }

      setMainImage(null);
      setMainImagePreview("");

      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = "";
      }

      await fetchProduct();
    } catch (err) {
      console.error(
        "Product update error:",
        err
      );

      const data = err.response?.data;

      setError(
        data?.detail ||
          data?.name?.[0] ||
          data?.brand?.[0] ||
          data?.category?.[0] ||
          data?.price?.[0] ||
          data?.discount_price?.[0] ||
          data?.is_featured?.[0] ||
          data?.is_new_arrival?.[0] ||
          "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDeleteProduct = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/products/${id}/`
      );

      navigate("/products");
    } catch (err) {
      console.error(
        "Product delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };


  /* =========================================================
     GALLERY IMAGE SELECT
     
     IMPORTANT:
     Image is now assigned to COLOR,
     NOT to a specific SIZE variant.
  ========================================================= */

  const handleGalleryImages = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const imageObjects = files.map(
      (file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        preview:
          URL.createObjectURL(file),
        image_type: "OTHER",

        /*
         * COLOR ONLY
         *
         * Example:
         * Black image -> color = "Black"
         *
         * It will automatically apply
         * to Black S, M, L, XL variants
         * on the user side.
         */
        color: "",
      })
    );

    setNewGalleryImages((prev) => [
      ...prev,
      ...imageObjects,
    ]);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };


  /* =========================================================
     NEW GALLERY IMAGE TYPE
  ========================================================= */

  const handleNewImageTypeChange = (
    imageId,
    value
  ) => {
    setNewGalleryImages((prev) =>
      prev.map((image) =>
        image.id === imageId
          ? {
              ...image,
              image_type: value,
            }
          : image
      )
    );
  };


  /* =========================================================
     NEW GALLERY IMAGE COLOR
  ========================================================= */

  const handleNewImageColorChange = (
    imageId,
    value
  ) => {
    setNewGalleryImages((prev) =>
      prev.map((image) =>
        image.id === imageId
          ? {
              ...image,
              color: value,
            }
          : image
      )
    );
  };


  /* =========================================================
     REMOVE NEW GALLERY IMAGE
  ========================================================= */

  const removeNewGalleryImage = (
    imageId
  ) => {
    setNewGalleryImages((prev) => {
      const image = prev.find(
        (item) => item.id === imageId
      );

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return prev.filter(
        (item) =>
          item.id !== imageId
      );
    });
  };


  /* =========================================================
     UPLOAD GALLERY IMAGES
     
     NEW BEHAVIOUR:
     ----------------
     Product Variant ❌
     Product Color   ✅

     Example:
     Black S
     Black M
     Black L
     Black XL

     Only ONE Black image assignment is needed.
  ========================================================= */

  const handleSaveGallery = async () => {
    if (
      newGalleryImages.length === 0
    ) {
      setError(
        "Please select at least one image."
      );
      return;
    }


    /* ---------------------------------------------------------
       CHECK COLOR
       
       Every gallery image must have a color.
       --------------------------------------------------------- */

    const missingColor =
      newGalleryImages.some(
        (image) =>
          !image.color?.trim()
      );

    if (missingColor) {
      setError(
        "Please select a product color for every gallery image."
      );
      return;
    }


    try {
      setError("");
      setSuccess("");
      setImageSaving(true);


      for (
        let index = 0;
        index < newGalleryImages.length;
        index++
      ) {
        const item =
          newGalleryImages[index];

        const formData =
          new FormData();


        /* ---------------------------------------------
           PRODUCT
        --------------------------------------------- */

        formData.append(
          "product",
          id
        );


        /* ---------------------------------------------
           IMAGE FILE
        --------------------------------------------- */

        formData.append(
          "image",
          item.file
        );


        /* ---------------------------------------------
           IMAGE TYPE
        --------------------------------------------- */

        formData.append(
          "image_type",
          item.image_type
        );


        /* ---------------------------------------------
           COLOR
           
           IMPORTANT:
           We send COLOR.
           
           We DO NOT send variant.
           --------------------------------------------- */

        formData.append(
          "color",
          item.color.trim()
        );


        /* ---------------------------------------------
           PRIMARY
        --------------------------------------------- */

        formData.append(
          "is_primary",
          false
        );


        /* ---------------------------------------------
           DISPLAY ORDER
        --------------------------------------------- */

        formData.append(
          "display_order",
          String(
            (product.images?.length || 0) +
              index
          )
        );


        /* ---------------------------------------------
           API REQUEST
        --------------------------------------------- */

        await api.post(
          "/products/images/",
          formData
        );
      }


      /* -----------------------------------------------
         CLEAN PREVIEWS
      ----------------------------------------------- */

      newGalleryImages.forEach(
        (image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        }
      );

      setNewGalleryImages([]);

      setSuccess(
        "Color-specific gallery images added successfully."
      );

      await fetchProduct();
    } catch (err) {
      console.error(
        "Gallery upload error:",
        err
      );

      const responseData =
        err.response?.data;

      setError(
        responseData?.detail ||
          responseData?.color?.[0] ||
          responseData?.variant?.[0] ||
          responseData?.image?.[0] ||
          responseData?.image_type?.[0] ||
          "Unable to upload gallery images."
      );
    } finally {
      setImageSaving(false);
    }
  };


  /* =========================================================
     DELETE GALLERY IMAGE
  ========================================================= */

  const handleDeleteImage = async (
    image
  ) => {
    const confirmed = window.confirm(
      "Delete this product image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/images/${image.id}/`
      );

      setSuccess(
        "Product image deleted."
      );

      await fetchProduct();
    } catch (err) {
      console.error(
        "Image delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete image."
      );
    }
  };


  /* =========================================================
     SET GALLERY IMAGE AS MAIN
  ========================================================= */

  const handleSetMainImage = async (
    image
  ) => {
    const confirmed = window.confirm(
      "Set this gallery image as the main product image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      setSettingMainId(image.id);

      await api.post(
        `/products/images/${image.id}/set-main/`
      );

      setSuccess(
        "Main product image updated successfully."
      );

      await fetchProduct();
    } catch (err) {
      console.error(
        "Set main image error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to set this image as the main image."
      );
    } finally {
      setSettingMainId(null);
    }
  };


  /* =========================================================
     VARIANT CHANGE
     
     Variant still contains:
     Color + Size + SKU + Stock
     
     Images are NOT connected to individual sizes.
  ========================================================= */

  const handleVariantChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setVariantForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  /* =========================================================
     RESET VARIANT FORM
  ========================================================= */

  const resetVariantForm = () => {
    setVariantForm({
      color: "",
      size: "",
      sku: "",
      stock: 0,
      is_active: true,
    });

    setEditingVariantId(null);
  };


  /* =========================================================
     EDIT VARIANT
  ========================================================= */

  const handleEditVariant = (
    variant
  ) => {
    setEditingVariantId(
      variant.id
    );

    setVariantForm({
      color: variant.color || "",
      size: variant.size || "",
      sku: variant.sku || "",
      stock: variant.stock ?? 0,
      is_active:
        variant.is_active ?? true,
    });

    window.scrollTo({
      top:
        document.body.scrollHeight,
      behavior: "smooth",
    });
  };


  /* =========================================================
     SAVE VARIANT
  ========================================================= */

  const handleSaveVariant = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!variantForm.color.trim()) {
      setError(
        "Variant color is required."
      );
      return;
    }

    if (!variantForm.size.trim()) {
      setError(
        "Variant size is required."
      );
      return;
    }

    if (!variantForm.sku.trim()) {
      setError(
        "Variant SKU is required."
      );
      return;
    }

    if (
      variantForm.stock === "" ||
      Number(variantForm.stock) < 0
    ) {
      setError(
        "Enter a valid stock value."
      );
      return;
    }

    try {
      setVariantSaving(true);

      const data = {
        product: Number(id),

        color:
          variantForm.color.trim(),

        size:
          variantForm.size.trim(),

        sku:
          variantForm.sku.trim(),

        stock: Number(
          variantForm.stock
        ),

        is_active:
          variantForm.is_active,
      };

      if (editingVariantId) {
        await api.patch(
          `/products/variants/${editingVariantId}/`,
          data
        );

        setSuccess(
          "Variant updated successfully."
        );
      } else {
        await api.post(
          "/products/variants/",
          data
        );

        setSuccess(
          "Variant added successfully."
        );
      }

      resetVariantForm();

      await fetchProduct();
    } catch (err) {
      console.error(
        "Variant save error:",
        err
      );

      const responseData =
        err.response?.data;

      setError(
        responseData?.detail ||
          responseData?.sku?.[0] ||
          responseData?.non_field_errors?.[0] ||
          "Unable to save variant."
      );
    } finally {
      setVariantSaving(false);
    }
  };


  /* =========================================================
     DELETE VARIANT
  ========================================================= */

  const handleDeleteVariant = async (
    variant
  ) => {
    const confirmed = window.confirm(
      `Delete variant ${variant.color} / ${variant.size}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/variants/${variant.id}/`
      );

      if (
        editingVariantId ===
        variant.id
      ) {
        resetVariantForm();
      }

      setSuccess(
        "Variant deleted successfully."
      );

      await fetchProduct();
    } catch (err) {
      console.error(
        "Variant delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete variant."
      );
    }
  };


  /* =========================================================
     TOGGLE PRODUCT STATUS
  ========================================================= */

  const handleToggleProductStatus =
    async () => {
      try {
        setError("");
        setSuccess("");

        const formData =
          new FormData();

        formData.append(
          "is_active",
          !product.is_active
        );

        await api.patch(
          `/products/products/${id}/`,
          formData
        );

        setSuccess(
          product.is_active
            ? "Product deactivated."
            : "Product activated."
        );

        await fetchProduct();
      } catch (err) {
        console.error(
          "Product status error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to update product status."
        );
      }
    };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="product-details-loading">

        <div className="product-details-spinner"></div>

        <p>
          Loading product...
        </p>

      </div>
    );
  }


  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <div className="product-details-page">

        <div className="product-not-found">

          <h2>
            Product not found
          </h2>

          <Link to="/products">
            ← Back to Products
          </Link>

        </div>

      </div>
    );
  }


  /* =========================================================
     TOTAL STOCK
  ========================================================= */

  const totalStock =
    product.variants?.reduce(
      (total, variant) =>
        total +
        (
          variant.is_active
            ? Number(
                variant.stock || 0
              )
            : 0
        ),
      0
    ) || 0;


  return (
    <div className="product-details-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="product-details-header">

        <div>

          <Link
            to="/products"
            className="back-products-link"
          >
            ← Back to Products
          </Link>

          <p className="product-details-eyebrow">
            PRODUCT
          </p>

          <h1>
            {product.name}
          </h1>

          <p className="product-details-subtitle">
            Manage product information,
            images and variants.
          </p>

        </div>


        <div className="product-header-actions">

          <button
            type="button"
            className="edit-product-btn"
            onClick={() => {
              setEditing(!editing);
              setError("");
              setSuccess("");
            }}
          >
            {editing
              ? "Cancel Edit"
              : "Edit Product"}
          </button>


          <button
            type="button"
            className="delete-product-btn"
            onClick={
              handleDeleteProduct
            }
          >
            Delete
          </button>

        </div>

      </div>


      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="product-details-alert error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}


      {success && (
        <div className="product-details-alert success">
          {success}
        </div>
      )}


      {/* =====================================================
          MAIN PRODUCT GRID
      ===================================================== */}

      <div className="product-main-grid">


        {/* ===================================================
            PRODUCT IMAGES
        =================================================== */}

        <div className="product-gallery-card">

          <div className="section-card-header">

            <div>

              <h2>
                Product Images
              </h2>

              <p>
                Main image and gallery
                images.
              </p>

            </div>

          </div>


          {/* MAIN IMAGE */}

          <div className="product-main-image">

            {mainImagePreview ? (

              <img
                src={mainImagePreview}
                alt={product.name}
              />

            ) : product.main_image ? (

              <img
                src={getImageUrl(
                  product.main_image
                )}
                alt={product.name}
              />

            ) : (

              <div className="no-image">

                <span className="no-image-icon">
                  📦
                </span>

                <span>
                  No main image
                </span>

              </div>

            )}

          </div>


          {/* CHANGE MAIN IMAGE */}

          {editing && (

            <div className="main-image-change">

              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleMainImageChange
                }
                hidden
              />

              <button
                type="button"
                onClick={() =>
                  mainImageInputRef.current?.click()
                }
              >
                Change Main Image
              </button>

            </div>

          )}


          {/* GALLERY */}

          <div className="gallery-images-grid">

            {product.images?.length > 0 ? (

              product.images.map(
                (image) => (

                  <div
                    className={`gallery-image-item ${
                      image.is_primary
                        ? "is-main-gallery-image"
                        : ""
                    }`}
                    key={image.id}
                  >

                    <div className="gallery-image-wrapper">

                      <img
                        src={getImageUrl(
                          image.image
                        )}
                        alt={
                          image.image_type
                        }
                      />


                      {image.is_primary && (

                        <span className="main-image-badge">
                          Main
                        </span>

                      )}

                    </div>


                    <div className="gallery-image-info">

                      <span>
                        Type: {image.image_type}
                      </span>


                      {/* ------------------------------------------------
                          COLOR DISPLAY
                          
                          New images:
                          image.variant_color comes
                          from ProductImage.color
                          
                          Old images:
                          backend fallback can still
                          provide variant_color.
                         ------------------------------------------------ */}

                      {image.variant_color ? (

                        <span>
                          Color:{" "}
                          {image.variant_color}
                        </span>

                      ) : (

                        <span>
                          Common Image
                        </span>

                      )}

                    </div>


                    <div className="gallery-image-actions">

                      {!image.is_primary && (

                        <button
                          type="button"
                          className="set-main-btn"
                          onClick={() =>
                            handleSetMainImage(
                              image
                            )
                          }
                          disabled={
                            settingMainId ===
                            image.id
                          }
                        >
                          {settingMainId ===
                          image.id
                            ? "Setting..."
                            : "Set as Main"}
                        </button>

                      )}


                      <button
                        type="button"
                        className="gallery-delete-btn"
                        onClick={() =>
                          handleDeleteImage(
                            image
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )

              )

            ) : (

              <div className="no-gallery-images">
                No gallery images.
              </div>

            )}

          </div>

        </div>


        {/* ===================================================
            PRODUCT INFORMATION
        =================================================== */}

        <div className="product-info-card">

          <div className="section-card-header">

            <div>

              <h2>
                Product Information
              </h2>

              <p>
                Basic product details.
              </p>

            </div>


            <button
              type="button"
              className={
                product.is_active
                  ? "product-status active"
                  : "product-status inactive"
              }
              onClick={
                handleToggleProductStatus
              }
            >
              {product.is_active
                ? "Active"
                : "Inactive"}
            </button>

          </div>


          {/* =================================================
              EDIT FORM
          ================================================= */}

          {editing ? (

            <form
              className="product-edit-form"
              onSubmit={
                handleSaveProduct
              }
            >

              {/* PRODUCT NAME */}

              <div className="detail-form-group full">

                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* BRAND + CATEGORY */}

              <div className="detail-form-row">

                <div className="detail-form-group">

                  <label>
                    Brand
                  </label>

                  <select
                    name="brand"
                    value={form.brand}
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
                          {brand.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="detail-form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      form.category
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

              </div>


              {/* GENDER + STATUS */}

              <div className="detail-form-row">

                <div className="detail-form-group">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={
                      form.gender
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


                <div className="detail-form-group">

                  <label>
                    Status
                  </label>

                  <label className="edit-status-checkbox">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      Active
                    </span>

                  </label>

                </div>

              </div>


              {/* =================================================
                  STORE PLACEMENT
              ================================================= */}

              <div className="detail-form-row">

                <div className="detail-form-group">

                  <label>
                    Store Placement
                  </label>

                  <label className="edit-status-checkbox">

                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={
                        form.is_featured
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      ⭐ Featured Product
                    </span>

                  </label>

                </div>


                <div className="detail-form-group">

                  <label>
                    New Arrival
                  </label>

                  <label className="edit-status-checkbox">

                    <input
                      type="checkbox"
                      name="is_new_arrival"
                      checked={
                        form.is_new_arrival
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      🆕 New Arrival
                    </span>

                  </label>

                </div>

              </div>


              {/* PRICE + DISCOUNT */}

              <div className="detail-form-row">

                <div className="detail-form-group">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={
                      form.price
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="detail-form-group">

                  <label>
                    Discount Price
                  </label>

                  <input
                    type="number"
                    name="discount_price"
                    min="0"
                    step="0.01"
                    value={
                      form.discount_price
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="detail-form-group full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="6"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* SAVE */}

              <button
                type="submit"
                className="save-product-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Product"}
              </button>

            </form>

          ) : (

            /* =================================================
               VIEW MODE
            ================================================= */

            <div className="product-information">

              <div className="info-item">

                <span>
                  Brand
                </span>

                <strong>
                  {product.brand_name ||
                    "-"}
                </strong>

              </div>


              <div className="info-item">

                <span>
                  Category
                </span>

                <strong>
                  {product.category_name ||
                    "-"}
                </strong>

              </div>


              <div className="info-item">

                <span>
                  Gender
                </span>

                <strong>
                  {product.gender ||
                    "-"}
                </strong>

              </div>


              <div className="info-item">

                <span>
                  Price
                </span>

                <strong>
                  ₹
                  {Number(
                    product.price
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <div className="info-item">

                <span>
                  Discount Price
                </span>

                <strong>
                  {product.discount_price
                    ? `₹${Number(
                        product.discount_price
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    : "-"}
                </strong>

              </div>


              {/* FEATURED */}

              <div className="info-item">

                <span>
                  Featured
                </span>

                <strong>
                  {product.is_featured
                    ? "⭐ Yes"
                    : "No"}
                </strong>

              </div>


              {/* NEW ARRIVAL */}

              <div className="info-item">

                <span>
                  New Arrival
                </span>

                <strong>
                  {product.is_new_arrival
                    ? "🆕 Yes"
                    : "No"}
                </strong>

              </div>


              <div className="info-item">

                <span>
                  Total Stock
                </span>

                <strong>
                  {totalStock}
                </strong>

              </div>


              <div className="info-item full">

                <span>
                  Description
                </span>

                <p>
                  {product.description ||
                    "No description available."}
                </p>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          ADD GALLERY IMAGES
      ===================================================== */}

      <div className="gallery-management-card">

        <div className="section-card-header">

          <div>

            <h2>
              Add Gallery Images
            </h2>

            <p>
              Add front, back, side,
              model or detail images
              for a product color.
            </p>

          </div>

        </div>


        <div className="gallery-upload-area">

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={
              handleGalleryImages
            }
            hidden
          />


          <button
            type="button"
            className="choose-gallery-btn"
            onClick={() =>
              galleryInputRef.current?.click()
            }
          >
            + Choose Images
          </button>


          <span>
            You can select multiple
            images.
          </span>

        </div>


        {/* =================================================
            NEW GALLERY IMAGES
        ================================================= */}

        {newGalleryImages.length >
          0 && (

          <>

            <div className="new-gallery-grid">

              {newGalleryImages.map(
                (image) => (

                  <div
                    className="new-gallery-item"
                    key={image.id}
                  >

                    {/* IMAGE */}

                    <img
                      src={image.preview}
                      alt="New gallery"
                    />


                    {/* IMAGE TYPE */}

                    <label>
                      Image Type
                    </label>

                    <select
                      value={
                        image.image_type
                      }
                      onChange={(e) =>
                        handleNewImageTypeChange(
                          image.id,
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


                    {/* =================================================
                        PRODUCT COLOR
                        
                        IMPORTANT:
                        This dropdown contains UNIQUE COLORS only.
                        
                        Example:
                        Black S
                        Black M
                        Black L
                        White S
                        White M
                        
                        Dropdown:
                        Black
                        White
                    ================================================= */}

                    <label>
                      Product Color
                    </label>

                    <select
                      value={
                        image.color
                      }
                      onChange={(e) =>
                        handleNewImageColorChange(
                          image.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Color
                      </option>

                      {uniqueColors.map(
                        (color) => (

                          <option
                            key={color}
                            value={color}
                          >
                            {color}
                          </option>

                        )
                      )}

                    </select>


                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeNewGalleryImage(
                          image.id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>


            {/* UPLOAD */}

            <button
              type="button"
              className="upload-gallery-btn"
              onClick={
                handleSaveGallery
              }
              disabled={imageSaving}
            >
              {imageSaving
                ? "Uploading..."
                : "Upload Gallery Images"}
            </button>

          </>

        )}

      </div>


      {/* =====================================================
          VARIANTS
      ===================================================== */}

      <div className="variants-card">

        <div className="section-card-header">

          <div>

            <h2>
              Product Variants
            </h2>

            <p>
              Manage colors, sizes, SKU
              and stock.
            </p>

          </div>


          <div className="variant-stock-total">

            Total Stock:{" "}

            <strong>
              {totalStock}
            </strong>

          </div>

        </div>


        {/* VARIANT FORM */}

        <form
          className="variant-form"
          onSubmit={
            handleSaveVariant
          }
        >

          <div className="variant-form-field">

            <label>
              Color
            </label>

            <input
              name="color"
              value={
                variantForm.color
              }
              onChange={
                handleVariantChange
              }
              placeholder="Black"
            />

          </div>


          <div className="variant-form-field">

            <label>
              Size
            </label>

            <input
              name="size"
              value={
                variantForm.size
              }
              onChange={
                handleVariantChange
              }
              placeholder="M"
            />

          </div>


          <div className="variant-form-field">

            <label>
              SKU
            </label>

            <input
              name="sku"
              value={
                variantForm.sku
              }
              onChange={
                handleVariantChange
              }
              placeholder="ZIV-101"
            />

          </div>


          <div className="variant-form-field">

            <label>
              Stock
            </label>

            <input
              type="number"
              min="0"
              name="stock"
              value={
                variantForm.stock
              }
              onChange={
                handleVariantChange
              }
            />

          </div>


          <label className="variant-active-check">

            <input
              type="checkbox"
              name="is_active"
              checked={
                variantForm.is_active
              }
              onChange={
                handleVariantChange
              }
            />

            Active

          </label>


          <div className="variant-form-buttons">

            <button
              type="submit"
              className="add-variant-btn"
              disabled={
                variantSaving
              }
            >
              {variantSaving
                ? "Saving..."
                : editingVariantId
                ? "Update Variant"
                : "+ Add Variant"}
            </button>


            {editingVariantId && (

              <button
                type="button"
                className="cancel-variant-btn"
                onClick={
                  resetVariantForm
                }
              >
                Cancel
              </button>

            )}

          </div>

        </form>


        {/* VARIANT TABLE */}

        {product.variants?.length >
        0 ? (

          <div className="variants-table-wrapper">

            <table className="variants-table">

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
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {product.variants.map(
                  (variant) => (

                    <tr
                      key={
                        variant.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            variant.color
                          }
                        </strong>
                      </td>


                      <td>

                        <span className="size-badge">
                          {
                            variant.size
                          }
                        </span>

                      </td>


                      <td>

                        <span className="sku-text">
                          {
                            variant.sku
                          }
                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            Number(
                              variant.stock
                            ) > 0
                              ? "variant-stock available"
                              : "variant-stock empty"
                          }
                        >
                          {
                            variant.stock
                          }
                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            variant.is_active
                              ? "variant-status active"
                              : "variant-status inactive"
                          }
                        >
                          {variant.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      <td>

                        <div className="variant-actions">

                          <button
                            type="button"
                            className="variant-edit-btn"
                            onClick={() =>
                              handleEditVariant(
                                variant
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            className="variant-delete-btn"
                            onClick={() =>
                              handleDeleteVariant(
                                variant
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="no-variants">

            <div>
              📦
            </div>

            <h3>
              No variants
            </h3>

            <p>
              Add color, size and stock
              variants above.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}


export default ProductDetails;