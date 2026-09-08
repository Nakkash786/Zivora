import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCart } from "../../services/cartApi";

import {
  getAddresses,
  createOrder,
  verifyRazorpayPayment,
  markRazorpayPaymentFailed,
} from "../../services/orderApi";

import { validateCoupon } from "../../services/couponApi";

import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // ==========================================================
  // COUPON STATES
  // ==========================================================

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  // ==========================================================
  // PAGE STATES
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================================

  useEffect(() => {
    if (window.Razorpay) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      console.log("Razorpay checkout script loaded.");
    };

    script.onerror = () => {
      console.error(
        "Unable to load Razorpay checkout script."
      );
    };

    document.body.appendChild(script);

    return () => {
      // Do not remove Razorpay script here.
      // It can be reused if the component renders again.
    };
  }, []);

  // ==========================================================
  // LOAD CHECKOUT DATA
  // ==========================================================

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);
        setError("");

        const [cartData, addressData] =
          await Promise.all([
            getCart(),
            getAddresses(),
          ]);

        setCart(cartData);

        const addressList = Array.isArray(addressData)
          ? addressData
          : addressData?.results || [];

        setAddresses(addressList);

        const defaultAddress = addressList.find(
          (address) => address.is_default
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0].id);
        }
      } catch (err) {
        console.error(
          "Checkout loading error:",
          err
        );

        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [navigate]);

  // ==========================================================
  // APPLY COUPON
  // ==========================================================

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    if (appliedCoupon) {
      setCouponError("A coupon is already applied.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const subtotal = Number(cart?.subtotal || 0);

      const response = await validateCoupon(
        code,
        subtotal
      );

      if (response?.valid === false) {
        setCouponError(
          response?.message ||
            response?.detail ||
            "This coupon is not valid."
        );
        return;
      }

      const discount = Number(
        response?.discount_amount || 0
      );

      setAppliedCoupon({
        id: response?.coupon_id,
        code:
          response?.code ||
          code.toUpperCase(),

        discountType:
          response?.discount_type || "",

        discountValue:
          response?.discount_value || 0,
      });

      setCouponDiscount(discount);

      setCouponMessage(
        response?.message ||
          "Coupon applied successfully."
      );

      setCouponCode("");
    } catch (err) {
      console.error(
        "Coupon validation error:",
        err
      );

      setCouponError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ==========================================================
  // REMOVE COUPON
  // ==========================================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");
  };

  // ==========================================================
  // HANDLE RAZORPAY PAYMENT
  // ==========================================================

  const handleRazorpayPayment = async (
    orderResponse
  ) => {
    console.log(
      "Razorpay backend response:",
      orderResponse
    );

    // --------------------------------------------------------
    // CHECK RAZORPAY SCRIPT
    // --------------------------------------------------------

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay payment system is not loaded. Please refresh the page and try again."
      );
    }

    // --------------------------------------------------------
    // IMPORTANT
    //
    // ACTUAL BACKEND RESPONSE:
    //
    // {
    //   order_id: 18,
    //   order_number: "...",
    //   razorpay: {
    //     id: "...",
    //     amount: 59900,
    //     currency: "INR"
    //   },
    //   razorpay_key: "...",
    //   total_amount: "599.00"
    // }
    //
    // --------------------------------------------------------

    const razorpayOrder =
      orderResponse?.razorpay;

    const razorpayOrderId =
      razorpayOrder?.id;

    const razorpayKey =
      orderResponse?.razorpay_key;

    const razorpayAmount =
      razorpayOrder?.amount;

    const razorpayCurrency =
      razorpayOrder?.currency || "INR";

    const localOrderId =
      orderResponse?.order_id;

    const orderNumber =
      orderResponse?.order_number;

    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log(
      "Local Django Order ID:",
      localOrderId
    );

    console.log(
      "Razorpay Order ID:",
      razorpayOrderId
    );

    console.log(
      "Razorpay Key:",
      razorpayKey
    );

    console.log(
      "Razorpay Amount:",
      razorpayAmount
    );

    console.log(
      "Razorpay Currency:",
      razorpayCurrency
    );

    // --------------------------------------------------------
    // VALIDATE RESPONSE
    // --------------------------------------------------------

    if (!localOrderId) {
      throw new Error(
        "Local order ID is missing from server response."
      );
    }

    if (!razorpayOrderId) {
      throw new Error(
        "Razorpay order ID is missing from server response."
      );
    }

    if (!razorpayKey) {
      throw new Error(
        "Razorpay key is missing from server response."
      );
    }

    if (!razorpayAmount) {
      throw new Error(
        "Razorpay amount is missing from server response."
      );
    }

    // ========================================================
    // CREATE RAZORPAY CHECKOUT
    // ========================================================

    return new Promise(
      (resolve, reject) => {
        let paymentCompleted = false;
        let paymentFailed = false;

        const options = {
          key: razorpayKey,

          amount: razorpayAmount,

          currency: razorpayCurrency,

          name: "Zivora",

          description: orderNumber
            ? `Order ${orderNumber}`
            : "Zivora Order",

          // Razorpay's order ID
          order_id: razorpayOrderId,

          handler: async function (
            paymentResponse
          ) {
            console.log(
              "Razorpay success response:",
              paymentResponse
            );

            paymentCompleted = true;

            try {
              // =================================================
              // VERIFY PAYMENT WITH DJANGO
              // =================================================

              const verificationResponse =
                await verifyRazorpayPayment({
                  // LOCAL DJANGO ORDER ID
                  orderId: localOrderId,

                  // RAZORPAY ORDER ID
                  razorpayOrderId:
                    paymentResponse?.razorpay_order_id ||
                    razorpayOrderId,

                  // RAZORPAY PAYMENT ID
                  razorpayPaymentId:
                    paymentResponse?.razorpay_payment_id,

                  // RAZORPAY SIGNATURE
                  razorpaySignature:
                    paymentResponse?.razorpay_signature,
                });

              console.log(
                "Payment verification response:",
                verificationResponse
              );

              resolve(
                verificationResponse
              );
            } catch (err) {
              console.error(
                "Razorpay verification error:",
                err
              );

              reject(err);
            }
          },

          prefill: {
            name:
              orderResponse?.order
                ?.full_name ||
              orderResponse?.full_name ||
              "",

            contact:
              orderResponse?.order
                ?.phone ||
              orderResponse?.phone ||
              "",
          },

          notes: {
            order_number:
              orderNumber || "",
          },

          theme: {
            color: "#111111",
          },

          modal: {
            ondismiss: function () {
              /*
               * Closing the Razorpay window is NOT
               * automatically treated as payment failure.
               */

              if (
                !paymentCompleted &&
                !paymentFailed
              ) {
                reject(
                  new Error(
                    "Payment window was closed. Your order is still pending payment."
                  )
                );
              }
            },
          },
        };

        // ========================================================
        // CREATE RAZORPAY INSTANCE
        // ========================================================

        const razorpay =
          new window.Razorpay(options);

        // ========================================================
        // PAYMENT FAILED
        // ========================================================

        razorpay.on(
          "payment.failed",
          async function (response) {
            paymentFailed = true;

            console.error(
              "Razorpay payment failed:",
              response
            );

            try {
              await markRazorpayPaymentFailed({
                orderId: localOrderId,

                razorpayOrderId:
                  razorpayOrderId,

                reason:
                  response?.error
                    ?.description ||
                  "Razorpay payment failed.",

                note:
                  response?.error?.reason ||
                  "",
              });
            } catch (err) {
              console.error(
                "Failed to notify backend about payment failure:",
                err
              );
            }

            reject(
              new Error(
                response?.error
                  ?.description ||
                  "Payment failed. Please try again."
              )
            );
          }
        );

        // ========================================================
        // OPEN RAZORPAY
        // ========================================================

        razorpay.open();
      }
    );
  };

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const handlePlaceOrder = async () => {
    setError("");

    if (!selectedAddress) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      // --------------------------------------------------------
      // ORDER DATA
      // --------------------------------------------------------

      const orderData = {
        address_id: selectedAddress,

        payment_method:
          paymentMethod,
      };

      if (appliedCoupon?.id) {
        orderData.coupon_id =
          appliedCoupon.id;
      }

      console.log(
        "Creating order:",
        orderData
      );

      // --------------------------------------------------------
      // CREATE BACKEND ORDER
      // --------------------------------------------------------

      const response =
        await createOrder(orderData);

      console.log(
        "Create order response:",
        response
      );

      // ========================================================
      // COD
      // ========================================================

      if (paymentMethod === "COD") {
        window.dispatchEvent(
          new Event("cartUpdated")
        );

        navigate("/order-success", {
          state: {
            order: response?.order,
          },
        });

        return;
      }

      // ========================================================
      // ONLINE PAYMENT
      // ========================================================

      if (paymentMethod === "ONLINE") {
        try {
          const verifiedOrder =
            await handleRazorpayPayment(
              response
            );

          console.log(
            "Verified order:",
            verifiedOrder
          );

          window.dispatchEvent(
            new Event("cartUpdated")
          );

          navigate("/order-success", {
            state: {
              order:
                verifiedOrder?.order ||
                null,

              orderId:
                response?.order_id,

              orderNumber:
                response?.order_number,
            },
          });
        } catch (paymentError) {
          console.error(
            "Razorpay payment error:",
            paymentError
          );

          setError(
            paymentError?.response
              ?.data?.detail ||
              paymentError?.response
                ?.data?.message ||
              paymentError?.message ||
              "Payment was not completed. Please try again."
          );
        }

        return;
      }

      setError(
        "Invalid payment method."
      );
    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">
          Loading checkout...
        </div>
      </div>
    );
  }

  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="empty-icon">
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add some products to your cart
            before checkout.
          </p>

          <button
            onClick={() => navigate("/")}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // TOTALS
  // ==========================================================

  const subtotal = Number(
    cart.subtotal || 0
  );

  const shipping = Number(
    cart.shipping_charge || 0
  );

  const cartDiscount = Number(
    cart.discount || 0
  );

  const totalDiscount =
    cartDiscount +
    couponDiscount;

  const total = Math.max(
    0,
    subtotal +
      shipping -
      totalDiscount
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* HEADER */}

        <div className="checkout-header">
          <button
            className="back-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            ← Back to Cart
          </button>

          <h1>Checkout</h1>

          <p>
            Complete your order securely
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-grid">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="checkout-left">

            {/* DELIVERY ADDRESS */}

            <section className="checkout-card">

              <div className="card-title">
                <div>
                  <span className="step-number">
                    1
                  </span>

                  <div>
                    <h2>
                      Delivery Address
                    </h2>

                    <p>
                      Select where you want
                      your order delivered
                    </p>
                  </div>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="no-address">

                  <div className="no-address-icon">
                    📍
                  </div>

                  <h3>
                    No saved address
                  </h3>

                  <p>
                    Add a delivery address
                    to continue.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/profile")
                    }
                    className="add-address-btn"
                  >
                    Add Address
                  </button>

                </div>
              ) : (
                <div className="address-list">

                  {addresses.map(
                    (address) => (
                      <label
                        key={address.id}
                        className={`address-option ${
                          selectedAddress ===
                          address.id
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={
                            selectedAddress ===
                            address.id
                          }
                          onChange={() =>
                            setSelectedAddress(
                              address.id
                            )
                          }
                        />

                        <div className="address-content">

                          <div className="address-top">

                            <strong>
                              {
                                address.full_name
                              }
                            </strong>

                            {address.is_default && (
                              <span className="default-badge">
                                DEFAULT
                              </span>
                            )}

                            <span className="address-type">
                              {
                                address.address_type
                              }
                            </span>

                          </div>

                          <p>
                            {
                              address.address_line
                            }
                          </p>

                          <p>
                            {address.city},{" "}
                            {address.state} -{" "}
                            {address.pincode}
                          </p>

                          <p>
                            {address.country}
                          </p>

                          <p className="address-phone">
                            📞{" "}
                            {address.phone}
                          </p>

                        </div>
                      </label>
                    )
                  )}

                  <button
                    onClick={() =>
                      navigate("/profile")
                    }
                    className="manage-address-btn"
                  >
                    + Manage Addresses
                  </button>

                </div>
              )}

            </section>

            {/* PAYMENT METHOD */}

            <section className="checkout-card">

              <div className="card-title">
                <div>
                  <span className="step-number">
                    2
                  </span>

                  <div>
                    <h2>
                      Payment Method
                    </h2>

                    <p>
                      Choose your preferred
                      payment method
                    </p>
                  </div>
                </div>
              </div>

              <div className="payment-options">

                {/* COD */}

                <label
                  className={`payment-option ${
                    paymentMethod === "COD"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={() =>
                      setPaymentMethod("COD")
                    }
                  />

                  <div className="payment-icon">
                    💵
                  </div>

                  <div className="payment-content">

                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order
                      arrives
                    </span>

                  </div>
                </label>

                {/* ONLINE */}

                <label
                  className={`payment-option ${
                    paymentMethod === "ONLINE"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={
                      paymentMethod === "ONLINE"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "ONLINE"
                      )
                    }
                  />

                  <div className="payment-icon">
                    💳
                  </div>

                  <div className="payment-content">

                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      UPI, Card, Net Banking
                    </span>

                  </div>

                  <span className="coming-soon">
                    Razorpay
                  </span>

                </label>

              </div>

            </section>

            {/* ORDER ITEMS */}

            <section className="checkout-card">

              <div className="card-title">
                <div>
                  <span className="step-number">
                    3
                  </span>

                  <div>
                    <h2>
                      Order Items
                    </h2>

                    <p>
                      {
                        cart.items.length
                      }{" "}
                      item(s) in your order
                    </p>
                  </div>
                </div>
              </div>

              <div className="checkout-items">

                {cart.items.map(
                  (item) => (
                    <div
                      className="checkout-item"
                      key={item.id}
                    >

                      <div className="checkout-item-image">

                        {item.product_image ? (
                          <img
                            src={
                              item.product_image
                            }
                            alt={
                              item.product_name
                            }
                          />
                        ) : (
                          <div className="image-placeholder">
                            👕
                          </div>
                        )}

                      </div>

                      <div className="checkout-item-info">

                        <h3>
                          {
                            item.product_name
                          }
                        </h3>

                        <p>
                          {
                            item.variant_color ||
                            item.color ||
                            ""
                          }
                          {" / "}
                          {
                            item.variant_size ||
                            item.size ||
                            ""
                          }
                        </p>

                        <span>
                          Qty:{" "}
                          {item.quantity}
                        </span>

                      </div>

                      <div className="checkout-item-price">
                        ₹
                        {Number(
                          item.total_price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="checkout-right">

            <div className="summary-card">

              <h2>
                Order Summary
              </h2>

              {/* COUPON */}

              <div className="coupon-section">

                <div className="coupon-title">

                  <span className="coupon-icon">
                    🎟️
                  </span>

                  <div>
                    <strong>
                      Have a coupon?
                    </strong>

                    <p>
                      Apply your coupon
                      code
                    </p>
                  </div>

                </div>

                {appliedCoupon ? (
                  <div className="applied-coupon">

                    <div className="applied-coupon-info">

                      <span className="applied-coupon-icon">
                        ✓
                      </span>

                      <div>
                        <strong>
                          {
                            appliedCoupon.code
                          }
                        </strong>

                        <span>
                          Coupon applied
                        </span>
                      </div>

                    </div>

                    <button
                      type="button"
                      className="remove-coupon-btn"
                      onClick={
                        handleRemoveCoupon
                      }
                    >
                      Remove
                    </button>

                  </div>
                ) : (
                  <div className="coupon-input-row">

                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => {
                        setCouponCode(
                          event.target.value
                        );

                        setCouponError("");
                        setCouponMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Enter coupon code"
                      maxLength={50}
                      disabled={
                        couponLoading
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        handleApplyCoupon
                      }
                      disabled={
                        couponLoading ||
                        !couponCode.trim()
                      }
                    >
                      {couponLoading
                        ? "Applying..."
                        : "Apply"}
                    </button>

                  </div>
                )}

                {couponMessage && (
                  <div className="coupon-success">
                    ✓ {couponMessage}
                  </div>
                )}

                {couponError && (
                  <div className="coupon-error">
                    {couponError}
                  </div>
                )}

              </div>

              <div className="summary-divider" />

              {/* SUBTOTAL */}

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              {/* SHIPPING */}

              <div className="summary-row">

                <span>
                  Shipping
                </span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping.toLocaleString(
                        "en-IN"
                      )}`}
                </strong>

              </div>

              {/* CART DISCOUNT */}

              {cartDiscount > 0 && (
                <div className="summary-row discount">

                  <span>
                    Discount
                  </span>

                  <strong>
                    -₹
                    {cartDiscount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>
              )}

              {/* COUPON DISCOUNT */}

              {couponDiscount > 0 && (
                <div className="summary-row discount">

                  <span>
                    Coupon Discount
                  </span>

                  <strong>
                    -₹
                    {couponDiscount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>
              )}

              <div className="summary-divider" />

              {/* TOTAL */}

              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              {/* PLACE ORDER */}

              <button
                className="place-order-btn"
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  placingOrder ||
                  !selectedAddress
                }
              >
                {placingOrder
                  ? paymentMethod ===
                    "ONLINE"
                    ? "Opening Payment..."
                    : "Placing Order..."
                  : paymentMethod ===
                    "ONLINE"
                  ? "Pay Now"
                  : "Place Order"}
              </button>

              <div className="secure-checkout">
                🔒 Secure Checkout
              </div>

              <div className="checkout-note">

                <strong>
                  Delivery information
                </strong>

                <p>
                  Your order will be
                  delivered to the
                  selected address.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;