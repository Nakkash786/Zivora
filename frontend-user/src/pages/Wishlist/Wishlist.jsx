import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getWishlist,
  removeFromWishlist,
} from "../../services/wishlistApi";

import "./Wishlist.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${API_BASE_URL}${
    image.startsWith("/") ? "" : "/"
  }${image}`;
}

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH WISHLIST
  // ==========================================================

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWishlist();

      setWishlist(data);
    } catch (err) {
      console.error("Wishlist error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load wishlist. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ==========================================================
  // REMOVE PRODUCT
  // ==========================================================

  const handleRemove = async (productId) => {
    try {
      setRemoving(true);

      const data = await removeFromWishlist(productId);

      if (data?.wishlist) {
        setWishlist(data.wishlist);
      } else {
        await fetchWishlist();
      }

      // Update Navbar wishlist count
      window.dispatchEvent(
        new Event("wishlistUpdated")
      );
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to remove product from wishlist."
      );
    } finally {
      setRemoving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="wishlist-spinner"></div>

          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-error">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const items = wishlist?.items || [];

  // ==========================================================
  // WISHLIST PAGE
  // ==========================================================

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="wishlist-header">
          <div>
            <h1>My Wishlist</h1>

            <p>
              {wishlist?.item_count || 0} item
              {wishlist?.item_count === 1
                ? ""
                : "s"}{" "}
              in your wishlist
            </p>
          </div>
        </div>

        {/* ==================================================
            EMPTY WISHLIST
        ================================================== */}

        {items.length === 0 ? (

          <div className="empty-wishlist">

            <div className="empty-wishlist-icon">
              ♡
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              Save your favourite products here
              and find them easily later.
            </p>

            <Link
              to="/products"
              className="continue-shopping-btn"
            >
              Explore Products
            </Link>

          </div>

        ) : (

          /* ==================================================
             WISHLIST PRODUCTS
          ================================================== */

          <div className="wishlist-grid">

            {items.map((item) => {

              const imageUrl = getImageUrl(
                item.product_image
              );

              const productAvailable =
                item.is_active !== false;

              return (
                <div
                  className="wishlist-card"
                  key={item.id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="wishlist-image-wrapper">

                    <Link
                      to={`/products/${item.product}`}
                      className="wishlist-image-link"
                    >

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          className="wishlist-image"
                        />
                      ) : (
                        <div className="wishlist-no-image">
                          No Image
                        </div>
                      )}

                    </Link>

                    {/* REMOVE BUTTON */}

                    <button
                      className="wishlist-remove-btn"
                      onClick={() =>
                        handleRemove(item.product)
                      }
                      disabled={removing}
                      aria-label="Remove from wishlist"
                      type="button"
                    >
                      ♡
                    </button>

                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="wishlist-details">

                    {item.brand_name && (
                      <p className="wishlist-brand">
                        {item.brand_name}
                      </p>
                    )}

                    <Link
                      to={`/products/${item.product}`}
                      className="wishlist-product-name"
                    >
                      {item.product_name}
                    </Link>

                    {/* PRICE */}

                    <div className="wishlist-price">

                      {item.final_price ? (
                        <>
                          <span className="wishlist-final-price">
                            ₹
                            {Number(
                              item.final_price
                            ).toLocaleString("en-IN")}
                          </span>

                          {Number(item.price) >
                            Number(item.final_price) && (
                            <span className="wishlist-old-price">
                              ₹
                              {Number(
                                item.price
                              ).toLocaleString("en-IN")}
                            </span>
                          )}

                          {item.discount_percentage >
                            0 && (
                            <span className="wishlist-discount">
                              {item.discount_percentage}% OFF
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="wishlist-final-price">
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      )}

                    </div>

                    {/* PRODUCT STATUS */}

                    {!productAvailable && (
                      <p className="wishlist-unavailable">
                        Product unavailable
                      </p>
                    )}

                    {/* VIEW PRODUCT */}

                    <Link
                      to={`/products/${item.product}`}
                      className="wishlist-view-btn"
                    >
                      View Product
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Wishlist;