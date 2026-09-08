import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductReviews,
  createReview,
} from "../../services/reviewsApi";
import "./Reviews.css";

function Reviews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // REVIEW FORM
  // ==========================================================

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  // ==========================================================
  // FETCH REVIEWS
  // ==========================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductReviews(id);

      // Backend may return either:
      // [ ...reviews ]
      // or { results: [ ...reviews ] }

      if (Array.isArray(response)) {
        setReviews(response);
      } else if (Array.isArray(response?.results)) {
        setReviews(response.results);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Reviews fetch error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // ==========================================================
  // LOGIN CHECK
  // ==========================================================

  const handleWriteReview = () => {
    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    setFormError("");
    setSuccessMessage("");

    const reviewForm =
      document.getElementById("review-form");

    if (reviewForm) {
      reviewForm.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // ==========================================================
  // STAR SELECT
  // ==========================================================

  const handleRatingSelect = (value) => {
    setRating(value);
    setFormError("");
  };

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!rating || rating < 1 || rating > 5) {
      setFormError(
        "Please select a rating."
      );
      return;
    }

    if (!comment.trim()) {
      setFormError(
        "Please write your review."
      );
      return;
    }

    // --------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------

    try {
      setSubmitting(true);

      const reviewData = {
        product: Number(id),
        rating: rating,
        title: title.trim(),
        comment: comment.trim(),
      };

      await createReview(reviewData);

      setTitle("");
      setComment("");
      setRating(5);

      setSuccessMessage(
        "Your review has been submitted and is waiting for approval."
      );

      // Refresh approved reviews
      await fetchReviews();
    } catch (err) {
      console.error(
        "Create review error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem("user");

        window.dispatchEvent(
          new Event("authChanged")
        );

        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });

        return;
      }

      const backendError =
        err.response?.data;

      if (
        typeof backendError?.detail ===
        "string"
      ) {
        setFormError(
          backendError.detail
        );
      } else if (
        typeof backendError === "object"
      ) {
        const firstError =
          Object.values(
            backendError
          )[0];

        if (
          Array.isArray(firstError) &&
          firstError.length > 0
        ) {
          setFormError(
            firstError[0]
          );
        } else if (
          typeof firstError === "string"
        ) {
          setFormError(
            firstError
          );
        } else {
          setFormError(
            "Unable to submit review."
          );
        }
      } else {
        setFormError(
          "Unable to submit review."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  // ==========================================================
  // IMAGE URL
  // ==========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://127.0.0.1:8000${image}`;
  };

  // ==========================================================
  // STAR DISPLAY
  // ==========================================================

  const renderStars = (value) => {
    const numericRating =
      Number(value) || 0;

    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span
              key={star}
              className={
                star <= numericRating
                  ? "star filled"
                  : "star"
              }
            >
              ★
            </span>
          )
        )}
      </div>
    );
  };

  // ==========================================================
  // AVERAGE RATING
  // ==========================================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(
                review.rating || 0
              ),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="reviews-section">
        <div className="reviews-loading">
          <div className="reviews-spinner"></div>

          <p>
            Loading reviews...
          </p>
        </div>
      </section>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="reviews-section">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="reviews-header">

        <div>
          <h2>
            Customer Reviews
          </h2>

          <p>
            See what customers think about this product.
          </p>
        </div>

        <button
          type="button"
          className="write-review-btn"
          onClick={handleWriteReview}
        >
          Write a Review
        </button>

      </div>

      {/* ====================================================
          RATING SUMMARY
      ==================================================== */}

      <div className="review-summary">

        <div className="average-rating">

          <strong>
            {averageRating}
          </strong>

          {renderStars(
            Math.round(
              Number(averageRating)
            )
          )}

          <span>
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </span>

        </div>

      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="reviews-error">
          {error}
        </div>
      )}

      {/* ====================================================
          REVIEWS LIST
      ==================================================== */}

      <div className="reviews-list">

        {reviews.length === 0 ? (
          <div className="no-reviews">

            <div className="no-reviews-icon">
              ★
            </div>

            <h3>
              No reviews yet
            </h3>

            <p>
              Be the first customer to review this product.
            </p>

            <button
              type="button"
              className="write-review-btn secondary"
              onClick={handleWriteReview}
            >
              Write the First Review
            </button>

          </div>
        ) : (
          reviews.map(
            (review) => (
              <article
                className="review-card"
                key={review.id}
              >

                {/* USER */}

                <div className="review-user">

                  {review.user_profile_image ? (
                    <img
                      src={getImageUrl(
                        review.user_profile_image
                      )}
                      alt={
                        review.user_name ||
                        "Customer"
                      }
                      className="review-avatar"
                    />
                  ) : (
                    <div className="review-avatar placeholder">
                      {(
                        review.user_name ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="review-user-info">

                    <strong>
                      {review.user_name ||
                        "Customer"}
                    </strong>

                    <span>
                      {formatDate(
                        review.created_at
                      )}
                    </span>

                  </div>

                </div>

                {/* RATING */}

                <div className="review-rating">
                  {renderStars(
                    review.rating
                  )}
                </div>

                {/* TITLE */}

                {review.title && (
                  <h3 className="review-title">
                    {review.title}
                  </h3>
                )}

                {/* COMMENT */}

                <p className="review-comment">
                  {review.comment}
                </p>

              </article>
            )
          )
        )}

      </div>

      {/* ====================================================
          REVIEW FORM
      ==================================================== */}

      <div
        className="review-form-container"
        id="review-form"
      >

        <div className="review-form-header">

          <h2>
            Write a Review
          </h2>

          <p>
            Share your experience with this product.
          </p>

        </div>

        {/* SUCCESS */}

        {successMessage && (
          <div className="review-success">
            {successMessage}
          </div>
        )}

        {/* FORM ERROR */}

        {formError && (
          <div className="review-form-error">
            {formError}
          </div>
        )}

        <form
          className="review-form"
          onSubmit={handleSubmit}
        >

          {/* RATING */}

          <div className="form-group">

            <label>
              Your Rating
            </label>

            <div className="rating-selector">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      star <= rating
                        ? "rating-star active"
                        : "rating-star"
                    }
                    onClick={() =>
                      handleRatingSelect(
                        star
                      )
                    }
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                )
              )}

            </div>

          </div>

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="review-title">
              Review Title
            </label>

            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Give your review a title"
              maxLength={200}
              disabled={submitting}
            />

          </div>

          {/* COMMENT */}

          <div className="form-group">

            <label htmlFor="review-comment">
              Your Review
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="Tell us about your experience..."
              rows={5}
              disabled={submitting}
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-review-btn"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Review"}
          </button>

        </form>

      </div>

    </section>
  );
}

export default Reviews;