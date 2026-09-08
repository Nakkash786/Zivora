import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/Products/ProductDetails";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import VerifyOTP from "./pages/VerifyOTP/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyPasswordResetOTP from "./pages/VerifyPasswordResetOTP/VerifyPasswordResetOTP";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

import Profile from "./pages/Profile/Profile";
import Addresses from "./pages/Addresses/Addresses";

import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/Wishlist/Wishlist";

import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import Orders from "./pages/Orders/Orders";
import OrderDetails from "./pages/OrderDetails/OrderDetails";

import Contact from "./pages/Contact/Contact";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import Shipping from "./pages/Shipping/Shipping";
import Returns from "./pages/Returns/Returns";


function AppRoutes() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            PRODUCTS
        ========================= */}

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />


        {/* =========================
            CART & WISHLIST
        ========================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />


        {/* =========================
            CHECKOUT
        ========================= */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />


        {/* =========================
            ORDERS
        ========================= */}

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />


        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-reset-otp"
          element={<VerifyPasswordResetOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =========================
            USER PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/addresses"
          element={<Addresses />}
        />


        {/* =========================
            INFORMATION PAGES
        ========================= */}

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/shipping"
          element={<Shipping />}
        />

        <Route
          path="/returns"
          element={<Returns />}
        />

      </Routes>

      <Footer />
    </AuthProvider>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}


export default App;