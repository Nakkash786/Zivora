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

      console.error(
        "Fetch banners error:",
        error
      );

      alert("Failed to load banners.");

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    fetchBanners();

  }, []);


  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  };


  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (!file.type.startsWith("image/")) {

      alert(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }


    if (file.size > 5 * 1024 * 1024) {

      alert(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";

      return;
    }


    setImage(file);


    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);

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
      button_text:
        banner.button_text || "Shop Now",
      button_link:
        banner.button_link || "/products",
      is_active:
        banner.is_active ?? true,
      display_order:
        banner.display_order ?? 0,
    });

    setImage(null);

    setPreview(
      banner.image || ""
    );

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
     SUBMIT BANNER
  ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!form.title.trim()) {

      alert(
        "Please enter a banner title."
      );

      return;
    }


    if (!editingBanner && !image) {

      alert(
        "Please select a banner image."
      );

      return;
    }


    try {

      setSaving(true);


      const formData =
        new FormData();


      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "subtitle",
        form.subtitle.trim()
      );

      formData.append(
        "button_text",
        form.button_text.trim()
      );

      formData.append(
        "button_link",
        form.button_link.trim()
      );

      formData.append(
        "is_active",
        form.is_active ? "true" : "false"
      );

      formData.append(
        "display_order",
        String(
          Number(form.display_order) || 0
        )
      );


      if (image) {

        formData.append(
          "image",
          image
        );

      }


      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingBanner) {

        await api.patch(
          `/products/banners/${editingBanner.id}/`,
          formData
        );

        alert(
          "Banner updated successfully."
        );

      }

      /* =====================================================
         CREATE
      ===================================================== */

      else {

        await api.post(
          "/products/banners/",
          formData
        );

        alert(
          "Banner added successfully."
        );

      }


      setShowForm(false);

      resetForm();

      await fetchBanners();

    } catch (error) {

      console.error(
        "Save banner error:",
        error
      );


      const backendError =
        error.response?.data;


      if (backendError) {

        console.error(
          "Backend response:",
          backendError
        );


        if (
          typeof backendError ===
          "object"
        ) {

          const messages =
            Object.entries(
              backendError
            )
              .map(
                ([field, message]) =>
                  `${field}: ${
                    Array.isArray(message)
                      ? message.join(", ")
                      : message
                  }`
              )
              .join("\n");


          alert(
            messages ||
            "Failed to save banner."
          );

        } else {

          alert(
            String(backendError)
          );

        }

      } else {

        alert(
          "Failed to save banner."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     DELETE BANNER
  ========================================================= */

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this banner?"
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/products/banners/${id}/`
      );

      alert(
        "Banner deleted successfully."
      );

      await fetchBanners();

    } catch (error) {

      console.error(
        "Delete banner error:",
        error
      );

      alert(
        "Failed to delete banner."
      );

    }

  };


  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus =
    async (banner) => {

      try {

        const formData =
          new FormData();


        formData.append(
          "is_active",
          banner.is_active
            ? "false"
            : "true"
        );


        await api.patch(
          `/products/banners/${banner.id}/`,
          formData
        );


        await fetchBanners();

      } catch (error) {

        console.error(
          "Status update error:",
          error
        );

        alert(
          "Failed to update banner status."
        );

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

          <p>
            Loading banners...
          </p>

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
          PAGE HEADER
      ===================================================== */}

      <div className="home-banners-header">

        <div>

          <div className="banner-page-title-row">

            <div className="banner-page-icon">
              🖼️
            </div>

            <div>

              <h1>
                Home Banners
              </h1>

              <p>
                Manage banners displayed
                on your Zivora homepage.
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          className="add-banner-button"
          onClick={handleAdd}
        >

          <span>
            +
          </span>

          Add Banner

        </button>

      </div>


      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (

        <div className="banner-form-card">


          {/* FORM HEADER */}

          <div className="banner-form-header">

            <div>

              <h2>

                {editingBanner
                  ? "Edit Banner"
                  : "Add New Banner"}

              </h2>

              <p>

                {editingBanner
                  ? "Update your homepage banner details."
                  : "Create a new banner for the Zivora homepage."}

              </p>

            </div>


            <button
              type="button"
              className="close-form-button"
              onClick={handleCancel}
              disabled={saving}
            >
              ×
            </button>

          </div>


          <form
            onSubmit={handleSubmit}
          >


            {/* =================================================
                IMAGE SECTION
            ================================================= */}

            <div className="banner-form-section">

              <div className="banner-section-heading">

                <div className="section-number">
                  01
                </div>

                <div>

                  <h3>
                    Banner Image
                  </h3>

                  <p>
                    Upload the main image
                    for this homepage banner.
                  </p>

                </div>

              </div>


              <div className="banner-image-upload">


                {/* PREVIEW */}

                <div className="banner-image-preview">

                  {preview ? (

                    <img
                      src={preview}
                      alt="Banner preview"
                    />

                  ) : (

                    <div className="banner-image-placeholder">

                      <span>
                        🖼️
                      </span>

                      <p>
                        No image selected
                      </p>

                    </div>

                  )}

                </div>


                {/* CONTROLS */}

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
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />

                  <p>
                    Recommended size:
                    <strong>
                      1600 × 600 px
                    </strong>
                  </p>

                  <small>
                    JPG, PNG or WEBP ·
                    Maximum 5 MB
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="banner-form-section">

              <div className="banner-section-heading">

                <div className="section-number">
                  02
                </div>

                <div>

                  <h3>
                    Banner Information
                  </h3>

                  <p>
                    Add the content that
                    customers will see.
                  </p>

                </div>

              </div>


              <div className="banner-form-grid">


                {/* TITLE */}

                <div className="banner-form-group banner-full-width">

                  <label htmlFor="title">
                    Banner Title
                    <span>*</span>
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

                  <small>
                    Maximum 200 characters.
                  </small>

                </div>


                {/* SUBTITLE */}

                <div className="banner-form-group banner-full-width">

                  <label htmlFor="subtitle">
                    Subtitle
                  </label>

                  <textarea
                    id="subtitle"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Example: Discover the latest fashion trends at Zivora."
                    rows={4}
                  />

                </div>


                {/* BUTTON TEXT */}

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


                {/* BUTTON LINK */}

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

                  <small>
                    Example: /products
                  </small>

                </div>


                {/* DISPLAY ORDER */}

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
                    Lower number appears first.
                  </small>

                </div>


                {/* STATUS */}

                <div className="banner-form-group">

                  <label>
                    Banner Status
                  </label>

                  <label className="banner-status-checkbox">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    <span className="status-toggle">

                      <span className="status-toggle-dot"></span>

                      Active Banner

                    </span>

                  </label>

                </div>

              </div>

            </div>


            {/* =================================================
                FORM ACTIONS
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

                {saving ? (

                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>

                ) : (

                  editingBanner
                    ? "Update Banner"
                    : "Add Banner"

                )}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* =====================================================
          BANNER LIST
      ===================================================== */}

      <div className="banner-list-section">


        {/* LIST HEADER */}

        <div className="banner-list-header">

          <div>

            <div>

              <h2>
                All Banners
              </h2>

              <span className="banner-count">
                {banners.length}
              </span>

            </div>

            <p>
              Manage your homepage promotional banners.
            </p>

          </div>

        </div>


        {/* EMPTY */}

        {banners.length === 0 ? (

          <div className="empty-banners">

            <div className="empty-banner-icon">
              🖼️
            </div>

            <h3>
              No banners found
            </h3>

            <p>
              Add your first homepage banner
              to get started.
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

                  <th>
                    Banner
                  </th>

                  <th>
                    Button
                  </th>

                  <th>
                    Order
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

                {banners.map((banner) => (

                  <tr
                    key={banner.id}
                  >


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

                            <span>
                              🖼️
                            </span>

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

                        <span></span>

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