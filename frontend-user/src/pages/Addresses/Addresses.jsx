import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Addresses.css";

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    address_type: "HOME",
    is_default: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // FETCH ADDRESSES
  // =========================================================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/accounts/addresses/");

      const data = response.data;

      if (Array.isArray(data)) {
        setAddresses(data);
      } else if (Array.isArray(data.results)) {
        setAddresses(data.results);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Address fetch error:", err);

      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load addresses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddAddress = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEdit = (address) => {
    setEditingId(address.id);

    setFormData({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line: address.address_line || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      address_type: address.address_type || "HOME",
      is_default: address.is_default || false,
    });

    setShowForm(true);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CANCEL FORM
  // =========================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  // =========================================================
  // SAVE ADDRESS
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.address_line.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!formData.pincode.trim()) {
      setError("Please enter your pincode.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address_line: formData.address_line.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country.trim(),
        address_type: formData.address_type,
        is_default: formData.is_default,
      };

      let response;

      if (editingId) {
        response = await api.patch(
          `/accounts/addresses/${editingId}/`,
          payload
        );

        setMessage("Address updated successfully.");
      } else {
        response = await api.post(
          "/accounts/addresses/",
          payload
        );

        setMessage("Address added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);

      await fetchAddresses();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Address save error:", err);

      const data = err.response?.data;

      if (data) {
        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else if (typeof firstError === "string") {
            setError(firstError);
          } else {
            setError("Unable to save address.");
          }
        }
      } else {
        setError("Unable to save address.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE ADDRESS
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/accounts/addresses/${id}/`
      );

      setAddresses((previous) =>
        previous.filter(
          (address) => address.id !== id
        )
      );

      setMessage("Address deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Address delete error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete address."
      );
    }
  };

  // =========================================================
  // SET DEFAULT ADDRESS
  // =========================================================

  const handleSetDefault = async (id) => {
    try {
      setError("");
      setMessage("");

      await api.patch(
        `/accounts/addresses/${id}/`,
        {
          is_default: true,
        }
      );

      await fetchAddresses();

      setMessage(
        "Default address updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "Set default address error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to set default address."
      );
    }
  };

  // =========================================================
  // ADDRESS TYPE
  // =========================================================

  const getAddressType = (type) => {
    if (type === "WORK") return "Work";
    if (type === "OTHER") return "Other";
    return "Home";
  };

  const getAddressIcon = (type) => {
    if (type === "WORK") return "🏢";
    if (type === "OTHER") return "📍";
    return "🏠";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="addresses-loading">
        <div className="addresses-spinner"></div>
        <p>Loading addresses...</p>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="addresses-page">

      <div className="addresses-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="addresses-header">

          <div>
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/profile")}
            >
              ← Back to Profile
            </button>

            <h1>My Addresses</h1>

            <p>
              Manage your delivery addresses
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              className="add-address-btn"
              onClick={handleAddAddress}
            >
              + Add New Address
            </button>
          )}

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="address-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="address-error">
            ✕ {error}
          </div>
        )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {showForm && (
          <div className="address-form-card">

            <div className="address-form-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p>
                  Enter your delivery details
                </p>
              </div>

              <button
                type="button"
                className="close-form-btn"
                onClick={handleCancel}
              >
                ✕
              </button>

            </div>

            <form
              className="address-form"
              onSubmit={handleSubmit}
            >

              {/* FULL NAME */}

              <div className="form-group">
                <label htmlFor="full_name">
                  Full Name
                </label>

                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </div>

              {/* PHONE */}

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              {/* ADDRESS */}

              <div className="form-group full-width">
                <label htmlFor="address_line">
                  Address
                </label>

                <textarea
                  id="address_line"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  placeholder="House name, street, locality..."
                  rows="3"
                ></textarea>
              </div>

              {/* CITY + STATE */}

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

              </div>

              {/* PINCODE + COUNTRY */}

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="pincode">
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">
                    Country
                  </label>

                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>

              </div>

              {/* ADDRESS TYPE */}

              <div className="form-group">
                <label htmlFor="address_type">
                  Address Type
                </label>

                <select
                  id="address_type"
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange}
                >
                  <option value="HOME">
                    Home
                  </option>

                  <option value="WORK">
                    Work
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              {/* DEFAULT */}

              <label className="default-address-checkbox">

                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />

                <span>
                  Set this as my default address
                </span>

              </label>

              {/* BUTTONS */}

              <div className="address-form-actions">

                <button
                  type="button"
                  className="cancel-address-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-address-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =================================================
            ADDRESS LIST
        ================================================= */}

        {!showForm && addresses.length === 0 ? (

          <div className="no-addresses">

            <div className="no-address-icon">
              📍
            </div>

            <h2>
              No addresses saved
            </h2>

            <p>
              Add an address to make checkout
              faster and easier.
            </p>

            <button
              type="button"
              className="add-first-address-btn"
              onClick={handleAddAddress}
            >
              + Add Your First Address
            </button>

          </div>

        ) : (

          !showForm && (
            <div className="addresses-list">

              {addresses.map((address) => (

                <div
                  className={`address-card ${
                    address.is_default
                      ? "default-address"
                      : ""
                  }`}
                  key={address.id}
                >

                  {/* CARD HEADER */}

                  <div className="address-card-header">

                    <div className="address-title">

                      <span className="address-type-icon">
                        {getAddressIcon(
                          address.address_type
                        )}
                      </span>

                      <div>
                        <h2>
                          {getAddressType(
                            address.address_type
                          )}
                        </h2>

                        {address.is_default && (
                          <span className="default-badge">
                            Default
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="address-card-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(address)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(address.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* ADDRESS DETAILS */}

                  <div className="address-details">

                    <strong>
                      {address.full_name}
                    </strong>

                    <p>
                      {address.phone}
                    </p>

                    <p>
                      {address.address_line}
                    </p>

                    <p>
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </p>

                    <p>
                      {address.country}
                    </p>

                  </div>

                  {/* SET DEFAULT */}

                  {!address.is_default && (
                    <button
                      type="button"
                      className="set-default-btn"
                      onClick={() =>
                        handleSetDefault(address.id)
                      }
                    >
                      Set as Default
                    </button>
                  )}

                </div>

              ))}

            </div>
          )
        )}

      </div>

    </div>
  );
}

export default Addresses;