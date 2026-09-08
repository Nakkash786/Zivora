import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import "./Brands.css";

function Brands() {
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingBrand, setEditingBrand] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const fileInputRef = useRef(null);

  /* =========================
     FETCH BRANDS
  ========================= */

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/products/brands/"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setBrands(data);
      } else if (Array.isArray(data.results)) {
        setBrands(data.results);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error(
        "Brands fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load brands."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setLogo(file);

    const previewUrl =
      URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  };

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setLogo(null);
    setLogoPreview("");
    setEditingBrand(null);

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
      setError("Brand name is required.");
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

      if (logo) {
        formData.append(
          "logo",
          logo
        );
      }

      if (editingBrand) {
        await api.patch(
          `/products/brands/${editingBrand.id}/`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Brand updated successfully."
        );
      } else {
        await api.post(
          "/products/brands/",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Brand added successfully."
        );
      }

      resetForm();

      await fetchBrands();
    } catch (err) {
      console.error(
        "Brand save error:",
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
      } else if (responseData?.logo) {
        setError(
          Array.isArray(
            responseData.logo
          )
            ? responseData.logo[0]
            : responseData.logo
        );
      } else {
        setError(
          responseData?.detail ||
            "Unable to save brand."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (brand) => {
    setEditingBrand(brand);

    setForm({
      name: brand.name || "",
      description:
        brand.description || "",
      is_active:
        brand.is_active ?? true,
    });

    setLogo(null);

    setLogoPreview(
      getImageUrl(brand.logo)
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

  const handleDelete = async (brand) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${brand.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/brands/${brand.id}/`
      );

      setSuccess(
        "Brand deleted successfully."
      );

      if (
        editingBrand?.id ===
        brand.id
      ) {
        resetForm();
      }

      await fetchBrands();
    } catch (err) {
      console.error(
        "Brand delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "This brand cannot be deleted because products may be using it."
      );
    }
  };

  /* =========================
     TOGGLE STATUS
  ========================= */

  const handleToggleStatus = async (
    brand
  ) => {
    try {
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "is_active",
        !brand.is_active
      );

      await api.patch(
        `/products/brands/${brand.id}/`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        brand.is_active
          ? "Brand deactivated."
          : "Brand activated."
      );

      await fetchBrands();
    } catch (err) {
      console.error(
        "Brand status error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update brand status."
      );
    }
  };

  return (
    <div className="brands-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="brands-header">

        <div>
          <p className="brands-eyebrow">
            CATALOG
          </p>

          <h1>Brands</h1>

          <p className="brands-subtitle">
            Manage brands used in your
            Zivora products.
          </p>
        </div>

      </div>

      {/* =========================
          ALERTS
      ========================= */}

      {error && (
        <div className="brands-alert brands-alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="brands-alert brands-alert-success">
          {success}
        </div>
      )}

      {/* =========================
          MAIN LAYOUT
      ========================= */}

      <div className="brands-layout">

        {/* =========================
            FORM
        ========================= */}

        <div className="brand-form-card">

          <div className="brand-form-header">

            <div>
              <h2>
                {editingBrand
                  ? "Edit Brand"
                  : "Add Brand"}
              </h2>

              <p>
                {editingBrand
                  ? "Update brand information."
                  : "Create a new product brand."}
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* BRAND IMAGE */}

            <div className="brand-image-section">

              <label className="brand-image-label">
                Brand Logo
              </label>

              <div className="brand-image-upload">

                <div className="brand-image-preview">

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Brand preview"
                    />
                  ) : (
                    <span>
                      {form.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "B"}
                    </span>
                  )}

                </div>

                <div className="brand-image-info">

                  <strong>
                    {logo
                      ? logo.name
                      : editingBrand &&
                        editingBrand.logo
                      ? "Current logo"
                      : "Upload brand logo"}
                  </strong>

                  <span>
                    PNG, JPG or WEBP
                  </span>

                  <button
                    type="button"
                    className="choose-image-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    {logoPreview
                      ? "Change Logo"
                      : "Choose Logo"}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleLogoChange
                    }
                    hidden
                  />

                </div>

              </div>

            </div>

            {/* BRAND NAME */}

            <div className="form-group">

              <label>
                Brand Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Nike"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter brand description..."
                rows="5"
              />

            </div>

            {/* STATUS */}

            <label className="status-switch-row">

              <div>
                <strong>
                  Active Brand
                </strong>

                <span>
                  Show this brand in the
                  store.
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

              <span className="custom-switch"></span>

            </label>

            {/* BUTTONS */}

            <div className="brand-form-actions">

              <button
                type="submit"
                className="save-brand-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBrand
                  ? "Update Brand"
                  : "Add Brand"}
              </button>

              {editingBrand && (
                <button
                  type="button"
                  className="cancel-brand-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>

        {/* =========================
            BRAND LIST
        ========================= */}

        <div className="brands-list-card">

          <div className="brands-list-header">

            <div>
              <h2>
                All Brands
              </h2>

              <p>
                {brands.length} brand(s)
              </p>
            </div>

            <button
              type="button"
              className="refresh-brands-btn"
              onClick={fetchBrands}
            >
              ↻ Refresh
            </button>

          </div>

          {loading ? (
            <div className="brands-loading">
              <div className="brands-spinner"></div>
              <p>
                Loading brands...
              </p>
            </div>
          ) : brands.length === 0 ? (
            <div className="brands-empty">

              <div>🏷️</div>

              <h3>
                No brands found
              </h3>

              <p>
                Add your first brand using
                the form.
              </p>

            </div>
          ) : (
            <div className="brands-table-wrapper">

              <table className="brands-table">

                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {brands.map((brand) => (
                    <tr key={brand.id}>

                      <td>

                        <div className="brand-name-cell">

                          <div className="brand-logo">

                            {brand.logo ? (
                              <img
                                src={getImageUrl(
                                  brand.logo
                                )}
                                alt={
                                  brand.name
                                }
                              />
                            ) : (
                              <span>
                                {brand.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "B"}
                              </span>
                            )}

                          </div>

                          <div>
                            <strong>
                              {brand.name}
                            </strong>

                            <span>
                              ID: #
                              {brand.id}
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="brand-description">
                          {brand.description ||
                            "No description"}
                        </span>

                      </td>

                      <td>

                        <button
                          type="button"
                          className={
                            brand.is_active
                              ? "brand-status active"
                              : "brand-status inactive"
                          }
                          onClick={() =>
                            handleToggleStatus(
                              brand
                            )
                          }
                        >
                          {brand.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>

                      </td>

                      <td>

                        <div className="brand-actions">

                          <button
                            type="button"
                            className="edit-brand-btn"
                            onClick={() =>
                              handleEdit(
                                brand
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-brand-btn"
                            onClick={() =>
                              handleDelete(
                                brand
                              )
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

    </div>
  );
}

export default Brands;