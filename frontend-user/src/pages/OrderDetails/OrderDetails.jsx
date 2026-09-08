import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getOrder } from "../../services/orderApi";

import "./OrderDetails.css";


// ==========================================================
// TRACKING STEPS
// ==========================================================

const TRACKING_STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    description: "Your order has been placed successfully.",
    icon: "✓",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been confirmed.",
    icon: "✓",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: "⚙",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Your order has been shipped.",
    icon: "📦",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Your order is on the way to you.",
    icon: "🚚",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: "✓",
  },
];


// ==========================================================
// STATUS INDEX
// ==========================================================

const getStatusIndex = (status) => {
  return TRACKING_STEPS.findIndex(
    (step) => step.key === status
  );
};


// ==========================================================
// MAIN COMPONENT
// ==========================================================

const OrderDetails = () => {

  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  useEffect(() => {

    const loadOrder = async () => {

      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }


      try {

        setLoading(true);
        setError("");

        const response = await getOrder(orderId);

        console.log(
          "Order Details Response:",
          response
        );

        setOrder(response);

      } catch (err) {

        console.error(
          "Order Details Error:",
          err
        );

        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }

        if (err.response?.status === 404) {
          setError("Order not found.");
          return;
        }

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load order details."
        );

      } finally {

        setLoading(false);

      }
    };


    loadOrder();

  }, [orderId, navigate]);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) return "-";

    const formattedDate = new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "-";
    }

    return formattedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (status) => {

    if (!status) return "status";

    return `status status-${status
      .toLowerCase()
      .replaceAll("_", "-")}`;
  };


  // ==========================================================
  // PAYMENT STATUS CLASS
  // ==========================================================

  const getPaymentStatusClass = (status) => {

    if (!status) return "payment-status";

    return `payment-status payment-${status
      .toLowerCase()
      .replaceAll("_", "-")}`;
  };


  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = (image) => {

    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://127.0.0.1:8000${
      image.startsWith("/")
        ? image
        : `/${image}`
    }`;
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading order details...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-error">

            <div className="error-icon">
              !
            </div>

            <h2>
              Unable to Load Order
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="back-orders-btn"
              onClick={() =>
                navigate("/orders")
              }
            >
              ← Back to Orders
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ORDER NOT FOUND
  // ==========================================================

  if (!order) {

    return (
      <div className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-error">

            <div className="error-icon">
              !
            </div>

            <h2>
              Order Not Found
            </h2>

            <p>
              We could not find the order
              you are looking for.
            </p>

            <button
              type="button"
              className="back-orders-btn"
              onClick={() =>
                navigate("/orders")
              }
            >
              ← Back to Orders
            </button>

          </div>

        </div>

      </div>
    );
  }


  const currentStatusIndex =
    getStatusIndex(order.status);

  const isCancelled =
    order.status === "CANCELLED";

  const isReturnStatus = [
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_REJECTED",
    "RETURNED",
  ].includes(order.status);


  return (
    <div className="order-details-page">

      <div className="order-details-container">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          className="back-orders-btn"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to Orders
        </button>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="order-details-header">

          <div className="order-header-left">

            <h1>
              Order Details
            </h1>

            <p>
              Order #{order.order_number}
            </p>

            <small>
              Placed on{" "}
              {formatDate(order.created_at)}
            </small>

          </div>

          <span
            className={getStatusClass(
              order.status
            )}
          >
            {order.status
              ?.replaceAll("_", " ") ||
              "PENDING"}
          </span>

        </div>


        {/* ==================================================
            ORDER TRACKING
        ================================================== */}

        <div className="details-card tracking-card">

          <div className="card-title">

            <h2>
              Order Tracking
            </h2>

            <span className="tracking-current-status">
              {order.status
                ?.replaceAll("_", " ")}
            </span>

          </div>


          {/* CANCELLED */}

          {isCancelled ? (

            <div className="special-order-status cancelled-status">

              <div className="special-status-icon">
                ✕
              </div>

              <div>

                <h3>
                  Order Cancelled
                </h3>

                <p>
                  This order has been cancelled.
                </p>

                {order.cancelled_at && (
                  <small>
                    Cancelled on{" "}
                    {formatDate(
                      order.cancelled_at
                    )}
                  </small>
                )}

              </div>

            </div>

          ) : (

            <>

              {/* MAIN TRACKING */}

              <div className="details-tracking">

                {TRACKING_STEPS.map(
                  (step, index) => {

                    const completed =
                      currentStatusIndex >= index;

                    const active =
                      currentStatusIndex === index;

                    return (
                      <div
                        className={`details-tracking-step ${
                          completed
                            ? "completed"
                            : ""
                        } ${
                          active
                            ? "active"
                            : ""
                        }`}
                        key={step.key}
                      >

                        <div className="details-tracking-marker">

                          {completed
                            ? "✓"
                            : step.icon}

                        </div>


                        {index <
                          TRACKING_STEPS.length -
                            1 && (
                          <div
                            className={`details-tracking-line ${
                              currentStatusIndex >
                              index
                                ? "completed"
                                : ""
                            }`}
                          />
                        )}


                        <div className="details-tracking-content">

                          <strong>
                            {step.label}
                          </strong>

                          <span>
                            {step.description}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>


              {/* RETURN INFORMATION */}

              {isReturnStatus && (
                <div className="return-tracking-status">

                  <div className="special-status-icon">
                    ↩
                  </div>

                  <div>

                    <h3>
                      {order.status ===
                      "RETURN_REQUESTED"
                        ? "Return Requested"
                        : order.status ===
                          "RETURN_APPROVED"
                        ? "Return Approved"
                        : order.status ===
                          "RETURN_REJECTED"
                        ? "Return Rejected"
                        : "Order Returned"}
                    </h3>

                    <p>
                      {order.status ===
                      "RETURN_REQUESTED"
                        ? "Your return request is being reviewed."
                        : order.status ===
                          "RETURN_APPROVED"
                        ? "Your return request has been approved."
                        : order.status ===
                          "RETURN_REJECTED"
                        ? "Your return request has been rejected."
                        : "Your order has been returned successfully."}
                    </p>

                  </div>

                </div>
              )}

            </>
          )}

        </div>


        {/* ==================================================
            ORDER INFORMATION
        ================================================== */}

        <div className="details-card">

          <div className="card-title">

            <h2>
              Order Information
            </h2>

          </div>


          <div className="details-grid">

            <div className="detail-item">

              <span>
                Order Number
              </span>

              <strong>
                {order.order_number || "-"}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                Order Date
              </span>

              <strong>
                {formatDate(
                  order.created_at
                )}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                Payment Method
              </span>

              <strong>
                {order.payment_method || "-"}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                Payment Status
              </span>

              <strong
                className={getPaymentStatusClass(
                  order.payment_status
                )}
              >
                {order.payment_status ||
                  "PENDING"}
              </strong>

            </div>

          </div>

        </div>


        {/* ==================================================
            DELIVERY ADDRESS
        ================================================== */}

        <div className="details-card">

          <div className="card-title">

            <h2>
              Delivery Address
            </h2>

          </div>


          <div className="address-box">

            <div className="address-name">
              {order.full_name || "-"}
            </div>

            <p>
              {order.address_line || "-"}
            </p>

            <p>
              {order.city || "-"}
              {order.state
                ? `, ${order.state}`
                : ""}
            </p>

            <p>
              {order.pincode
                ? `PIN - ${order.pincode}`
                : ""}
            </p>

            <p>
              {order.country || "India"}
            </p>

            <p className="address-phone">

              <strong>
                Phone:
              </strong>{" "}

              {order.phone || "-"}

            </p>

          </div>

        </div>


        {/* ==================================================
            ORDER ITEMS
        ================================================== */}

        <div className="details-card">

          <div className="card-title">

            <h2>
              Items
              {order.items?.length
                ? ` (${order.items.length})`
                : ""}
            </h2>

          </div>


          <div className="order-items-list">

            {order.items &&
            order.items.length > 0 ? (

              order.items.map((item) => (

                <div
                  className="order-detail-item"
                  key={item.id}
                >

                  <div className="order-detail-image">

                    {item.product_image ? (

                      <img
                        src={getProductImage(
                          item.product_image
                        )}
                        alt={
                          item.product_name ||
                          "Product"
                        }
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div className="image-placeholder">
                        No Image
                      </div>

                    )}

                  </div>


                  <div className="order-detail-info">

                    <h3>
                      {item.product_name ||
                        "Product"}
                    </h3>

                    {item.brand_name && (
                      <p>
                        <strong>
                          Brand:
                        </strong>{" "}
                        {item.brand_name}
                      </p>
                    )}

                    <p>
                      <strong>
                        Color:
                      </strong>{" "}
                      {item.color || "-"}
                    </p>

                    <p>
                      <strong>
                        Size:
                      </strong>{" "}
                      {item.size || "-"}
                    </p>

                    <p>
                      <strong>
                        SKU:
                      </strong>{" "}
                      {item.sku || "-"}
                    </p>

                    <p>
                      <strong>
                        Quantity:
                      </strong>{" "}
                      {item.quantity || 0}
                    </p>

                  </div>


                  <div className="order-detail-price">

                    <span>
                      ₹
                      {Number(
                        item.unit_price || 0
                      ).toFixed(2)}
                    </span>

                    <strong>
                      ₹
                      {Number(
                        item.total_price || 0
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>

              ))

            ) : (

              <div className="no-order-items">

                <p>
                  No items found for this order.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            PRICE DETAILS
        ================================================== */}

        <div className="details-card price-card">

          <div className="card-title">

            <h2>
              Price Details
            </h2>

          </div>


          <div className="price-row">

            <span>
              Subtotal
            </span>

            <span>
              ₹
              {Number(
                order.subtotal || 0
              ).toFixed(2)}
            </span>

          </div>


          <div className="price-row">

            <span>
              Shipping
            </span>

            <span>

              {Number(
                order.shipping_charge || 0
              ) === 0
                ? "FREE"
                : `₹${Number(
                    order.shipping_charge
                  ).toFixed(2)}`}

            </span>

          </div>


          <div className="price-row">

            <span>
              Discount
            </span>

            <span>
              ₹
              {Number(
                order.discount || 0
              ).toFixed(2)}
            </span>

          </div>


          <div className="price-divider"></div>


          <div className="price-row total-row">

            <strong>
              Total Amount
            </strong>

            <strong>
              ₹
              {Number(
                order.total_amount || 0
              ).toFixed(2)}
            </strong>

          </div>

        </div>


        {/* ==================================================
            CANCELLATION DETAILS
        ================================================== */}

        {order.status === "CANCELLED" && (
          <div className="details-card cancellation-card">

            <div className="card-title">

              <h2>
                Cancellation Details
              </h2>

            </div>

            {order.cancellation_reason && (
              <p>
                <strong>
                  Reason:
                </strong>{" "}
                {order.cancellation_reason}
              </p>
            )}

            {order.cancellation_note && (
              <p>
                <strong>
                  Note:
                </strong>{" "}
                {order.cancellation_note}
              </p>
            )}

            {order.cancelled_at && (
              <p>
                <strong>
                  Cancelled At:
                </strong>{" "}
                {formatDate(
                  order.cancelled_at
                )}
              </p>
            )}

          </div>
        )}


        {/* ==================================================
            RETURN DETAILS
        ================================================== */}

        {order.return_reason && (
          <div className="details-card return-card">

            <div className="card-title">

              <h2>
                Return Details
              </h2>

            </div>

            <p>
              <strong>
                Reason:
              </strong>{" "}
              {order.return_reason}
            </p>

            {order.return_note && (
              <p>
                <strong>
                  Note:
                </strong>{" "}
                {order.return_note}
              </p>
            )}

            {order.return_requested_at && (
              <p>
                <strong>
                  Requested At:
                </strong>{" "}
                {formatDate(
                  order.return_requested_at
                )}
              </p>
            )}

            {order.return_processed_at && (
              <p>
                <strong>
                  Processed At:
                </strong>{" "}
                {formatDate(
                  order.return_processed_at
                )}
              </p>
            )}

            {Number(
              order.refund_amount || 0
            ) > 0 && (
              <p>
                <strong>
                  Refund Amount:
                </strong>{" "}
                ₹
                {Number(
                  order.refund_amount
                ).toFixed(2)}
              </p>
            )}

            {order.refund_reference && (
              <p>
                <strong>
                  Refund Reference:
                </strong>{" "}
                {order.refund_reference}
              </p>
            )}

          </div>
        )}


        {/* ==================================================
            NOTES
        ================================================== */}

        {order.notes && (
          <div className="details-card">

            <div className="card-title">

              <h2>
                Order Notes
              </h2>

            </div>

            <p className="order-notes">
              {order.notes}
            </p>

          </div>
        )}


        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="order-details-actions">

          <button
            type="button"
            className="continue-shopping-btn"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>

          <button
            type="button"
            className="my-orders-btn"
            onClick={() =>
              navigate("/orders")
            }
          >
            My Orders
          </button>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;