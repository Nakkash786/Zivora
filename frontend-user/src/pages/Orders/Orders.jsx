import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyOrders,
  cancelOrder,
  requestReturn,
} from "../../services/orderApi";

import "./Orders.css";


// ==========================================================
// ORDER TRACKING STEPS
// ==========================================================

const TRACKING_STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    icon: "✓",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: "✓",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    icon: "⚙",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    icon: "📦",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: "🚚",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: "✓",
  },
];


// ==========================================================
// GET TRACKING INDEX
// ==========================================================

const getTrackingIndex = (status) => {
  const index = TRACKING_STEPS.findIndex(
    (step) => step.key === status
  );

  return index;
};


// ==========================================================
// ORDER TRACKING COMPONENT
// ==========================================================

function OrderTracking({ status }) {
  const currentIndex = getTrackingIndex(status);

  // Cancelled / Return statuses
  const specialStatus = [
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_REJECTED",
    "RETURNED",
  ].includes(status);

  if (specialStatus) {
    return (
      <div className="order-tracking">

        <div className="tracking-special">

          <div
            className={`tracking-special-icon ${getStatusClass(
              status
            )}`}
          >
            {status === "CANCELLED" ? "✕" : "↩"}
          </div>

          <div className="tracking-special-content">

            <strong>
              {status === "CANCELLED"
                ? "Order Cancelled"
                : status === "RETURN_REQUESTED"
                ? "Return Requested"
                : status === "RETURN_APPROVED"
                ? "Return Approved"
                : status === "RETURN_REJECTED"
                ? "Return Rejected"
                : "Order Returned"}
            </strong>

            <span>
              {status === "CANCELLED"
                ? "This order has been cancelled."
                : status === "RETURN_REQUESTED"
                ? "Your return request has been submitted."
                : status === "RETURN_APPROVED"
                ? "Your return request has been approved."
                : status === "RETURN_REJECTED"
                ? "Your return request has been rejected."
                : "This order has been returned."}
            </span>

          </div>

        </div>

        {/* Show delivery progress for return statuses */}
        {status !== "CANCELLED" && (
          <div className="tracking-steps tracking-return">

            {TRACKING_STEPS.map((step, index) => {

              const deliveredIndex = 5;

              const completed =
                index <= deliveredIndex;

              return (
                <div
                  className={`tracking-step ${
                    completed ? "completed" : ""
                  }`}
                  key={step.key}
                >

                  <div className="tracking-icon">
                    {completed
                      ? "✓"
                      : step.icon}
                  </div>

                  {index <
                    TRACKING_STEPS.length - 1 && (
                    <div
                      className={`tracking-line ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                    />
                  )}

                  <span>
                    {step.label}
                  </span>

                </div>
              );
            })}

          </div>
        )}

      </div>
    );
  }


  return (
    <div className="order-tracking">

      <div className="tracking-steps">

        {TRACKING_STEPS.map((step, index) => {

          const completed =
            currentIndex >= index;

          const active =
            currentIndex === index;

          return (
            <div
              className={`tracking-step ${
                completed ? "completed" : ""
              } ${active ? "active" : ""}`}
              key={step.key}
            >

              <div className="tracking-icon">

                {completed
                  ? "✓"
                  : step.icon}

              </div>

              {index <
                TRACKING_STEPS.length - 1 && (
                <div
                  className={`tracking-line ${
                    currentIndex > index
                      ? "completed"
                      : ""
                  }`}
                />
              )}

              <span>
                {step.label}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}


// ==========================================================
// STATUS CLASS
// ==========================================================

function getStatusClass(status) {
  return (
    status
      ?.toLowerCase()
      .replaceAll("_", "-") || ""
  );
}


// ==========================================================
// MAIN ORDERS COMPONENT
// ==========================================================

function Orders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);


  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getMyOrders();

      setOrders(
        Array.isArray(data)
          ? data
          : data?.results || []
      );

    } catch (err) {

      console.error("Orders error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
        "Unable to load your orders."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);


  // ==========================================================
  // CANCEL ORDER
  // ==========================================================

  const handleCancel = async (order) => {

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.order_number}?`
    );

    if (!confirmed) return;

    const reason =
      window.prompt(
        "Enter cancellation reason:",
        "Changed my mind"
      ) || "Cancelled by customer";


    try {

      setActionLoading(`cancel-${order.id}`);

      await cancelOrder(
        order.id,
        reason
      );

      await fetchOrders();

      alert("Order cancelled successfully.");

    } catch (err) {

      console.error(
        "Cancel order error:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to cancel order."
      );

    } finally {

      setActionLoading(null);

    }
  };


  // ==========================================================
  // RETURN ORDER
  // ==========================================================

  const handleReturn = async (order) => {

    const reason = window.prompt(
      "Enter return reason:\n\n" +
      "WRONG_ITEM\n" +
      "DAMAGED\n" +
      "DEFECTIVE\n" +
      "SIZE_ISSUE\n" +
      "COLOR_ISSUE\n" +
      "NOT_AS_EXPECTED\n" +
      "OTHER",
      "SIZE_ISSUE"
    );


    if (!reason) return;


    const validReasons = [
      "WRONG_ITEM",
      "DAMAGED",
      "DEFECTIVE",
      "SIZE_ISSUE",
      "COLOR_ISSUE",
      "NOT_AS_EXPECTED",
      "OTHER",
    ];


    const formattedReason =
      reason.trim().toUpperCase();


    if (!validReasons.includes(formattedReason)) {

      alert(
        "Invalid return reason."
      );

      return;
    }


    const note =
      window.prompt(
        "Add a note (optional):",
        ""
      ) || "";


    try {

      setActionLoading(
        `return-${order.id}`
      );

      await requestReturn(
        order.id,
        formattedReason,
        note
      );

      await fetchOrders();

      alert(
        "Return request submitted successfully."
      );

    } catch (err) {

      console.error(
        "Return request error:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to submit return request."
      );

    } finally {

      setActionLoading(null);

    }
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="orders-page">

        <div className="orders-loading">

          <div className="orders-spinner"></div>

          <p>
            Loading your orders...
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="orders-page">

        <div className="orders-error">

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchOrders}
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }


  // ==========================================================
  // EMPTY ORDERS
  // ==========================================================

  if (orders.length === 0) {

    return (
      <div className="orders-page">

        <div className="orders-container">

          <div className="orders-header">

            <div>
              <h1>
                My Orders
              </h1>

              <p>
                Track and manage your orders
              </p>
            </div>

          </div>


          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() =>
                navigate("/products")
              }
              className="shop-now-btn"
            >
              Start Shopping
            </button>

          </div>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ORDERS PAGE
  // ==========================================================

  return (
    <div className="orders-page">

      <div className="orders-container">

        {/* HEADER */}

        <div className="orders-header">

          <div>

            <h1>
              My Orders
            </h1>

            <p>
              Track and manage your orders
            </p>

          </div>

          <span className="orders-count">
            {orders.length} order
            {orders.length === 1 ? "" : "s"}
          </span>

        </div>


        {/* ORDER LIST */}

        <div className="orders-list">

          {orders.map((order) => (

            <div
              className="order-card"
              key={order.id}
            >

              {/* ORDER HEADER */}

              <div className="order-card-header">

                <div className="order-basic-info">

                  <div>

                    <span className="info-label">
                      Order
                    </span>

                    <strong>
                      {order.order_number}
                    </strong>

                  </div>


                  <div>

                    <span className="info-label">
                      Ordered on
                    </span>

                    <span>
                      {formatDate(
                        order.created_at
                      )}
                    </span>

                  </div>

                </div>


                <span
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status
                    ?.replaceAll("_", " ")}
                </span>

              </div>


              {/* ==================================================
                  ORDER TRACKING
              ================================================== */}

              <OrderTracking
                status={order.status}
              />


              {/* ORDER ITEMS */}

              <div className="order-items">

                {order.items?.map((item) => (

                  <div
                    className="order-item"
                    key={item.id}
                  >

                    <div className="order-item-image">

                      {item.product_image ? (

                        <img
                          src={item.product_image}
                          alt={
                            item.product_name
                          }
                        />

                      ) : (

                        <div className="order-image-placeholder">
                          👕
                        </div>

                      )}

                    </div>


                    <div className="order-item-info">

                      <h3>
                        {item.product_name}
                      </h3>

                      {item.brand_name && (
                        <p>
                          {item.brand_name}
                        </p>
                      )}

                      <div className="item-variant">

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

                        <span>
                          Qty:{" "}
                          <strong>
                            {item.quantity}
                          </strong>
                        </span>

                      </div>

                    </div>


                    <div className="order-item-price">

                      ₹
                      {Number(
                        item.total_price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </div>

                  </div>

                ))}

              </div>


              {/* FOOTER */}

              <div className="order-card-footer">

                <div className="order-payment">

                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.payment_method ===
                    "COD"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </strong>

                  <span
                    className={`payment-status ${getStatusClass(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status
                      ?.replaceAll(
                        "_",
                        " "
                      )}
                  </span>

                </div>


                <div className="order-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="order-actions">

                <button
                  className="details-btn"
                  onClick={() =>
                    navigate(
                      `/orders/${order.id}`
                    )
                  }
                >
                  Track / View Details
                </button>


                {[
                  "PENDING",
                  "CONFIRMED",
                  "PROCESSING",
                ].includes(order.status) && (

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      handleCancel(order)
                    }
                    disabled={
                      actionLoading ===
                      `cancel-${order.id}`
                    }
                  >

                    {actionLoading ===
                    `cancel-${order.id}`
                      ? "Cancelling..."
                      : "Cancel Order"}

                  </button>

                )}


                {order.status ===
                  "DELIVERED" && (

                  <button
                    className="return-btn"
                    onClick={() =>
                      handleReturn(order)
                    }
                    disabled={
                      actionLoading ===
                      `return-${order.id}`
                    }
                  >

                    {actionLoading ===
                    `return-${order.id}`
                      ? "Submitting..."
                      : "Return Order"}

                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}


export default Orders;