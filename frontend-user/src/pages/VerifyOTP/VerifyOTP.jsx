import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./VerifyOTP.css";

function VerifyOTP() {
  const navigate = useNavigate();

  const email = localStorage.getItem("signup_email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Signup session expired. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/accounts/verify-otp/",
        {
          email,
          otp,
        }
      );

      console.log("OTP verification:", response.data);

      setSuccess(
        "Email verified successfully! You can now login."
      );

      localStorage.removeItem("signup_email");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.log(
        "OTP verification error:",
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
    <main className="verify-page">

      <div className="verify-wrapper">

        {/* LEFT BRAND SECTION */}

        <section className="verify-brand">

          <div className="verify-brand-content">

            <div className="verify-logo">
              Zivora
            </div>

            <span className="verify-brand-label">
              SECURE YOUR ACCOUNT
            </span>

            <h1>
              One step
              <br />
              away.
            </h1>

            <p>
              Verify your email address to secure
              your Zivora account and start exploring
              our latest fashion collections.
            </p>

          </div>

          <div className="verify-brand-footer">
            <span>© 2026 Zivora</span>
            <span>Secure • Simple • Stylish</span>
          </div>

        </section>

        {/* OTP SECTION */}

        <section className="verify-form-section">

          <div className="verify-container">

            <div className="verify-mobile-logo">
              Zivora
            </div>

            <div className="verify-icon">
              <span>✉</span>
            </div>

            <div className="verify-heading">

              <span className="verify-eyebrow">
                EMAIL VERIFICATION
              </span>

              <h2>
                Verify your email
              </h2>

              <p>
                We've sent a 6-digit verification code
                to
              </p>

              <strong>
                {email || "your email"}
              </strong>

            </div>

            {error && (
              <div className="verify-message verify-error">

                <span className="verify-message-icon">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            {success && (
              <div className="verify-message verify-success">

                <span className="verify-message-icon">
                  ✓
                </span>

                <span>{success}</span>

              </div>
            )}

            <form
              className="verify-form"
              onSubmit={handleSubmit}
            >

              <div className="verify-field">

                <label htmlFor="otp">
                  Verification code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={handleChange}
                  autoFocus
                  required
                />

              </div>

              <p className="verify-hint">
                Enter the 6-digit code from your email.
              </p>

              <button
                type="submit"
                className="verify-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Verifying..."
                    : "Verify email"}
                </span>

                {!loading && (
                  <span className="verify-arrow">
                    →
                  </span>
                )}

              </button>

            </form>

            <div className="verify-bottom">

              <p>
                Entered the wrong email?
              </p>

              <Link to="/signup">
                Create a new account
              </Link>

            </div>

            <p className="verify-security">
              Your verification code expires after
              5 minutes.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default VerifyOTP;