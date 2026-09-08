import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import { useEffect } from "react";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";

import Products from "./pages/Products/Products";
import AddProduct from "./pages/Products/AddProduct";
import ProductDetails from "./pages/Products/ProductDetails";

import Brands from "./pages/Products/Brands";
import Categories from "./pages/Products/Categories";

import HomeBanners from "./pages/HomeBanners/HomeBanners";

import AdminLayout from "./components/Layout/AdminLayout";

import Orders from "./pages/Orders/Orders";
import OrderDetails from "./pages/Orders/OrderDetails";

import Customers from "./pages/Customers/Customers";
import CustomerDetails from "./pages/Customers/CustomerDetails";

import Reviews from "./pages/Reviews/Reviews";
import ReviewDetails from "./pages/Reviews/ReviewDetails";

import Coupons from "./pages/Coupons/Coupons";
import CouponDetails from "./pages/Coupons/CouponDetails";

import Settings from "./pages/Settings/Settings";

import "./index.css";


/* =========================================================
   BROWSER HISTORY / BACK BUTTON GUARD
========================================================= */

function AuthHistoryGuard() {

  const location = useLocation();

  useEffect(() => {

    const checkAuthentication = () => {

      const accessToken =
        localStorage.getItem(
          "admin_access_token"
        );


      // -----------------------------------------------------
      // IF USER IS LOGGED OUT
      // AND TRYING TO ACCESS A PROTECTED PAGE
      // -----------------------------------------------------

      if (
        !accessToken &&
        location.pathname !== "/login"
      ) {

        window.location.replace(
          "/login"
        );

      }

    };


    // Check immediately
    checkAuthentication();


    // Browser Back / Forward
    window.addEventListener(
      "popstate",
      checkAuthentication
    );


    // Browser Back-Forward Cache
    window.addEventListener(
      "pageshow",
      checkAuthentication
    );


    return () => {

      window.removeEventListener(
        "popstate",
        checkAuthentication
      );

      window.removeEventListener(
        "pageshow",
        checkAuthentication
      );

    };

  }, [location.pathname]);


  return null;
}


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({ children }) {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <div className="app-loading">

        <div className="loading-spinner"></div>

        <p>
          Loading...
        </p>

      </div>
    );

  }


  /* =======================================================
     NOT AUTHENTICATED
  ======================================================= */

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;
}


/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {

  return (

    <AuthProvider>

      {/* ===================================================
          AUTH HISTORY GUARD
      =================================================== */}

      <AuthHistoryGuard />

      <Routes>


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            PROTECTED ADMIN PANEL
        ================================================= */}

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >


          {/* ===============================================
              DASHBOARD
          =============================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* ===============================================
              ORDERS
          =============================================== */}

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />


          {/* ===============================================
              COUPONS
          =============================================== */}

          <Route
            path="/coupons"
            element={<Coupons />}
          />

          <Route
            path="/coupons/add"
            element={<CouponDetails />}
          />

          <Route
            path="/coupons/:id"
            element={<CouponDetails />}
          />


          {/* ===============================================
              SETTINGS
          =============================================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />


          {/* ===============================================
              PRODUCTS
          =============================================== */}

          <Route
            path="/products"
            element={<Products />}
          />


          {/* ===============================================
              ADD PRODUCT
          =============================================== */}

          <Route
            path="/products/add"
            element={<AddProduct />}
          />


          {/* ===============================================
              PRODUCT DETAILS
          =============================================== */}

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />


          {/* ===============================================
              BRANDS
          =============================================== */}

          <Route
            path="/brands"
            element={<Brands />}
          />


          {/* ===============================================
              CATEGORIES
          =============================================== */}

          <Route
            path="/categories"
            element={<Categories />}
          />


          {/* ===============================================
              CUSTOMERS
          =============================================== */}

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/customers/:id"
            element={<CustomerDetails />}
          />


          {/* ===============================================
              REVIEWS
          =============================================== */}

          <Route
            path="/reviews"
            element={<Reviews />}
          />

          <Route
            path="/reviews/:id"
            element={<ReviewDetails />}
          />


          {/* ===============================================
              HOME BANNERS
          =============================================== */}

          <Route
            path="/home-banners"
            element={<HomeBanners />}
          />

        </Route>


        {/* =================================================
            DEFAULT ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </AuthProvider>

  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <AppRoutes />

    </BrowserRouter>

  );

}


export default App;