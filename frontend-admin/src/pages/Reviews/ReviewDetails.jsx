import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./ReviewDetails.css";

function ReviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/reviews/admin/${id}/`
      );

      setReview(response.data);
    } catch (err) {
      console.error("Review Details Error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load review."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setActionLoading(true);

      const response = await api.patch(
        `/reviews/admin/${id}/`,
        {
          status: newStatus,
        }
      );

      setReview(response.data);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Failed to update review."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await api.delete(
        `/reviews/admin/${id}/`
      );

      navigate("/reviews");
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Failed to delete review."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") {
      return "review-detail-status approved";
    }

    if (status === "REJECTED") {
      return "review-detail-status rejected";
    }

    return "review-detail-status pending";
  };

  const getUserName = () => {
    return (
      review?.user_name ||
      review?.user_email ||
      "Customer"
    );
  };

  const getInitial = () => {
    return getUserName()
      .charAt(0)
      .toUpperCase();
  };

  const renderStars = (rating) => {
    return (
      <div className="review-detail-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "active"
                : ""
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="review-details-page">
        <div className="review-details-loading">
          Loading review...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-details-page">
        <div className="review-details-error">
          {error}
        </div>

        <button
          className="review-back-btn"
          onClick={() => navigate("/reviews")}
        >
          ← Back to Reviews
        </button>
      </div>
    );
  }

  if (!review) {
    return null;
  }

  return (
    <div className="review-details-page">

      {/* HEADER */}

      <div className="review-details-header">

        <div>
          <button
            className="review-back-btn"
            onClick={() => navigate("/reviews")}
          >
            ← Back to Reviews
          </button>

          <h1>Review Details</h1>

          <p>
            Review #{review.id}
          </p>
        </div>

        <span
          className={getStatusClass(
            review.status
          )}
        >
          {review.status}
        </span>

      </div>

      <div className="review-details-grid">

        {/* CUSTOMER */}

        <div className="review-detail-card">

          <h2>Customer</h2>

          <div className="review-detail-customer">

            <div className="review-detail-avatar">

              {review.user_profile_image ? (
                <img
                  src={review.user_profile_image}
                  alt={getUserName()}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />
              ) : null}

              <span
                style={{
                  display:
                    review.user_profile_image
                      ? "none"
                      : "flex",
                }}
              >
                {getInitial()}
              </span>

            </div>

            <div>
              <strong>
                {getUserName()}
              </strong>

              <p>
                {review.user_email || "-"}
              </p>
            </div>

          </div>

        </div>


        {/* PRODUCT */}

        <div className="review-detail-card">

          <h2>Product</h2>

          <div className="review-detail-product">

            <div className="review-detail-product-image">

              {review.product_image ? (
                <img
                  src={review.product_image}
                  alt={review.product_name}
                />
              ) : (
                <span>
                  No Image
                </span>
              )}

            </div>

            <div>
              <strong>
                {review.product_name || "-"}
              </strong>

              {review.order_number && (
                <p>
                  Order: {review.order_number}
                </p>
              )}
            </div>

          </div>

        </div>


        {/* REVIEW */}

        <div className="review-detail-card review-main-card">

          <div className="review-detail-title-row">

            <div>
              <h2>
                {review.title || "Customer Review"}
              </h2>

              <p className="review-detail-date">
                {review.created_at
                  ? new Date(
                      review.created_at
                    ).toLocaleString()
                  : "-"}
              </p>
            </div>

            {renderStars(review.rating)}

          </div>

          <div className="review-comment">
            {review.comment}
          </div>

        </div>


        {/* ADMIN NOTE */}

        <div className="review-detail-card">

          <h2>Admin Note</h2>

          <div className="review-admin-note">
            {review.admin_note
              ? review.admin_note
              : "No admin note added."}
          </div>

        </div>


        {/* ACTIONS */}

        <div className="review-detail-card review-actions-card">

          <h2>Review Actions</h2>

          <div className="review-actions">

            <button
              className="review-approve-btn"
              disabled={actionLoading}
              onClick={() =>
                updateStatus("APPROVED")
              }
            >
              ✓ Approve
            </button>

            <button
              className="review-reject-btn"
              disabled={actionLoading}
              onClick={() =>
                updateStatus("REJECTED")
              }
            >
              ✕ Reject
            </button>

            <button
              className="review-pending-btn"
              disabled={actionLoading}
              onClick={() =>
                updateStatus("PENDING")
              }
            >
              ↻ Pending
            </button>

            <button
              className="review-delete-btn"
              disabled={actionLoading}
              onClick={deleteReview}
            >
              🗑 Delete
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReviewDetails;