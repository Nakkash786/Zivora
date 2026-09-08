import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        formData.email.trim(),
        formData.password
      );
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-wrapper">

        {/* LEFT SIDE */}
        <div className="admin-login-brand">
          <div className="brand-content">
            <div className="brand-logo">Z</div>

            <p className="brand-small">
              ZIVORA ADMIN
            </p>

            <h1>
              CONTROL.
              <br />
              <span>CREATE.</span>
              <br />
              GROW.
            </h1>

            <p className="brand-description">
              Manage your store, products, customers and orders
              from one powerful dashboard.
            </p>
          </div>

          <div className="brand-footer">
            <span>© 2026 Zivora</span>
            <span>Admin Portal</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="admin-login-form-section">

          <div className="login-form-container">

            <div className="mobile-logo">
              <div className="mobile-logo-icon">Z</div>
              <span>ZIVORA</span>
            </div>

            <div className="login-heading">
              <p>WELCOME BACK</p>

              <h2>
                Admin <span>Login</span>
              </h2>

              <div className="heading-line"></div>
            </div>

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="input-group">
                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div className="input-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    PASSWORD
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="password-input-wrapper">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>

                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="login-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    SIGN IN
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="security-note">
              <span>🔒</span>
              <p>
                Secure admin access. Only authorized staff can
                access this panel.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;