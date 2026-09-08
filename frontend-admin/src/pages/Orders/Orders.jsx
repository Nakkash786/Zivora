import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./Orders.css";


function Orders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");


  // ==========================================================
  // LOAD ORDERS
  // ==========================================================

  const loadOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (paymentFilter) {
        params.payment_status = paymentFilter;
      }

      const response = await api.get(
        "/orders/admin/",
        {
          params,
        }
      );

      setOrders(response.data);

    } catch (err) {

      console.error(
        "Admin Orders Error:",
        err
      );

      if (err.response?.status === 401) {

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {

        setError(
          "You do not have permission to access orders."
        );

        return;
      }

      setError(
        err.response?.data?.detail ||
        "Unable to load orders."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadOrders();

  }, [statusFilter, paymentFilter]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (event) => {

    event.preventDefault();

    loadOrders();

  };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearch("");
    setStatusFilter("");
    setPaymentFilter("");

  };


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (status) => {

    if (!status) {
      return "order-status";
    }

    return `order-status order-status-${status.toLowerCase()}`;

  };


  // ==========================================================
  // PAYMENT CLASS
  // ==========================================================

  const getPaymentClass = (status) => {

    if (!status) {
      return "payment-status";
    }

    return `payment-status payment-${status.toLowerCase()}`;

  };


  // ==========================================================
  // DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleString(
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
  // TOTAL ITEMS
  // ==========================================================

  const getTotalItems = (order) => {

    if (!order.items) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  };


  return (

    <div className="admin-orders-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="admin-orders-header">

        <div>

          <h1>
            Orders
          </h1>

          <p>
            Manage customer orders and payments
          </p>

        </div>

        <div className="orders-count">

          <strong>
            {orders.length}
          </strong>

          <span>
            Orders
          </span>

        </div>

      </div>


      {/* ====================================================
          FILTERS
      ==================================================== */}

      <div className="orders-filter-card">

        <form
          className="orders-filter-form"
          onSubmit={handleSearch}
        >

          <div className="order-search">

            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Order number, customer, phone or email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="order-filter">

            <label>
              Order Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="PROCESSING">
                Processing
              </option>

              <option value="SHIPPED">
                Shipped
              </option>

              {/* NEW STATUS */}

              <option value="OUT_FOR_DELIVERY">
                Out for Delivery
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="RETURN_REQUESTED">
                Return Requested
              </option>

              <option value="RETURN_APPROVED">
                Return Approved
              </option>

              <option value="RETURN_REJECTED">
                Return Rejected
              </option>

              <option value="RETURNED">
                Returned
              </option>

            </select>

          </div>


          <div className="order-filter">

            <label>
              Payment
            </label>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
            >

              <option value="">
                All Payments
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="REFUND_PENDING">
                Refund Pending
              </option>

              <option value="REFUNDED">
                Refunded
              </option>

            </select>

          </div>


          <button
            type="submit"
            className="orders-search-btn"
          >
            Search
          </button>


          <button
            type="button"
            className="orders-clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>

        </form>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="orders-error">
          {error}
        </div>

      )}


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading ? (

        <div className="orders-loading">

          <div className="orders-spinner"></div>

          <p>
            Loading orders...
          </p>

        </div>

      ) : orders.length === 0 ? (

        /* ==================================================
           EMPTY
        ================================================== */

        <div className="orders-empty">

          <div className="orders-empty-icon">
            🛍
          </div>

          <h2>
            No Orders Found
          </h2>

          <p>
            There are no orders matching your filters.
          </p>

        </div>

      ) : (

        /* ==================================================
           ORDERS TABLE
        ================================================== */

        <div className="orders-table-card">

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map((order) => (

                  <tr key={order.id}>

                    {/* ORDER */}

                    <td>

                      <div className="order-number">

                        #{order.order_number}

                      </div>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-info">

                        <strong>
                          {order.full_name || "Customer"}
                        </strong>

                        <span>
                          {order.user_email ||
                            order.email ||
                            "-"}
                        </span>

                        <small>
                          {order.phone || "-"}
                        </small>

                      </div>

                    </td>


                    {/* ITEMS */}

                    <td>

                      <span className="items-count">

                        {getTotalItems(order)}

                        {getTotalItems(order) === 1
                          ? " item"
                          : " items"}

                      </span>

                    </td>


                    {/* TOTAL */}

                    <td>

                      <strong className="order-total">

                        ₹
                        {Number(
                          order.total_amount || 0
                        ).toFixed(2)}

                      </strong>

                    </td>


                    {/* PAYMENT */}

                    <td>

                      <div className="payment-info">

                        <span>
                          {order.payment_method || "-"}
                        </span>

                        <small
                          className={
                            getPaymentClass(
                              order.payment_status
                            )
                          }
                        >
                          {order.payment_status ||
                            "PENDING"}
                        </small>

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          getStatusClass(
                            order.status
                          )
                        }
                      >

                        {order.status ||
                          "PENDING"}

                      </span>

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="order-date">

                        {formatDate(
                          order.created_at
                        )}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        type="button"
                        className="view-order-btn"
                        onClick={() =>
                          navigate(
                            `/orders/${order.id}`
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

        </div>

      )}

    </div>

  );

}


export default Orders;