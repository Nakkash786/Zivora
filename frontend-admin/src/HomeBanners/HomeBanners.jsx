import { useEffect, useState } from "react";
import api from "../../services/api";
import "./HomeBanners.css";

function HomeBanners() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    button_text: "Shop Now",
    button_link: "/products",
    is_active: true,
    display_order: 0,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  /* =========================================================
     FETCH BANNERS
  ========================================================= */

  const fetchBanners = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products/banners/");

      const data = response.data;

      if (Array.isArray(data)) {
        setBanners(data);
      } else if (Array.isArray(data.results)) {
        setBanners(data.results);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      alert("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      button_text: "Shop Now",
      button_link: "/products",
      is_active: true,
      display_order: 0,
    });

    setImage(null);
    setPreview("");
    setEditingBanner(null);
  };

  /* =========================================================
     OPEN ADD FORM
  ========================================================= */

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  /* =========================================================
     OPEN EDIT FORM
  ========================================================= */

  const handleEdit = (banner) => {
    setEditingBanner(banner);

    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      button_text: banner.button_text || "Shop Now",
      button_link: banner.button_link || "/products",
      is_active: banner.is_active ?? true,
      display_order: banner.display_order ?? 0,
    });

    setImage(null);
    setPreview(banner.image || "");
    setShowForm(true);
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter banner title.");
      return;
    }

    if (!editingBanner && !image) {
      alert("Please select a banner image.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("subtitle", form.subtitle.trim());
      formData.append("button_text", form.button_text.trim());
      formData.append("button_link", form.button_link.trim());
      formData.append("is_active", form.is_active);
      formData.append("display_order", Number(form.display_order) || 0);

      if (image) {
        formData.append("image", image);
      }

      if (editingBanner) {
        await api.patch(
          `/products/banners/${editingBanner.id}/`,
          formData
        );

        alert("Banner updated successfully.");
      } else {
        await api.post("/products/banners/", formData);

        alert("Banner added successfully.");
      }

      setShowForm(false);
      resetForm();

      await fetchBanners();
    } catch (error) {
      console.error("Banner save error:", error);

      const errorData = error.response?.data;

      if (errorData) {
        console.error("Backend error:", errorData);

        if (typeof errorData === "object") {
          const messages = Object.entries(errorData)
            .map(([field, message]) => `${field}: ${message}`)
            .join("\n");

          alert(messages || "Failed to save banner.");
        } else {
          alert(String(errorData));
        }
      } else {
        alert("Failed to save banner.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/banners/${id}/`);

      alert("Banner deleted successfully.");

      await fetchBanners();
    } catch (error) {
      console.error("Banner delete error:", error);

      alert("Failed to delete banner.");
    }
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus = async (banner) => {
    try {
      const formData = new FormData();

      formData.append("is_active", !banner.is_active);

      await api.patch(
        `/products/banners/${banner.id}/`,
        formData
      );

      await fetchBanners();
    } catch (error) {
      console.error("Status update error:", error);

      alert("Failed to update banner status.");
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="home-banners-page">
        <div className="banner-loading">
          <div className="banner-spinner"></div>
          <p>Loading banners...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="home-banners-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="home-banners-header">

        <div>
          <h1>Home Banners</h1>

          <p>
            Manage the banners displayed on your Zivora homepage.
          </p>
        </div>

        <button
          type="button"
          className="add-banner-button"
          onClick={handleAdd}
        >
          <span>+</span>
          Add Banner
        </button>

      </div>


      {/* =====================================================
          FORM
      ===================================================== */}

      {showForm && (
        <div className="banner-form-card">

          <div className="banner-form-header">

            <div>
              <h2>
                {editingBanner
                  ? "Edit Banner"
                  : "Add New Banner"}
              </h2>

              <p>
                {editingBanner
                  ? "Update your homepage banner."
                  : "Create a new homepage banner."}
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={handleCancel}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* =================================================
                IMAGE
            ================================================= */}

            <div className="banner-form-section">

              <h3>Banner Image</h3>

              <div className="banner-image-upload">

                <div className="banner-image-preview">

                  {preview ? (
                    <img
                      src={preview}
                      alt="Banner preview"
                    />
                  ) : (
                    <div className="banner-image-placeholder">
                      <span>🖼️</span>
                      <p>No image selected</p>
                    </div>
                  )}

                </div>


                <div className="banner-upload-controls">

                  <label
                    htmlFor="banner-image"
                    className="choose-image-button"
                  >
                    Choose Image
                  </label>

                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <p>
                    Recommended: 1600 × 600 px
                  </p>

                  <small>
                    JPG, JPEG, PNG or WEBP
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div className="banner-form-section">

              <h3>Banner Information</h3>

              <div className="banner-form-grid">

                <div className="banner-form-group banner-full-width">

                  <label htmlFor="title">
                    Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: New Season Collection"
                    maxLength={200}
                    required
                  />

                </div>


                <div className="banner-form-group banner-full-width">

                  <label htmlFor="subtitle">
                    Subtitle
                  </label>

                  <textarea
                    id="subtitle"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Example: Discover the latest fashion trends."
                    rows="4"
                  />

                </div>


                <div className="banner-form-group">

                  <label htmlFor="button_text">
                    Button Text
                  </label>

                  <input
                    id="button_text"
                    name="button_text"
                    type="text"
                    value={form.button_text}
                    onChange={handleChange}
                    placeholder="Shop Now"
                    maxLength={100}
                  />

                </div>


                <div className="banner-form-group">

                  <label htmlFor="button_link">
                    Button Link
                  </label>

                  <input
                    id="button_link"
                    name="button_link"
                    type="text"
                    value={form.button_link}
                    onChange={handleChange}
                    placeholder="/products"
                    maxLength={255}
                  />

                </div>


                <div className="banner-form-group">

                  <label htmlFor="display_order">
                    Display Order
                  </label>

                  <input
                    id="display_order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={handleChange}
                  />

                  <small>
                    Lower numbers appear first.
                  </small>

                </div>


                <div className="banner-form-group">

                  <label>Status</label>

                  <label className="banner-status-checkbox">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    <span>
                      Active Banner
                    </span>

                  </label>

                </div>

              </div>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="banner-form-actions">

              <button
                type="button"
                className="cancel-banner-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-banner-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBanner
                    ? "Update Banner"
                    : "Add Banner"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================================
          BANNER LIST
      ===================================================== */}

      <div className="banner-list-section">

        <div className="banner-list-header">

          <div>
            <h2>All Banners</h2>

            <span>
              {banners.length}{" "}
              {banners.length === 1
                ? "banner"
                : "banners"}
            </span>
          </div>

        </div>


        {banners.length === 0 ? (

          <div className="empty-banners">

            <div className="empty-banner-icon">
              🖼️
            </div>

            <h3>No banners found</h3>

            <p>
              Add your first homepage banner to get started.
            </p>

            <button
              type="button"
              onClick={handleAdd}
            >
              + Add Banner
            </button>

          </div>

        ) : (

          <div className="banner-table-wrapper">

            <table className="banner-table">

              <thead>

                <tr>

                  <th>Banner</th>

                  <th>Button</th>

                  <th>Order</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {banners.map((banner) => (

                  <tr key={banner.id}>

                    {/* BANNER */}

                    <td>

                      <div className="banner-info">

                        <div className="banner-thumbnail">

                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={banner.title}
                            />
                          ) : (
                            <span>🖼️</span>
                          )}

                        </div>


                        <div className="banner-details">

                          <strong>
                            {banner.title}
                          </strong>

                          {banner.subtitle && (
                            <p>
                              {banner.subtitle}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>


                    {/* BUTTON */}

                    <td>

                      <div className="banner-button-info">

                        <strong>
                          {banner.button_text || "-"}
                        </strong>

                        <span>
                          {banner.button_link || "-"}
                        </span>

                      </div>

                    </td>


                    {/* ORDER */}

                    <td>

                      <span className="order-badge">
                        #{banner.display_order}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <button
                        type="button"
                        className={`banner-status-badge ${
                          banner.is_active
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() =>
                          handleToggleStatus(banner)
                        }
                      >
                        {banner.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="banner-actions">

                        <button
                          type="button"
                          className="edit-banner-button"
                          onClick={() =>
                            handleEdit(banner)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-banner-button"
                          onClick={() =>
                            handleDelete(banner.id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default HomeBanners;