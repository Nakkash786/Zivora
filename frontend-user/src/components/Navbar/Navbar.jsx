import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // ==========================================================
  // GET USER PROFILE
  // ==========================================================

  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/accounts/profile/");

      setUser(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Profile fetch error:", error);

      if (error.response?.status === 401) {
        setUser(null);
      }
    }
  };

  // ==========================================================
  // GET CART COUNT
  // ==========================================================

  const fetchCartCount = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get("/cart/");

      setCartCount(
        response.data?.total_items || 0
      );
    } catch (error) {
      console.error("Cart count error:", error);

      if (error.response?.status === 401) {
        setCartCount(0);
      }
    }
  };

  // ==========================================================
  // GET WISHLIST COUNT
  // ==========================================================

  const fetchWishlistCount = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await api.get("/wishlist/");

      const data = response.data;

      if (Array.isArray(data)) {
        setWishlistCount(data.length);
      } else if (Array.isArray(data?.items)) {
        setWishlistCount(data.items.length);
      } else if (typeof data?.count === "number") {
        setWishlistCount(data.count);
      } else if (typeof data?.item_count === "number") {
        setWishlistCount(data.item_count);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.error("Wishlist count error:", error);

      setWishlistCount(0);
    }
  };

  // ==========================================================
  // LOAD NAVBAR DATA
  // ==========================================================

  const loadNavbarData = () => {
    fetchProfile();
    fetchCartCount();
    fetchWishlistCount();
  };

  // ==========================================================
  // INITIAL LOAD + AUTH CHANGE
  // ==========================================================

  useEffect(() => {
    loadNavbarData();

    const handleAuthChange = () => {
      setProfileOpen(false);
      setMenuOpen(false);

      loadNavbarData();
    };

    window.addEventListener(
      "authChanged",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChange
      );
    };
  }, []);

  // ==========================================================
  // CART CHANGE
  // ==========================================================

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );
    };
  }, []);

  // ==========================================================
  // WISHLIST CHANGE
  // ==========================================================

  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    window.addEventListener(
      "wishlistUpdated",
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        handleWishlistUpdate
      );
    };
  }, []);

  // ==========================================================
  // STORAGE CHANGE
  // ==========================================================

  useEffect(() => {
    const handleStorageChange = () => {
      loadNavbarData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const openSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const value = searchValue.trim();

    if (!value) {
      navigate("/products");
      closeSearch();
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(value)}`
    );

    closeSearch();
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      const refreshToken =
        localStorage.getItem("refresh_token");

      if (refreshToken) {
        await api.post(
          "/accounts/logout/",
          {
            refresh: refreshToken,
          }
        );
      }
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
      setProfileOpen(false);
      setMenuOpen(false);
      setSearchOpen(false);

      window.dispatchEvent(
        new Event("authChanged")
      );

      navigate("/login", {
        replace: true,
      });
    }
  };

  // ==========================================================
  // CLOSE MOBILE MENU
  // ==========================================================

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const getProfileImage = () => {
    if (!user?.profile_image) {
      return null;
    }

    if (
      user.profile_image.startsWith("http")
    ) {
      return user.profile_image;
    }

    return `http://127.0.0.1:8000${user.profile_image}`;
  };

  // ==========================================================
  // USER INITIAL
  // ==========================================================

  const getUserInitial = () => {
    if (!user) {
      return "U";
    }

    const name =
      user.first_name ||
      user.username ||
      user.email?.split("@")[0] ||
      "User";

    return name.charAt(0).toUpperCase();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* ==================================================
            LOGO
        ================================================== */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          ZIVORA
        </Link>

        {/* ==================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav className="navbar-links">

          <Link
            to="/"
            className="nav-link"
          >
            Home
          </Link>

          <Link
            to="/products?gender=MEN"
            className="nav-link"
          >
            Men
          </Link>

          <Link
            to="/products?gender=WOMEN"
            className="nav-link"
          >
            Women
          </Link>

          <Link
            to="/products"
            className="nav-link"
          >
            Shop
          </Link>

        </nav>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="navbar-actions">

          {/* SEARCH */}

          <button
            className="navbar-icon-btn search-trigger"
            onClick={openSearch}
            aria-label="Search products"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />
              <path d="M16 16L21 21" />
            </svg>
          </button>

          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className="navbar-icon-link"
            aria-label="Wishlist"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 8 4c1.5 0 2.8.7 4 2 1.2-1.3 2.5-2 4-2a4.8 4.8 0 0 1 4.8 4.8Z" />
            </svg>

            {wishlistCount > 0 && (
              <span className="navbar-badge">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className="navbar-icon-link"
            aria-label="Cart"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 5h2l1.5 10h10L20 8H7" />
              <circle cx="9" cy="19" r="1.3" />
              <circle cx="17" cy="19" r="1.3" />
            </svg>

            {cartCount > 0 && (
              <span className="navbar-badge">
                {cartCount}
              </span>
            )}
          </Link>

          {/* LOGGED-IN USER */}

          {user ? (

            <div className="profile-wrapper">

              <button
                className="profile-button"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                aria-label="Profile menu"
                type="button"
              >

                {getProfileImage() ? (

                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="navbar-profile-image"
                  />

                ) : (

                  <span className="profile-avatar">
                    {getUserInitial()}
                  </span>

                )}

                <span className="profile-arrow">
                  {profileOpen ? "▲" : "▼"}
                </span>

              </button>

              {profileOpen && (

                <div className="profile-dropdown">

                  <Link
                    to="/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    My Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    Wishlist
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    Cart
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    className="logout-button"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>

                </div>

              )}

            </div>

          ) : (

            <Link
              to="/login"
              className="login-button"
            >
              Login
            </Link>

          )}

          {/* MOBILE MENU */}

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Menu"
            type="button"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

      </div>

      {/* ======================================================
          SEARCH PANEL
      ====================================================== */}

      {searchOpen && (

        <div className="navbar-search-panel">

          <div className="navbar-search-inner">

            <form
              className="navbar-search-form"
              onSubmit={handleSearchSubmit}
            >

              <svg
                className="navbar-search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                />
                <path d="M16 16L21 21" />
              </svg>

              <input
                type="text"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                placeholder="Search for shirts, sarees, dresses..."
                autoFocus
              />

              <button
                type="submit"
                className="navbar-search-submit"
              >
                Search
              </button>

            </form>

            <button
              type="button"
              className="navbar-search-close"
              onClick={closeSearch}
              aria-label="Close search"
            >
              ✕
            </button>

          </div>

        </div>

      )}

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (

        <div className="mobile-menu">

          <button
            type="button"
            className="mobile-search-button"
            onClick={() => {
              setMenuOpen(false);
              openSearch();
            }}
          >
            <span>Search Products</span>

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />
              <path d="M16 16L21 21" />
            </svg>
          </button>

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/products?gender=MEN"
            onClick={closeMenu}
          >
            Men
          </Link>

          <Link
            to="/products?gender=WOMEN"
            onClick={closeMenu}
          >
            Women
          </Link>

          <Link
            to="/products"
            onClick={closeMenu}
          >
            Shop
          </Link>

          <Link
            to="/cart"
            onClick={closeMenu}
          >
            Cart

            {cartCount > 0 && (
              <span className="mobile-count">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMenu}
          >
            Wishlist

            {wishlistCount > 0 && (
              <span className="mobile-count">
                {wishlistCount}
              </span>
            )}
          </Link>

          {user ? (

            <>

              <Link
                to="/profile"
                onClick={closeMenu}
              >
                Profile
              </Link>

              <Link
                to="/orders"
                onClick={closeMenu}
              >
                My Orders
              </Link>

              <button
                className="mobile-logout"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>

            </>

          ) : (

            <Link
              to="/login"
              onClick={closeMenu}
            >
              Login
            </Link>

          )}

        </div>

      )}

    </header>
  );
}

export default Navbar;