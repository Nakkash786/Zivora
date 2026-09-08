import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../services/cartApi";
import "./Cart.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CART
  // ==========================================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();

      setCart(data);

      // Update Navbar cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    fetchCart();
  }, []);

  // ==========================================
  // CHANGE QUANTITY
  // ==========================================

  const changeQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    if (newQuantity > item.stock) {
      alert(
        `Only ${item.stock} item${
          item.stock === 1 ? "" : "s"
        } available in stock.`
      );
      return;
    }

    try {
      setUpdating(true);

      const data = await updateCartItem(
        item.id,
        newQuantity
      );

      setCart(data);

      // Notify Navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Quantity update error:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to update quantity."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const handleRemove = async (itemId) => {
    try {
      setUpdating(true);

      const data = await removeCartItem(itemId);

      setCart(data);

      // Notify Navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove cart item error:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to remove item."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) return;

    try {
      setUpdating(true);

      const data = await clearCart();

      setCart(data);

      // Notify Navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Clear cart error:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to clear cart."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-error">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button onClick={fetchCart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  // ==========================================
  // CART PAGE
  // ==========================================

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>

            <p>
              {cart?.total_items || 0} item
              {cart?.total_items === 1 ? "" : "s"} in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              className="clear-cart-btn"
              onClick={handleClearCart}
              disabled={updating}
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* =====================================
            EMPTY CART
        ====================================== */}

        {items.length === 0 ? (
          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added anything
              to your cart yet.
            </p>

            <Link
              to="/products"
              className="continue-shopping-btn"
            >
              Continue Shopping
            </Link>

          </div>
        ) : (

          /* ===================================
             CART CONTENT
          ==================================== */

          <div className="cart-content">

            {/* =================================
                CART ITEMS
            ================================== */}

            <div className="cart-items">

              {items.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  {/* PRODUCT IMAGE */}

                  <Link
                    to={`/products/${item.product}`}
                    className="cart-product-image"
                  >
                    {item.product_image ? (
                      <img
                        src={getImageUrl(
                          item.product_image
                        )}
                        alt={item.product_name}
                      />
                    ) : (
                      <div className="no-cart-image">
                        No Image
                      </div>
                    )}
                  </Link>

                  {/* PRODUCT DETAILS */}

                  <div className="cart-product-details">

                    <Link
                      to={`/products/${item.product}`}
                      className="cart-product-name"
                    >
                      {item.product_name}
                    </Link>

                    {item.brand_name && (
                      <p className="cart-brand">
                        {item.brand_name}
                      </p>
                    )}

                    {/* VARIANT */}

                    <div className="cart-variant">

                      <span>
                        Color:{" "}
                        <strong>
                          {item.color}
                        </strong>
                      </span>

                      <span>
                        Size:{" "}
                        <strong>
                          {item.size}
                        </strong>
                      </span>

                    </div>

                    {/* PRICE */}

                    <p className="cart-price">
                      ₹
                      {Number(
                        item.unit_price
                      ).toLocaleString("en-IN")}
                    </p>

                    {/* QUANTITY */}

                    <div className="quantity-section">

                      <span className="quantity-label">
                        Quantity
                      </span>

                      <div className="quantity-control">

                        <button
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            updating ||
                            item.quantity <= 1
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            updating ||
                            item.quantity >= item.stock
                          }
                        >
                          +
                        </button>

                      </div>

                      <span className="stock-text">
                        {item.stock} available
                      </span>

                    </div>

                    {/* REMOVE */}

                    <button
                      className="remove-item-btn"
                      onClick={() =>
                        handleRemove(item.id)
                      }
                      disabled={updating}
                    >
                      Remove
                    </button>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="cart-item-total">
                    ₹
                    {Number(
                      item.total_price
                    ).toLocaleString("en-IN")}
                  </div>

                </div>

              ))}

            </div>

            {/* =================================
                ORDER SUMMARY
            ================================== */}

            <div className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>

                <span>
                  {cart?.total_items || 0}
                </span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>
                  ₹
                  {Number(
                    cart?.subtotal || 0
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="summary-row">

                <span>
                  Delivery
                </span>

                <span className="free-text">
                  FREE
                </span>

              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">

                <span>
                  Total
                </span>

                <span>
                  ₹
                  {Number(
                    cart?.subtotal || 0
                  ).toLocaleString("en-IN")}
                </span>

              </div>

              {/* CHECKOUT */}

              <button
                className="checkout-btn"
                onClick={() =>
                  navigate("/checkout")
                }
                disabled={updating}
              >
                Proceed to Checkout
              </button>

              {/* CONTINUE SHOPPING */}

              <Link
                to="/products"
                className="continue-shopping-link"
              >
                ← Continue Shopping
              </Link>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Cart;