import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Reviews.css";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      if (rating) {
        params.append("rating", rating);
      }

      const response = await api.get(
        `/reviews/admin/?${params.toString()}`
      );

      setReviews(response.data);
    } catch (err) {
      console.error("Reviews Error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [status, rating]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchReviews();
  };

  const getUserName = (review) => {
    return (
      review.user_name ||
      review.user_email ||
      "Customer"
    );
  };

  const getInitial = (review) => {
    return getUserName(review)
      .charAt(0)
      .toUpperCase();
  };

  const getStatusClass = (reviewStatus) => {
    switch (reviewStatus) {
      case "APPROVED":
        return "review-status approved";

      case "REJECTED":
        return "review-status rejected";

      default:
        return "review-status pending";
    }
  };

  const renderStars = (value) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= value
                ? "star active"
                : "star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-page">

      {/* HEADER */}

      <div className="reviews-header">
        <div>
          <h1>Reviews</h1>
          <p>
            Manage customer product reviews
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="reviews-filters">

        <form
          className="review-search"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search customer, product or review..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={rating}
          onChange={(event) =>
            setRating(event.target.value)
          }
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

      </div>

      {/* ERROR */}

      {error && (
        <div className="reviews-error">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="reviews-loading">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">
          <h3>No reviews found</h3>
          <p>
            There are no reviews matching your filters.
          </p>
        </div>
      ) : (

        /* REVIEWS TABLE */

        <div className="reviews-table-wrapper">

          <table className="reviews-table">

            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {reviews.map((review) => (

                <tr key={review.id}>

                  {/* CUSTOMER */}

                  <td>

                    <div className="review-customer">

                      <div className="review-avatar">

                        {review.user_profile_image ? (
                          <img
                            src={
                              review.user_profile_image
                            }
                            alt={getUserName(review)}
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
                          {getInitial(review)}
                        </span>

                      </div>

                      <div>
                        <strong>
                          {getUserName(review)}
                        </strong>

                        <small>
                          {review.user_email || "-"}
                        </small>
                      </div>

                    </div>

                  </td>

                  {/* PRODUCT */}

                  <td>

                    <div className="review-product">

                      <div className="review-product-image">

                        {review.product_image ? (
                          <img
                            src={review.product_image}
                            alt={review.product_name}
                          />
                        ) : (
                          <span>No Image</span>
                        )}

                      </div>

                      <span>
                        {review.product_name || "-"}
                      </span>

                    </div>

                  </td>

                  {/* RATING */}

                  <td>
                    {renderStars(review.rating)}
                  </td>

                  {/* REVIEW */}

                  <td>

                    <div className="review-content">

                      {review.title && (
                        <strong>
                          {review.title}
                        </strong>
                      )}

                      <p>
                        {review.comment}
                      </p>

                    </div>

                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={getStatusClass(
                        review.status
                      )}
                    >
                      {review.status}
                    </span>

                  </td>

                  {/* DATE */}

                  <td>

                    {review.created_at
                      ? new Date(
                          review.created_at
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  {/* ACTION */}

                  <td>

                    <button
                      className="review-view-btn"
                      onClick={() =>
                        navigate(
                          `/reviews/${review.id}`
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Reviews;