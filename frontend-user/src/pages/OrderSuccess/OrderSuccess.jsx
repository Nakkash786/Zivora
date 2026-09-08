import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-success-page">
        <div className="order-success-card">
          <div className="success-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p>
            Your order has been placed successfully.
          </p>

          <div className="success-buttons">
            <button
              onClick={() => navigate("/orders")}
              className="view-orders-btn"
            >
              View My Orders
            </button>

            <button
              onClick={() => navigate("/products")}
              className="continue-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-success-card">

        <div className="success-icon">
          ✓
        </div>

        <h1>
          Order Placed Successfully!
        </h1>

        <p className="success-message">
          Thank you for shopping with Zivora.
        </p>

        <div className="order-number-box">
          <span>Order Number</span>

          <strong>
            {order.order_number}
          </strong>
        </div>

        <div className="success-details">

          <div className="detail-row">
            <span>Items</span>

            <strong>
              {order.items?.length || 0}
            </strong>
          </div>

          <div className="detail-row">
            <span>Payment</span>

            <strong>
              {order.payment_method === "COD"
                ? "Cash on Delivery"
                : "Online Payment"}
            </strong>
          </div>

          <div className="detail-row total-row">
            <span>Total Amount</span>

            <strong>
              ₹
              {Number(
                order.total_amount || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        <div className="delivery-info">

          <h3>
            Delivery Address
          </h3>

          <p>
            <strong>
              {order.full_name}
            </strong>
          </p>

          <p>
            {order.address_line}
          </p>

          <p>
            {order.city}, {order.state} -{" "}
            {order.pincode}
          </p>

          <p>
            {order.country}
          </p>

          <p>
            📞 {order.phone}
          </p>

        </div>

        <div className="success-buttons">

          <button
            onClick={() => navigate("/orders")}
            className="view-orders-btn"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/products")}
            className="continue-btn"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;