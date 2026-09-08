import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./CouponDetails.css";

function CouponDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "PERCENTAGE",
    discount_value: "",
    min_order_amount: "0",
    max_discount_amount: "",
    usage_limit: "",
    usage_limit_per_user: "1",
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/coupons/admin/${id}/`
      );

      const coupon = response.data;

      setForm({
        code: coupon.code || "",
        description: coupon.description || "",
        discount_type:
          coupon.discount_type || "PERCENTAGE",
        discount_value:
          coupon.discount_value || "",
        min_order_amount:
          coupon.min_order_amount || "0",
        max_discount_amount:
          coupon.max_discount_amount || "",
        usage_limit:
          coupon.usage_limit ?? "",
        usage_limit_per_user:
          coupon.usage_limit_per_user ?? "1",
        valid_from: formatDateTimeForInput(
          coupon.valid_from
        ),
        valid_until: formatDateTimeForInput(
          coupon.valid_until
        ),
        is_active: coupon.is_active,
      });
    } catch (err) {
      console.error("Coupon fetch error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");
    const hours = String(
      date.getHours()
    ).padStart(2, "0");
    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.code.trim()) {
        throw new Error(
          "Coupon code is required."
        );
      }

      if (!form.discount_value) {
        throw new Error(
          "Discount value is required."
        );
      }

      if (!form.valid_from) {
        throw new Error(
          "Valid from date is required."
        );
      }

      if (!form.valid_until) {
        throw new Error(
          "Valid until date is required."
        );
      }

      if (
        new Date(form.valid_until) <=
        new Date(form.valid_from)
      ) {
        throw new Error(
          "Valid until must be after valid from."
        );
      }

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        description:
          form.description.trim(),

        discount_type:
          form.discount_type,

        discount_value:
          form.discount_value,

        min_order_amount:
          form.min_order_amount || "0",

        max_discount_amount:
          form.max_discount_amount || null,

        usage_limit:
          form.usage_limit === ""
            ? null
            : form.usage_limit,

        usage_limit_per_user:
          form.usage_limit_per_user || "1",

        valid_from:
          new Date(
            form.valid_from
          ).toISOString(),

        valid_until:
          new Date(
            form.valid_until
          ).toISOString(),

        is_active:
          form.is_active,
      };

      if (isEdit) {
        await api.patch(
          `/coupons/admin/${id}/`,
          payload
        );

        setSuccess(
          "Coupon updated successfully."
        );
      } else {
        const response = await api.post(
          "/coupons/admin/",
          payload
        );

        setSuccess(
          "Coupon created successfully."
        );

        setTimeout(() => {
          navigate(
            `/coupons/${response.data.id}`
          );
        }, 700);
      }
    } catch (err) {
      console.error(
        "Coupon save error:",
        err
      );

      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(([field, message]) => {
              const text = Array.isArray(message)
                ? message.join(", ")
                : message;

              return `${field}: ${text}`;
            })
            .join("\n");

          setError(messages);
        } else {
          setError(String(data));
        }
      } else {
        setError(
          err.message ||
            "Failed to save coupon."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(
        `/coupons/admin/${id}/`
      );

      navigate("/coupons");
    } catch (err) {
      console.error(
        "Coupon delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete coupon."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="coupon-details-page">
        <div className="coupon-details-state">
          Loading coupon...
        </div>
      </div>
    );
  }

  return (
    <div className="coupon-details-page">

      <div className="coupon-details-header">
        <div>
          <button
            className="back-coupon-btn"
            onClick={() => navigate("/coupons")}
          >
            ← Back to Coupons
          </button>

          <h1>
            {isEdit
              ? "Edit Coupon"
              : "Create Coupon"}
          </h1>

          <p>
            {isEdit
              ? "Update coupon details and settings."
              : "Create a new discount coupon for customers."}
          </p>
        </div>

        {isEdit && (
          <button
            className="delete-coupon-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete Coupon"}
          </button>
        )}
      </div>

      {error && (
        <div className="coupon-form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="coupon-form-success">
          {success}
        </div>
      )}

      <form
        className="coupon-form"
        onSubmit={handleSubmit}
      >

        <div className="coupon-form-card">

          <h2>Basic Information</h2>

          <div className="coupon-form-grid">

            <div className="coupon-field">
              <label>
                Coupon Code *
              </label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. ZIVORA20"
                maxLength={50}
              />

              <small>
                Customers will enter this code at checkout.
              </small>
            </div>

            <div className="coupon-field">
              <label>
                Discount Type *
              </label>

              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
              >
                <option value="PERCENTAGE">
                  Percentage
                </option>

                <option value="FIXED">
                  Fixed Amount
                </option>
              </select>
            </div>

            <div className="coupon-field">
              <label>
                Discount Value *
              </label>

              <input
                type="number"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder={
                  form.discount_type ===
                  "PERCENTAGE"
                    ? "20"
                    : "500"
                }
              />
            </div>

            <div className="coupon-field">
              <label>
                Minimum Order Amount
              </label>

              <input
                type="number"
                name="min_order_amount"
                value={form.min_order_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            {form.discount_type ===
              "PERCENTAGE" && (
              <div className="coupon-field">
                <label>
                  Maximum Discount Amount
                </label>

                <input
                  type="number"
                  name="max_discount_amount"
                  value={
                    form.max_discount_amount
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                />

                <small>
                  Leave empty for unlimited.
                </small>
              </div>
            )}

            <div className="coupon-field">
              <label>
                Usage Limit
              </label>

              <input
                type="number"
                name="usage_limit"
                value={form.usage_limit}
                onChange={handleChange}
                min="1"
                placeholder="Unlimited"
              />

              <small>
                Leave empty for unlimited usage.
              </small>
            </div>

            <div className="coupon-field">
              <label>
                Usage Limit Per User
              </label>

              <input
                type="number"
                name="usage_limit_per_user"
                value={
                  form.usage_limit_per_user
                }
                onChange={handleChange}
                min="1"
              />
            </div>

          </div>

          <div className="coupon-field full-width">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe this coupon..."
              rows="4"
            />
          </div>

        </div>

        <div className="coupon-form-card">

          <h2>Validity</h2>

          <div className="coupon-form-grid">

            <div className="coupon-field">
              <label>
                Valid From *
              </label>

              <input
                type="datetime-local"
                name="valid_from"
                value={form.valid_from}
                onChange={handleChange}
              />
            </div>

            <div className="coupon-field">
              <label>
                Valid Until *
              </label>

              <input
                type="datetime-local"
                name="valid_until"
                value={form.valid_until}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        <div className="coupon-form-card">

          <h2>Status</h2>

          <label className="coupon-toggle">

            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />

            <span className="coupon-toggle-slider"></span>

            <span>
              {form.is_active
                ? "Coupon is Active"
                : "Coupon is Inactive"}
            </span>

          </label>

        </div>

        <div className="coupon-form-actions">

          <button
            type="button"
            className="cancel-coupon-btn"
            onClick={() =>
              navigate("/coupons")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-coupon-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Coupon"
              : "Create Coupon"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default CouponDetails;