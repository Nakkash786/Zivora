import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./Customers.css";


function Customers() {

  const navigate = useNavigate();


  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ========================================================
  // FETCH CUSTOMERS
  // ========================================================

  const fetchCustomers = async (searchValue = "") => {

    try {

      setLoading(true);

      setError("");


      const params = {};


      if (searchValue.trim()) {

        params.search = searchValue.trim();

      }


      const response = await api.get(
        "/accounts/admin/customers/",
        {
          params,
        }
      );


      setCustomers(response.data);

    } catch (err) {

      console.error(
        "Customers Error:",
        err
      );


      if (err.response?.status === 403) {

        setError(
          "Admin access required."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to load customers."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {

    fetchCustomers();

  }, []);


  // ========================================================
  // SEARCH
  // ========================================================

  const handleSearch = (event) => {

    event.preventDefault();

    fetchCustomers(search);

  };


  // ========================================================
  // CLEAR SEARCH
  // ========================================================

  const handleClear = () => {

    setSearch("");

    fetchCustomers("");

  };


  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }


    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ========================================================
  // CUSTOMER NAME
  // ========================================================

  const getCustomerName = (customer) => {

    const fullName = [

      customer.first_name,

      customer.last_name,

    ]
      .filter(Boolean)
      .join(" ");


    return (
      fullName ||
      customer.username ||
      "Customer"
    );

  };


  // ========================================================
  // CUSTOMER INITIAL
  // ========================================================

  const getCustomerInitial = (customer) => {

    return getCustomerName(customer)
      .charAt(0)
      .toUpperCase();

  };


  // ========================================================
  // PAGE
  // ========================================================

  return (

    <div className="customers-page">


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="customers-header">

        <div>

          <div className="customers-breadcrumb">
            Admin Panel / Customers
          </div>


          <h1>
            Customers
          </h1>


          <p>
            View and manage your store customers.
          </p>

        </div>


        <button
          className="customers-refresh-btn"
          onClick={() => fetchCustomers(search)}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>



      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="customers-toolbar">

        <form
          className="customers-search-form"
          onSubmit={handleSearch}
        >

          <div className="customers-search-box">

            <span className="customers-search-icon">
              🔍
            </span>


            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="customers-search-btn"
          >
            Search
          </button>


          {search && (

            <button
              type="button"
              className="customers-clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>

          )}

        </form>

      </div>



      {/* ==================================================
          CUSTOMER COUNT
      ================================================== */}

      <div className="customers-summary">

        <div>

          <strong>
            {customers.length}
          </strong>

          <span>

            {customers.length === 1
              ? " Customer"
              : " Customers"}

          </span>

        </div>

      </div>



      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="customers-error">

          <span>
            ⚠
          </span>


          <span>
            {error}
          </span>


          <button
            onClick={() => fetchCustomers(search)}
          >
            Try Again
          </button>

        </div>

      )}



      {/* ==================================================
          LOADING
      ================================================== */}

      {loading ? (

        <div className="customers-loading">

          <div className="customers-spinner"></div>

          <p>
            Loading customers...
          </p>

        </div>

      ) : error ? null : (


        /* ==================================================
           CUSTOMER TABLE
        ================================================== */

        <div className="customers-table-card">


          {customers.length === 0 ? (

            <div className="customers-empty">

              <div className="customers-empty-icon">
                👥
              </div>


              <h3>
                No customers found
              </h3>


              <p>

                {search
                  ? "Try a different search."
                  : "Customers will appear here after they register."
                }

              </p>

            </div>

          ) : (


            <div className="customers-table-wrapper">

              <table className="customers-table">


                <thead>

                  <tr>

                    <th>
                      Customer
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Email Verified
                    </th>

                    <th>
                      Joined
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>



                <tbody>


                  {customers.map((customer) => (


                    <tr key={customer.id}>


                      {/* ==================================================
                          CUSTOMER
                      ================================================== */}

                      <td>

                        <div className="customer-info">


                          {/* PROFILE IMAGE */}

                          <div className="customer-avatar">

                            {customer.profile_image ? (

                              <img
                                src={customer.profile_image}
                                alt={getCustomerName(customer)}
                                className="customer-avatar-image"
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  if (
                                    event.currentTarget
                                      .nextElementSibling
                                  ) {
                                    event.currentTarget
                                      .nextElementSibling
                                      .style.display = "flex";
                                  }
                                }}
                              />

                            ) : null}


                            {/* FALLBACK INITIAL */}

                            <span
                              className="customer-avatar-fallback"
                              style={{
                                display:
                                  customer.profile_image
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              {getCustomerInitial(customer)}
                            </span>

                          </div>



                          <div className="customer-name-box">

                            <strong>
                              {getCustomerName(customer)}
                            </strong>


                            <span>
                              @{customer.username}
                            </span>

                          </div>

                        </div>

                      </td>



                      {/* ==================================================
                          EMAIL
                      ================================================== */}

                      <td>

                        <span className="customer-email">

                          {customer.email || "-"}

                        </span>

                      </td>



                      {/* ==================================================
                          PHONE
                      ================================================== */}

                      <td>

                        {customer.phone || "-"}

                      </td>



                      {/* ==================================================
                          STATUS
                      ================================================== */}

                      <td>

                        <span
                          className={
                            customer.is_active
                              ? "customer-status active"
                              : "customer-status inactive"
                          }
                        >

                          <span className="status-dot"></span>


                          {customer.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>



                      {/* ==================================================
                          EMAIL VERIFIED
                      ================================================== */}

                      <td>

                        <span
                          className={
                            customer.is_email_verified
                              ? "verified-badge"
                              : "not-verified-badge"
                          }
                        >

                          {customer.is_email_verified
                            ? "✓ Verified"
                            : "Not Verified"}

                        </span>

                      </td>



                      {/* ==================================================
                          JOINED
                      ================================================== */}

                      <td>

                        {formatDate(
                          customer.date_joined
                        )}

                      </td>



                      {/* ==================================================
                          ACTION
                      ================================================== */}

                      <td>

                        <button
                          className="customer-view-btn"
                          onClick={() =>
                            navigate(
                              `/customers/${customer.id}`
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

      )}

    </div>

  );

}


export default Customers;