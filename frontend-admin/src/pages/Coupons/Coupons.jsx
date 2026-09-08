import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Coupons.css";

function Coupons() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      const response = await api.get("/coupons/admin/", {
        params,
      });

      setCoupons(response.data);
    } catch (err) {
      console.error("Coupons Error:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCoupons();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === "PERCENTAGE") {
      return `${coupon.discount_value}%`;
    }

    return `₹${coupon.discount_value}`;
  };

  return (
    <div className="coupons-page">

      <div className="coupons-header">
        <div>
          <h1>Coupons</h1>
          <p>
            Manage discount coupons and promotional offers.
          </p>
        </div>

        <button
          className="add-coupon-btn"
          onClick={() => navigate("/coupons/add")}
        >
          + Add Coupon
        </button>
      </div>

      <div className="coupons-filters">

        <form
          className="coupon-search"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Coupons</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

      </div>

      {loading && (
        <div className="coupon-state">
          Loading coupons...
        </div>
      )}

      {!loading && error && (
        <div className="coupon-error">
          {error}
        </div>
      )}

      {!loading && !error && coupons.length === 0 && (
        <div className="coupon-empty">
          <div className="coupon-empty-icon">%</div>
          <h3>No coupons found</h3>
          <p>
            Create your first coupon to offer discounts
            to customers.
          </p>

          <button
            onClick={() => navigate("/coupons/add")}
          >
            Add Coupon
          </button>
        </div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <div className="coupons-table-wrapper">

          <table className="coupons-table">

            <thead>
              <tr>
                <th>Coupon</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {coupons.map((coupon) => (

                <tr key={coupon.id}>

                  <td>
                    <div className="coupon-code">
                      {coupon.code}
                    </div>

                    <div className="coupon-description">
                      {coupon.description || "No description"}
                    </div>
                  </td>

                  <td>
                    <strong>
                      {formatDiscount(coupon)}
                    </strong>
                  </td>

                  <td>
                    ₹{coupon.min_order_amount}
                  </td>

                  <td>
                    {coupon.usage_count}

                    {coupon.usage_limit !== null
                      ? ` / ${coupon.usage_limit}`
                      : " / Unlimited"}
                  </td>

                  <td>
                    {formatDate(coupon.valid_until)}
                  </td>

                  <td>
                    <span
                      className={
                        coupon.is_active
                          ? "coupon-status active"
                          : "coupon-status inactive"
                      }
                    >
                      {coupon.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-coupon-btn"
                      onClick={() =>
                        navigate(
                          `/coupons/${coupon.id}`
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
      )}

    </div>
  );
}

export default Coupons;