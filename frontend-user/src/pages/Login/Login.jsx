import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/accounts/login/",
        formData
      );

      console.log("Login response:", response.data);

      const { access, refresh, user } = response.data;

      // ======================================================
      // SAVE JWT TOKENS
      // ======================================================

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // ======================================================
      // SAVE USER DATA
      // ======================================================

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      // ======================================================
      // IMPORTANT
      // Tell Navbar that login happened
      // ======================================================

      window.dispatchEvent(
        new Event("authChanged")
      );

      // ======================================================
      // GO HOME
      // ======================================================

      navigate("/", { replace: true });

    } catch (error) {
      console.log(
        "Login error:",
        error.response?.data
      );

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else {
            setError(String(firstError));
          }
        }
      } else {
        setError(
          "Unable to connect to server."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="login-page">

      <div className="login-wrapper">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <section className="login-brand-section">

          <div className="login-brand-content">

            <div className="login-logo">
              Zivora
            </div>

            <p className="login-brand-label">
              FASHION • STYLE • YOU
            </p>

            <h1>
              Style that
              <br />
              speaks for you.
            </h1>

            <p className="login-brand-description">
              Discover carefully selected fashion,
              timeless styles and everything you need
              to express your individuality.
            </p>

          </div>

          <div className="login-brand-footer">
            <span>
              © 2026 Zivora
            </span>

            <span>
              Premium Fashion Store
            </span>
          </div>

        </section>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <section className="login-form-section">

          <div className="login-form-container">

            {/* Mobile Logo */}

            <div className="login-mobile-logo">
              Zivora
            </div>

            {/* Heading */}

            <div className="login-heading">

              <span className="login-eyebrow">
                WELCOME BACK
              </span>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Enter your details to continue
                shopping with Zivora.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="login-error">

                <span className="login-error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="login-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="login-field">

                <div className="login-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>

                </div>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    •••
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                {!loading && (
                  <span className="login-arrow">
                    →
                  </span>
                )}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="login-divider">
              <span>
                OR
              </span>
            </div>

            {/* SIGNUP */}

            <p className="login-signup-text">
              Don't have an account?

              <Link to="/signup">
                Create an account
              </Link>
            </p>

            {/* TERMS */}

            <p className="login-terms">
              By continuing, you agree to Zivora's
              Terms & Conditions and Privacy Policy.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Login;