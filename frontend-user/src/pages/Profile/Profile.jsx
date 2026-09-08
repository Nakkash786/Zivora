import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================================
  // FETCH PROFILE
  // ==========================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/accounts/profile/");

      const data = response.data;

      setProfile(data);

      setFormData({
        username: data.username || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
      });

      if (data.profile_image) {
        if (data.profile_image.startsWith("http")) {
          setPreviewImage(data.profile_image);
        } else {
          setPreviewImage(
            `http://127.0.0.1:8000${data.profile_image}`
          );
        }
      } else {
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);

      if (error.response?.data) {
        setErrorMessage(
          error.response.data.detail ||
            error.response.data.message ||
            "Failed to load profile."
        );
      } else {
        setErrorMessage("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile image must be less than 5 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    setSelectedImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const data = new FormData();

      data.append("username", formData.username.trim());
      data.append("first_name", formData.first_name.trim());
      data.append("last_name", formData.last_name.trim());
      data.append("phone", formData.phone.trim());

      if (selectedImage) {
        data.append("profile_image", selectedImage);
      }

      const response = await api.patch(
        "/accounts/profile/",
        data
      );

      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setFormData({
        username: updatedProfile.username || "",
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        phone: updatedProfile.phone || "",
      });

      setSelectedImage(null);

      if (updatedProfile.profile_image) {
        if (updatedProfile.profile_image.startsWith("http")) {
          setPreviewImage(updatedProfile.profile_image);
        } else {
          setPreviewImage(
            `http://127.0.0.1:8000${updatedProfile.profile_image}`
          );
        }
      } else {
        setPreviewImage(null);
      }

      localStorage.setItem(
        "user",
        JSON.stringify(updatedProfile)
      );

      window.dispatchEvent(new Event("authChanged"));

      setEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      const responseData = error.response?.data;

      if (responseData) {
        if (typeof responseData === "object") {
          const messages = Object.entries(responseData)
            .map(([field, message]) => {
              if (Array.isArray(message)) {
                return `${field}: ${message.join(", ")}`;
              }

              return `${field}: ${message}`;
            })
            .join(" | ");

          setErrorMessage(
            messages || "Failed to update profile."
          );
        } else {
          setErrorMessage(String(responseData));
        }
      } else {
        setErrorMessage("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setFormData({
      username: profile.username || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
    });

    setSelectedImage(null);

    if (profile.profile_image) {
      if (profile.profile_image.startsWith("http")) {
        setPreviewImage(profile.profile_image);
      } else {
        setPreviewImage(
          `http://127.0.0.1:8000${profile.profile_image}`
        );
      }
    } else {
      setPreviewImage(null);
    }

    setEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // ==========================================================
  // DEFAULT AVATAR
  // ==========================================================

  const getInitial = () => {
    if (!profile) {
      return "U";
    }

    const name =
      profile.first_name ||
      profile.username ||
      profile.email?.split("@")[0] ||
      "User";

    return name.charAt(0).toUpperCase();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR WITHOUT PROFILE
  // ==========================================================

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error-box">
          <h2>Unable to load profile</h2>
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={fetchProfile}
            className="profile-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PROFILE UI
  // ==========================================================

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="profile-header">
          <div>
            <p className="profile-breadcrumb">
              Home / Profile
            </p>

            <h1>My Profile</h1>

            <p className="profile-header-text">
              Manage your personal information and account
              settings.
            </p>
          </div>
        </div>

        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {successMessage && (
          <div className="profile-success-message">
            <span>✓</span>
            <p>{successMessage}</p>
          </div>
        )}

        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {errorMessage && (
          <div className="profile-error-message">
            <span>!</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ====================================================
            PROFILE CONTENT
        ==================================================== */}

        <div className="profile-content">

          {/* ==================================================
              LEFT PROFILE CARD
          ================================================== */}

          <div className="profile-sidebar">

            <div className="profile-card">

              <div className="profile-avatar-section">

                <div className="profile-avatar-large">

                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                    />
                  ) : (
                    <span>{getInitial()}</span>
                  )}

                </div>

                {editing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="profile-file-input"
                    />

                    <button
                      type="button"
                      className="change-photo-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      Change Photo
                    </button>
                  </>
                )}

              </div>

              <div className="profile-card-info">

                <h2>
                  {profile.first_name ||
                    profile.username ||
                    "User"}
                </h2>

                <p>{profile.email}</p>

                {profile.is_email_verified && (
                  <span className="verified-badge">
                    ✓ Email Verified
                  </span>
                )}

              </div>

            </div>

            {/* =================================================
                ACCOUNT OPTIONS
            ================================================= */}

            <div className="profile-options-card">

              <h3>Account</h3>

              <button
                type="button"
                onClick={() => navigate("/addresses")}
                className="profile-option"
              >
                <span className="option-icon">📍</span>

                <span className="option-content">
                  <strong>My Addresses</strong>
                  <small>
                    Manage your delivery addresses
                  </small>
                </span>

                <span className="option-arrow">›</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="profile-option"
              >
                <span className="option-icon">📦</span>

                <span className="option-content">
                  <strong>My Orders</strong>
                  <small>
                    View your orders and status
                  </small>
                </span>

                <span className="option-arrow">›</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="profile-option"
              >
                <span className="option-icon">♡</span>

                <span className="option-content">
                  <strong>Wishlist</strong>
                  <small>
                    View your saved products
                  </small>
                </span>

                <span className="option-arrow">›</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="profile-option"
              >
                <span className="option-icon">🛒</span>

                <span className="option-content">
                  <strong>Shopping Cart</strong>
                  <small>
                    View products in your cart
                  </small>
                </span>

                <span className="option-arrow">›</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/change-password")
                }
                className="profile-option"
              >
                <span className="option-icon">🔒</span>

                <span className="option-content">
                  <strong>Change Password</strong>
                  <small>
                    Update your account password
                  </small>
                </span>

                <span className="option-arrow">›</span>
              </button>

            </div>
          </div>

          {/* ==================================================
              RIGHT PROFILE FORM
          ================================================== */}

          <div className="profile-details-card">

            <div className="profile-details-header">

              <div>
                <h2>Personal Information</h2>

                <p>
                  Update your personal information below.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="edit-profile-button"
                  onClick={() => {
                    setEditing(true);
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}
                >
                  ✎ Edit Profile
                </button>
              )}

            </div>

            <form
              onSubmit={handleSave}
              className="profile-form"
            >

              {/* =================================================
                  USERNAME
              ================================================= */}

              <div className="form-group">

                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter username"
                  autoComplete="username"
                />

              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="disabled-input"
                />

                <small className="input-note">
                  Email address cannot be changed.
                </small>

              </div>

              {/* =================================================
                  FIRST NAME
              ================================================= */}

              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="first_name">
                    First Name
                  </label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter first name"
                    autoComplete="given-name"
                  />

                </div>

                {/* =============================================
                    LAST NAME
                ============================================= */}

                <div className="form-group">

                  <label htmlFor="last_name">
                    Last Name
                  </label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter last name"
                    autoComplete="family-name"
                  />

                </div>

              </div>

              {/* =================================================
                  PHONE
              ================================================= */}

              <div className="form-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />

              </div>

              {/* =================================================
                  ACCOUNT INFO
              ================================================= */}

              <div className="account-info">

                <div className="account-info-item">
                  <span>Account ID</span>
                  <strong>#{profile.id}</strong>
                </div>

                <div className="account-info-item">
                  <span>Member Since</span>
                  <strong>
                    {profile.created_at
                      ? new Date(
                          profile.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              {editing && (
                <div className="profile-form-actions">

                  <button
                    type="button"
                    className="cancel-profile-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-profile-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="button-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>

                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;