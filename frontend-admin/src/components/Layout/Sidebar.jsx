import { NavLink } from "react-router-dom";

import "./AdminLayout.css";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="sidebar-logo">

          <div className="sidebar-logo-mark">
            Z
          </div>

          <div className="sidebar-logo-text">
            <strong>ZIVORA</strong>
            <span>ADMIN PANEL</span>
          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">

          {/* ================= MAIN ================= */}

          <p className="sidebar-section-title">
            MAIN
          </p>


          {/* ================= DASHBOARD ================= */}

          <NavLink
            to="/dashboard"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ▦
            </span>

            <span>
              Dashboard
            </span>
          </NavLink>


          {/* ================= CATALOG ================= */}

          <p className="sidebar-section-title">
            CATALOG
          </p>


          {/* ================= PRODUCTS ================= */}

          <NavLink
            to="/products"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              □
            </span>

            <span>
              Products
            </span>
          </NavLink>


          {/* ================= ADD PRODUCT ================= */}

          <NavLink
            to="/products/add"
            onClick={closeMobileSidebar}
            className="sidebar-link sidebar-sub-link"
          >
            <span className="sidebar-icon">
              ＋
            </span>

            <span>
              Add Product
            </span>
          </NavLink>


          {/* ================= BRANDS ================= */}

          <NavLink
            to="/brands"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ◈
            </span>

            <span>
              Brands
            </span>
          </NavLink>


          {/* ================= CATEGORIES ================= */}

          <NavLink
            to="/categories"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ▤
            </span>

            <span>
              Categories
            </span>
          </NavLink>


          {/* ================= HOME BANNERS ================= */}

          <NavLink
            to="/home-banners"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ▰
            </span>

            <span>
              Home Banners
            </span>
          </NavLink>


          {/* ================= STORE ================= */}

          <p className="sidebar-section-title">
            STORE
          </p>


          {/* ================= ORDERS ================= */}

          <NavLink
            to="/orders"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              🛍
            </span>

            <span>
              Orders
            </span>
          </NavLink>


          {/* ================= CUSTOMERS ================= */}

          <NavLink
            to="/customers"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ♙
            </span>

            <span>
              Customers
            </span>
          </NavLink>


          {/* ================= REVIEWS ================= */}

          <NavLink
            to="/reviews"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ★
            </span>

            <span>
              Reviews
            </span>
          </NavLink>


          {/* ================= COUPONS ================= */}

          <NavLink
            to="/coupons"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ▱
            </span>

            <span>
              Coupons
            </span>
          </NavLink>


          {/* ================= SYSTEM ================= */}

          <p className="sidebar-section-title">
            SYSTEM
          </p>


          {/* ================= SETTINGS ================= */}

          <NavLink
            to="/settings"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>
          </NavLink>

        </nav>


        {/* =================================================
            SIDEBAR FOOTER
        ================================================= */}

        <div className="sidebar-footer">

          <div className="sidebar-footer-brand">
            Z
          </div>

          <div>
            <strong>
              Zivora
            </strong>

            <span>
              Admin
            </span>
          </div>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;