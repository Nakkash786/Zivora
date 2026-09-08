import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Dashboard.css";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/admin/dashboard/"
      );

      setStats(response.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back! Here's what's happening
            with your store.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchDashboardStats}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Main Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">🛍️</div>

          <div className="stat-content">
            <span>Total Orders</span>
            <strong>
              {stats?.total_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>

          <div className="stat-content">
            <span>Pending Orders</span>
            <strong>
              {stats?.pending_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚙️</div>

          <div className="stat-content">
            <span>Processing</span>
            <strong>
              {stats?.processing_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚚</div>

          <div className="stat-content">
            <span>Shipped</span>
            <strong>
              {stats?.shipped_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>

          <div className="stat-content">
            <span>Delivered</span>
            <strong>
              {stats?.delivered_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>

          <div className="stat-content">
            <span>Cancelled</span>
            <strong>
              {stats?.cancelled_orders ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↩️</div>

          <div className="stat-content">
            <span>Return Requests</span>
            <strong>
              {stats?.return_requests ?? 0}
            </strong>
          </div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-icon">₹</div>

          <div className="stat-content">
            <span>Total Revenue</span>
            <strong>
              {formatCurrency(
                stats?.total_revenue
              )}
            </strong>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-actions">

          <Link
            to="/orders"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              🛍️
            </span>

            <div>
              <strong>Manage Orders</strong>
              <p>
                View and update customer orders
              </p>
            </div>
          </Link>

          <Link
            to="/products"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              📦
            </span>

            <div>
              <strong>Manage Products</strong>
              <p>
                View and manage your products
              </p>
            </div>
          </Link>

          <Link
            to="/products/add"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              ➕
            </span>

            <div>
              <strong>Add Product</strong>
              <p>
                Add a new product to your store
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* Order Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Order Overview</h2>

          <Link to="/orders">
            View All Orders →
          </Link>
        </div>

        <div className="order-overview">

          <div className="overview-row">
            <div>
              <span className="overview-dot pending"></span>
              Pending
            </div>

            <strong>
              {stats?.pending_orders ?? 0}
            </strong>
          </div>

          <div className="overview-row">
            <div>
              <span className="overview-dot processing"></span>
              Processing
            </div>

            <strong>
              {stats?.processing_orders ?? 0}
            </strong>
          </div>

          <div className="overview-row">
            <div>
              <span className="overview-dot shipped"></span>
              Shipped
            </div>

            <strong>
              {stats?.shipped_orders ?? 0}
            </strong>
          </div>

          <div className="overview-row">
            <div>
              <span className="overview-dot delivered"></span>
              Delivered
            </div>

            <strong>
              {stats?.delivered_orders ?? 0}
            </strong>
          </div>

          <div className="overview-row">
            <div>
              <span className="overview-dot cancelled"></span>
              Cancelled
            </div>

            <strong>
              {stats?.cancelled_orders ?? 0}
            </strong>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;