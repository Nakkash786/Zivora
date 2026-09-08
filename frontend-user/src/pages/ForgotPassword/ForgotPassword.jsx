import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/accounts/forgot-password/",
        { email }
      );

      console.log(
        "Forgot password response:",
        response.data
      );

      localStorage.setItem(
        "reset_email",
        email
      );

      navigate("/verify-reset-otp");

    } catch (error) {
      console.log(
        "Forgot password error:",
        error.response?.data
      );

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.error) {
          setError(data.error);
        } else {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else {
            setError(String(firstError));
          }
        }
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">

      <div className="forgot-wrapper">

        {/* LEFT BRAND */}

        <section className="forgot-brand">

          <div className="forgot-brand-content">

            <div className="forgot-logo">
              Zivora
            </div>

            <span className="forgot-brand-label">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Get back
              <br />
              to your style.
            </h1>

            <p>
              Don't worry. We'll help you securely
              recover access to your Zivora account
              using your registered email address.
            </p>

          </div>

          <div className="forgot-brand-footer">
            <span>© 2026 Zivora</span>
            <span>Secure • Simple • Stylish</span>
          </div>

        </section>

        {/* FORM */}

        <section className="forgot-form-section">

          <div className="forgot-container">

            <div className="forgot-mobile-logo">
              Zivora
            </div>

            <div className="forgot-icon">
              <span>?</span>
            </div>

            <div className="forgot-heading">

              <span className="forgot-eyebrow">
                PASSWORD RECOVERY
              </span>

              <h2>
                Forgot your password?
              </h2>

              <p>
                Enter the email address associated
                with your Zivora account.
              </p>

            </div>

            {error && (
              <div className="forgot-error">

                <span className="forgot-error-icon">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            <form
              className="forgot-form"
              onSubmit={handleSubmit}
            >

              <div className="forgot-field">

                <label htmlFor="forgot-email">
                  Email address
                </label>

                <div className="forgot-input-wrapper">

                  <span className="forgot-input-icon">
                    @
                  </span>

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              <p className="forgot-hint">
                We'll send a verification code to
                this email.
              </p>

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Sending code..."
                    : "Send verification code"}
                </span>

                {!loading && (
                  <span className="forgot-arrow">
                    →
                  </span>
                )}

              </button>

            </form>

            <div className="forgot-back">

              <Link to="/login">
                ← Back to login
              </Link>

            </div>

            <p className="forgot-security">
              Your account information remains secure
              throughout the recovery process.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default ForgotPassword;