import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./OrderDetails.css";


const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_REJECTED",
  "RETURNED",
];


const PAYMENT_STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
];


function getStatusClass(status) {
  return `status-badge status-${String(
    status || ""
  ).toLowerCase()}`;
}


function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}


function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
}


function OrderDetails() {

  const { orderId } = useParams();
  const navigate = useNavigate();


  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReference, setRefundReference] = useState("");


  // ==========================================================
  // FETCH ORDER
  // ==========================================================

  const fetchOrder = async () => {

    try {

      setLoading(true);
      setError("");


      const response = await api.get(
        `/orders/admin/${orderId}`
      );


      setOrder(response.data);


      setStatus(
        response.data.status || ""
      );


      setPaymentStatus(
        response.data.payment_status || ""
      );


      setRefundAmount(
        response.data.refund_amount !== null &&
        response.data.refund_amount !== undefined
          ? response.data.refund_amount
          : ""
      );


      setRefundReference(
        response.data.refund_reference || ""
      );


    } catch (err) {

      console.error(
        "Order details error:",
        err
      );


      setError(
        err.response?.data?.detail ||
          "Failed to load order details."
      );


    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  useEffect(() => {

    fetchOrder();

  }, [orderId]);


  // ==========================================================
  // SAVE ORDER
  // ==========================================================

  const handleSave = async () => {

    try {

      setSaving(true);
      setError("");


      const payload = {
        status,
        payment_status: paymentStatus,
        refund_reference: refundReference,
      };


      if (refundAmount !== "") {

        payload.refund_amount =
          refundAmount;

      }


      const response = await api.patch(
        `/orders/admin/${orderId}/`,
        payload
      );


      setOrder(
        response.data.order
      );


      setStatus(
        response.data.order.status
      );


      setPaymentStatus(
        response.data.order.payment_status
      );


      setRefundAmount(
        response.data.order.refund_amount ?? ""
      );


      setRefundReference(
        response.data.order.refund_reference || ""
      );


      alert(
        "Order updated successfully."
      );


    } catch (err) {

      console.error(
        "Update order error:",
        err
      );


      setError(
        err.response?.data?.detail ||
          "Failed to update order."
      );


    } finally {

      setSaving(false);

    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="order-details-loading">

        <div className="loading-spinner"></div>

        <p>
          Loading order...
        </p>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !order) {

    return (

      <div className="order-details-page">

        <button
          className="back-button"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to Orders
        </button>


        <div className="order-error">
          {error}
        </div>

      </div>

    );

  }


  if (!order) {
    return null;
  }


  return (

    <div className="order-details-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="order-details-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/orders")
            }
          >
            ← Back to Orders
          </button>


          <h1>
            Order #{order.order_number}
          </h1>


          <p>
            Placed on{" "}
            {formatDate(
              order.created_at
            )}
          </p>

        </div>


        <div className="order-header-status">

          <span
            className={
              getStatusClass(
                order.status
              )
            }
          >
            {order.status}
          </span>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="order-error">
          {error}
        </div>

      )}


      {/* ====================================================
          CUSTOMER + ADDRESS
      ==================================================== */}

      <div className="details-grid">


        {/* CUSTOMER */}

        <div className="details-card">

          <h2>
            Customer Details
          </h2>


          <div className="detail-row">

            <span>
              Name
            </span>

            <strong>
              {order.full_name || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Email
            </span>

            <strong>
              {order.user_email || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Phone
            </span>

            <strong>
              {order.phone || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              User ID
            </span>

            <strong>
              {order.user || "-"}
            </strong>

          </div>

        </div>


        {/* ADDRESS */}

        <div className="details-card">

          <h2>
            Delivery Address
          </h2>


          <p className="address-text">

            {order.full_name}

            <br />

            {order.address_line}

            <br />

            {order.city}, {order.state}

            <br />

            {order.pincode}

            <br />

            {order.country}

            <br />

            Phone: {order.phone}

          </p>

        </div>


      </div>


      {/* ====================================================
          PRODUCTS
      ==================================================== */}

      <div className="details-card products-card">


        <div className="card-header">

          <h2>
            Order Items
          </h2>


          <span>
            {order.items?.length || 0} item(s)
          </span>

        </div>


        <div className="order-items">


          {order.items?.map((item) => (

            <div
              className="order-item"
              key={item.id}
            >


              {/* IMAGE */}

              <div className="order-item-image">

                {item.product_image ? (

                  <img
                    src={item.product_image}
                    alt={item.product_name}
                  />

                ) : (

                  <div className="no-image">
                    No Image
                  </div>

                )}

              </div>


              {/* INFO */}

              <div className="order-item-info">

                <h3>
                  {item.product_name}
                </h3>


                <p>
                  Brand:{" "}
                  {item.brand_name || "-"}
                </p>


                <div className="item-meta">

                  <span>
                    Color:{" "}
                    {item.color || "-"}
                  </span>


                  <span>
                    Size:{" "}
                    {item.size || "-"}
                  </span>


                  <span>
                    SKU:{" "}
                    {item.sku || "-"}
                  </span>

                </div>

              </div>


              {/* QUANTITY */}

              <div className="order-item-quantity">

                Qty: {item.quantity}

              </div>


              {/* PRICE */}

              <div className="order-item-price">

                <span>
                  {formatPrice(
                    item.unit_price
                  )}
                </span>


                <strong>
                  {formatPrice(
                    item.total_price
                  )}
                </strong>

              </div>


            </div>

          ))}

        </div>

      </div>


      {/* ====================================================
          PAYMENT + SUMMARY
      ==================================================== */}

      <div className="details-grid">


        {/* PAYMENT */}

        <div className="details-card">

          <h2>
            Payment Details
          </h2>


          <div className="detail-row">

            <span>
              Payment Method
            </span>

            <strong>
              {order.payment_method || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Payment Status
            </span>


            <span
              className={
                getStatusClass(
                  order.payment_status
                )
              }
            >
              {order.payment_status}
            </span>

          </div>


          <div className="detail-row">

            <span>
              Refund Amount
            </span>

            <strong>

              {order.refund_amount !== null &&
              order.refund_amount !== undefined
                ? formatPrice(
                    order.refund_amount
                  )
                : "-"}

            </strong>

          </div>


          <div className="detail-row">

            <span>
              Refund Reference
            </span>

            <strong>
              {order.refund_reference || "-"}
            </strong>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="details-card">

          <h2>
            Order Summary
          </h2>


          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <span>
              {formatPrice(
                order.subtotal
              )}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Shipping
            </span>

            <span>
              {formatPrice(
                order.shipping_charge
              )}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Discount
            </span>

            <span>
              -{" "}
              {formatPrice(
                order.discount
              )}
            </span>

          </div>


          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              {formatPrice(
                order.total_amount
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* ====================================================
          UPDATE ORDER
      ==================================================== */}

      <div className="details-card update-card">

        <h2>
          Update Order
        </h2>


        <div className="update-grid">


          {/* ORDER STATUS */}

          <div className="form-group">

            <label>
              Order Status
            </label>


            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >

              {STATUS_OPTIONS.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                )
              )}

            </select>

          </div>


          {/* PAYMENT STATUS */}

          <div className="form-group">

            <label>
              Payment Status
            </label>


            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value
                )
              }
            >

              {PAYMENT_STATUS_OPTIONS.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                )
              )}

            </select>

          </div>


          {/* REFUND AMOUNT */}

          <div className="form-group">

            <label>
              Refund Amount
            </label>


            <input
              type="number"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(e) =>
                setRefundAmount(
                  e.target.value
                )
              }
              placeholder="0.00"
            />

          </div>


          {/* REFUND REFERENCE */}

          <div className="form-group">

            <label>
              Refund Reference
            </label>


            <input
              type="text"
              value={refundReference}
              onChange={(e) =>
                setRefundReference(
                  e.target.value
                )
              }
              placeholder="Refund reference"
            />

          </div>


        </div>


        <button
          className="save-order-button"
          onClick={handleSave}
          disabled={saving}
        >

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>


      {/* ====================================================
          CANCELLATION
      ==================================================== */}

      {order.cancellation_reason && (

        <div className="details-card">

          <h2>
            Cancellation Details
          </h2>


          <div className="detail-row">

            <span>
              Reason
            </span>

            <strong>
              {order.cancellation_reason}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Note
            </span>

            <strong>
              {order.cancellation_note || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Cancelled At
            </span>

            <strong>
              {formatDate(
                order.cancelled_at
              )}
            </strong>

          </div>

        </div>

      )}


      {/* ====================================================
          RETURN
      ==================================================== */}

      {order.return_reason && (

        <div className="details-card">

          <h2>
            Return Details
          </h2>


          <div className="detail-row">

            <span>
              Reason
            </span>

            <strong>
              {order.return_reason}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Note
            </span>

            <strong>
              {order.return_note || "-"}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Requested At
            </span>

            <strong>
              {formatDate(
                order.return_requested_at
              )}
            </strong>

          </div>


          <div className="detail-row">

            <span>
              Processed At
            </span>

            <strong>
              {formatDate(
                order.return_processed_at
              )}
            </strong>

          </div>

        </div>

      )}

    </div>

  );
}


export default OrderDetails;