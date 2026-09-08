import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import "./CustomerDetails.css";


function CustomerDetails() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [imageError, setImageError] = useState(false);


  // ========================================================
  // FETCH CUSTOMER
  // ========================================================

  const fetchCustomer = async () => {

    try {

      setLoading(true);

      setError("");

      setImageError(false);


      const response = await api.get(
        `/accounts/admin/customers/${id}/`
      );


      setCustomer(response.data);

    } catch (err) {

      console.error(
        "Customer Details Error:",
        err
      );


      setError(
        err.response?.data?.detail ||
        "Unable to load customer details."
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // LOAD CUSTOMER
  // ========================================================

  useEffect(() => {

    fetchCustomer();

  }, [id]);


  // ========================================================
  // CUSTOMER NAME
  // ========================================================

  const getCustomerName = () => {

    if (!customer) {
      return "Customer";
    }


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

  const getCustomerInitial = () => {

    return getCustomerName()
      .charAt(0)
      .toUpperCase();

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
        month: "long",
        year: "numeric",
      }
    );

  };


  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {

    return (

      <div className="customer-details-loading">

        <div className="customer-details-spinner"></div>

        <p>
          Loading customer...
        </p>

      </div>

    );

  }


  // ========================================================
  // ERROR
  // ========================================================

  if (error) {

    return (

      <div className="customer-details-page">

        <button
          className="customer-back-btn"
          onClick={() => navigate("/customers")}
        >
          ← Back to Customers
        </button>


        <div className="customer-details-error">

          <h3>
            Unable to load customer
          </h3>

          <p>
            {error}
          </p>


          <button
            onClick={fetchCustomer}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  if (!customer) {
    return null;
  }


  // ========================================================
  // PROFILE IMAGE AVAILABLE
  // ========================================================

  const hasProfileImage =
    Boolean(customer.profile_image) &&
    !imageError;


  // ========================================================
  // PAGE
  // ========================================================

  return (

    <div className="customer-details-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="customer-details-header">

        <div>

          <div className="customer-details-breadcrumb">
            Admin Panel / Customers / Customer Details
          </div>


          <h1>
            Customer Details
          </h1>


          <p>
            View customer account information.
          </p>

        </div>


        <button
          className="customer-back-btn"
          onClick={() => navigate("/customers")}
        >
          ← Back to Customers
        </button>

      </div>



      {/* ==================================================
          PROFILE CARD
      ================================================== */}

      <div className="customer-profile-card">


        {/* PROFILE IMAGE / INITIAL */}

        <div className="customer-large-avatar">

          {hasProfileImage ? (

            <img
              src={customer.profile_image}
              alt={getCustomerName()}
              className="customer-profile-image"
              onError={() => setImageError(true)}
            />

          ) : (

            getCustomerInitial()

          )}

        </div>



        {/* PROFILE INFORMATION */}

        <div className="customer-profile-info">

          <h2>
            {getCustomerName()}
          </h2>


          <p>
            @{customer.username}
          </p>


          <div className="customer-profile-badges">


            {/* ACTIVE STATUS */}

            <span
              className={
                customer.is_active
                  ? "detail-status active"
                  : "detail-status inactive"
              }
            >

              {customer.is_active
                ? "● Active"
                : "● Inactive"}

            </span>



            {/* EMAIL STATUS */}

            <span
              className={
                customer.is_email_verified
                  ? "detail-verified"
                  : "detail-not-verified"
              }
            >

              {customer.is_email_verified
                ? "✓ Email Verified"
                : "Email Not Verified"}

            </span>

          </div>

        </div>

      </div>



      {/* ==================================================
          INFORMATION GRID
      ================================================== */}

      <div className="customer-info-grid">


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="customer-info-card">


          <div className="customer-card-title">

            <h3>
              Personal Information
            </h3>

          </div>


          <div className="customer-info-list">


            {/* FIRST NAME */}

            <div className="customer-info-row">

              <span>
                First Name
              </span>

              <strong>
                {customer.first_name || "-"}
              </strong>

            </div>



            {/* LAST NAME */}

            <div className="customer-info-row">

              <span>
                Last Name
              </span>

              <strong>
                {customer.last_name || "-"}
              </strong>

            </div>



            {/* USERNAME */}

            <div className="customer-info-row">

              <span>
                Username
              </span>

              <strong>
                {customer.username || "-"}
              </strong>

            </div>



            {/* EMAIL */}

            <div className="customer-info-row">

              <span>
                Email
              </span>

              <strong>
                {customer.email || "-"}
              </strong>

            </div>



            {/* PHONE */}

            <div className="customer-info-row">

              <span>
                Phone
              </span>

              <strong>
                {customer.phone || "-"}
              </strong>

            </div>

          </div>

        </div>



        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="customer-info-card">


          <div className="customer-card-title">

            <h3>
              Account Information
            </h3>

          </div>


          <div className="customer-info-list">


            {/* CUSTOMER ID */}

            <div className="customer-info-row">

              <span>
                Customer ID
              </span>

              <strong>
                #{customer.id}
              </strong>

            </div>



            {/* ACCOUNT STATUS */}

            <div className="customer-info-row">

              <span>
                Account Status
              </span>

              <strong>
                {customer.is_active
                  ? "Active"
                  : "Inactive"}
              </strong>

            </div>



            {/* EMAIL STATUS */}

            <div className="customer-info-row">

              <span>
                Email Status
              </span>

              <strong>
                {customer.is_email_verified
                  ? "Verified"
                  : "Not Verified"}
              </strong>

            </div>



            {/* DATE JOINED */}

            <div className="customer-info-row">

              <span>
                Date Joined
              </span>

              <strong>
                {formatDate(
                  customer.date_joined ||
                  customer.created_at
                )}
              </strong>

            </div>



            {/* LAST LOGIN */}

            <div className="customer-info-row">

              <span>
                Last Login
              </span>

              <strong>
                {formatDate(
                  customer.last_login
                )}
              </strong>

            </div>

          </div>

        </div>

      </div>



      {/* ==================================================
          CUSTOMER ADDRESS
      ================================================== */}

      <div className="customer-info-card customer-address-card">


        <div className="customer-card-title">

          <h3>
            Customer Address
          </h3>

        </div>


        {customer.address ? (

          <div className="customer-address">


            <strong>
              {customer.address.full_name}
            </strong>


            <p>
              {customer.address.address_line}
            </p>


            <p>

              {customer.address.city},{" "}

              {customer.address.state} -{" "}

              {customer.address.pincode}

            </p>


            <p>
              {customer.address.country}
            </p>


            <p>
              Phone: {customer.address.phone}
            </p>

          </div>

        ) : (

          <div className="no-customer-address">

            No address information available.

          </div>

        )}

      </div>


    </div>

  );

}


export default CustomerDetails;