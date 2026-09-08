import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import "./Categories.css";

function Categories() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [image, setImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const fileInputRef = useRef(null);

  /* =========================
     FETCH CATEGORIES
  ========================= */

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/products/categories/"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (
        Array.isArray(data.results)
      ) {
        setCategories(data.results);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error(
        "Categories fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================
     IMAGE URL
  ========================= */

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

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================
     IMAGE CHANGE
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /* =========================
     RESET
  ========================= */

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setImage(null);
    setImagePreview("");
    setEditingCategory(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Category name is required."
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
        "description",
        form.description
      );

      formData.append(
        "is_active",
        form.is_active
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      if (editingCategory) {
        await api.patch(
          `/products/categories/${editingCategory.id}/`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/products/categories/",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Category added successfully."
        );
      }

      resetForm();

      await fetchCategories();
    } catch (err) {
      console.error(
        "Category save error:",
        err
      );

      const responseData =
        err.response?.data;

      if (responseData?.name) {
        setError(
          Array.isArray(
            responseData.name
          )
            ? responseData.name[0]
            : responseData.name
        );
      } else if (
        responseData?.image
      ) {
        setError(
          Array.isArray(
            responseData.image
          )
            ? responseData.image[0]
            : responseData.image
        );
      } else {
        setError(
          responseData?.detail ||
            "Unable to save category."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      is_active:
        category.is_active ?? true,
    });

    setImage(null);

    setImagePreview(
      getImageUrl(category.image)
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (
    category
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/categories/${category.id}/`
      );

      setSuccess(
        "Category deleted successfully."
      );

      if (
        editingCategory?.id ===
        category.id
      ) {
        resetForm();
      }

      await fetchCategories();
    } catch (err) {
      console.error(
        "Category delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "This category cannot be deleted because products may be using it."
      );
    }
  };

  /* =========================
     STATUS
  ========================= */

  const handleToggleStatus = async (
    category
  ) => {
    try {
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "is_active",
        !category.is_active
      );

      await api.patch(
        `/products/categories/${category.id}/`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        category.is_active
          ? "Category deactivated."
          : "Category activated."
      );

      await fetchCategories();
    } catch (err) {
      console.error(
        "Category status error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update category status."
      );
    }
  };

  return (
    <div className="categories-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="categories-header">

        <div>
          <p className="categories-eyebrow">
            CATALOG
          </p>

          <h1>Categories</h1>

          <p className="categories-subtitle">
            Manage categories used in your
            Zivora products.
          </p>
        </div>

      </div>

      {/* =========================
          ALERTS
      ========================= */}

      {error && (
        <div className="categories-alert categories-alert-error">

          <span>{error}</span>

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
        <div className="categories-alert categories-alert-success">
          {success}
        </div>
      )}

      {/* =========================
          LAYOUT
      ========================= */}

      <div className="categories-layout">

        {/* =========================
            FORM
        ========================= */}

        <div className="category-form-card">

          <div className="category-form-header">

            <div>

              <h2>
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <p>
                {editingCategory
                  ? "Update category information."
                  : "Create a new product category."}
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* CATEGORY IMAGE */}

            <div className="category-image-section">

              <label className="category-image-label">
                Category Image
              </label>

              <div className="category-image-upload">

                <div className="category-image-preview">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Category preview"
                    />
                  ) : (
                    <span>
                      {form.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "C"}
                    </span>
                  )}

                </div>

                <div className="category-image-info">

                  <strong>
                    {image
                      ? image.name
                      : editingCategory &&
                        editingCategory.image
                      ? "Current image"
                      : "Upload category image"}
                  </strong>

                  <span>
                    PNG, JPG or WEBP
                  </span>

                  <button
                    type="button"
                    className="choose-category-image-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    {imagePreview
                      ? "Change Image"
                      : "Choose Image"}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageChange
                    }
                    hidden
                  />

                </div>

              </div>

            </div>

            {/* NAME */}

            <div className="category-form-group">

              <label>
                Category Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. T-Shirts"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="category-form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter category description..."
                rows="5"
              />

            </div>

            {/* STATUS */}

            <label className="category-status-row">

              <div>

                <strong>
                  Active Category
                </strong>

                <span>
                  Show this category in
                  the store.
                </span>

              </div>

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

              <span className="category-switch"></span>

            </label>

            {/* BUTTONS */}

            <div className="category-form-actions">

              <button
                type="submit"
                className="save-category-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  className="cancel-category-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>

        {/* =========================
            LIST
        ========================= */}

        <div className="categories-list-card">

          <div className="categories-list-header">

            <div>

              <h2>
                All Categories
              </h2>

              <p>
                {categories.length} category(s)
              </p>

            </div>

            <button
              type="button"
              className="refresh-categories-btn"
              onClick={fetchCategories}
            >
              ↻ Refresh
            </button>

          </div>

          {loading ? (
            <div className="categories-loading">

              <div className="categories-spinner"></div>

              <p>
                Loading categories...
              </p>

            </div>
          ) : categories.length ===
            0 ? (
            <div className="categories-empty">

              <div>📂</div>

              <h3>
                No categories found
              </h3>

              <p>
                Add your first category
                using the form.
              </p>

            </div>
          ) : (
            <div className="categories-table-wrapper">

              <table className="categories-table">

                <thead>

                  <tr>
                    <th>
                      Category
                    </th>

                    <th>
                      Description
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

                  {categories.map(
                    (category) => (
                      <tr
                        key={
                          category.id
                        }
                      >

                        <td>

                          <div className="category-name-cell">

                            <div className="category-icon">

                              {category.image ? (
                                <img
                                  src={getImageUrl(
                                    category.image
                                  )}
                                  alt={
                                    category.name
                                  }
                                />
                              ) : (
                                <span>
                                  {category.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                    "C"}
                                </span>
                              )}

                            </div>

                            <div>

                              <strong>
                                {
                                  category.name
                                }
                              </strong>

                              <span>
                                ID: #
                                {
                                  category.id
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="category-description">
                            {category.description ||
                              "No description"}
                          </span>

                        </td>

                        <td>

                          <button
                            type="button"
                            className={
                              category.is_active
                                ? "category-status active"
                                : "category-status inactive"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
                            }
                          >
                            {category.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>

                        <td>

                          <div className="category-actions">

                            <button
                              type="button"
                              className="edit-category-btn"
                              onClick={() =>
                                handleEdit(
                                  category
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-category-btn"
                              onClick={() =>
                                handleDelete(
                                  category
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
          )}

        </div>

      </div>

    </div>
  );
}

export default Categories;