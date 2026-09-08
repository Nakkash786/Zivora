import {
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import Sidebar from "./Sidebar";

import "./AdminLayout.css";


function AdminLayout() {

  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();


  /* =========================================================
     PAGE TITLE
  ========================================================= */

  const getPageTitle = () => {

    const path = location.pathname;


    if (path === "/dashboard") {
      return "Dashboard";
    }


    if (path === "/products") {
      return "Products";
    }


    if (path === "/products/add") {
      return "Add Product";
    }


    if (path.startsWith("/products/")) {
      return "Product Details";
    }


    if (path === "/brands") {
      return "Brands";
    }


    if (path === "/categories") {
      return "Categories";
    }


    if (path === "/home-banners") {
      return "Home Banners";
    }


    if (path === "/orders") {
      return "Orders";
    }


    if (path.startsWith("/orders/")) {
      return "Order Details";
    }


    if (path === "/customers") {
      return "Customers";
    }


    if (path.startsWith("/customers/")) {
      return "Customer Details";
    }


    if (path === "/reviews") {
      return "Reviews";
    }


    if (path.startsWith("/reviews/")) {
      return "Review Details";
    }


    if (path === "/coupons") {
      return "Coupons";
    }


    if (path === "/coupons/add") {
      return "Add Coupon";
    }


    if (path.startsWith("/coupons/")) {
      return "Edit Coupon";
    }


    if (path === "/settings") {
      return "Settings";
    }


    return "Admin Panel";
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {

    try {

      /*
       * AuthContext handles:
       *
       * 1. API logout
       * 2. Remove access token
       * 3. Remove refresh token
       * 4. Remove admin user
       * 5. Clear admin state
       * 6. Redirect to /login
       *
       * So DO NOT call navigate() here.
       */

      await logout();

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }
  };


  /* =========================================================
     USER INITIAL
  ========================================================= */

  const userInitial =
    user?.first_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    "A";


  return (
    <div className="admin-layout">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="admin-main">


        {/* ===================================================
            TOP NAVBAR
        =================================================== */}

        <header className="admin-topbar">


          <div className="topbar-left">


            {/* =================================================
                MOBILE MENU
            ================================================= */}

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="Open menu"
            >
              ☰
            </button>


            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div className="topbar-page-title">

              <span>
                Admin Panel
              </span>

              <strong>
                {getPageTitle()}
              </strong>

            </div>

          </div>


          {/* =================================================
              TOPBAR RIGHT
          ================================================= */}

          <div className="topbar-right">


            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <button
              type="button"
              className="topbar-icon-button"
              title="Notifications"
            >
              ♧
            </button>


            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="admin-user">


              {/* =================================================
                  USER AVATAR
              ================================================= */}

              <div className="admin-user-avatar">

                {userInitial.toUpperCase()}

              </div>


              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              <div className="admin-user-info">

                <strong>
                  {user?.first_name ||
                    user?.username ||
                    "Admin"}
                </strong>

                <span>
                  Administrator
                </span>

              </div>


              {/* =================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                ↪
              </button>


            </div>

          </div>

        </header>


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="admin-content">

          <Outlet />

        </main>


      </div>

    </div>
  );
}


export default AdminLayout;