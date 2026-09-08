import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./VerifyPasswordResetOTP.css";

function VerifyPasswordResetOTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("reset_email");

    if (!savedEmail) {
      navigate("/forgot-password");
      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/accounts/verify-password-reset-otp/", {
        email,
        otp,
      });

      sessionStorage.setItem("reset_otp", otp);

      setSuccess("OTP verified successfully.");

      setTimeout(() => {
        navigate("/reset-password");
      }, 700);
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors?.length) {
        setError(data.non_field_errors[0]);
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/forgot-password");
  };

  return (
    <main className="reset-otp-page">
      <div className="reset-otp-wrapper">

        <section className="reset-otp-brand">
          <div className="brand-content">
            <span className="brand-badge">ZIVORA</span>

            <h1>
              Secure your
              <br />
              <span>account.</span>
            </h1>

            <p>
              Verify your email address to continue resetting
              your Zivora account password.
            </p>

            <div className="brand-line"></div>
          </div>
        </section>

        <section className="reset-otp-card-section">
          <div className="reset-otp-card">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back
            </button>

            <div className="reset-otp-header">
              <div className="otp-icon">
                ✉
              </div>

              <span className="eyebrow">
                PASSWORD RESET
              </span>

              <h2>Verify OTP</h2>

              <p>
                Enter the 6-digit verification code sent to
              </p>

              <strong>{email}</strong>
            </div>

            {error && (
              <div className="message error-message">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="message success-message">
                <span>✓</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="otp">
                  Verification code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="otp-input"
                  disabled={loading}
                />

                <div className="otp-counter">
                  <span>Enter the code from your email</span>
                  <span>{otp.length}/6</span>
                </div>
              </div>

              <button
                type="submit"
                className="verify-button"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="reset-otp-footer">
              <p>
                Didn't receive the code?
              </p>

              <Link to="/forgot-password">
                Send a new OTP
              </Link>
            </div>

            <div className="security-note">
              <span>🔒</span>
              <p>
                Your verification code expires after a few minutes.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default VerifyPasswordResetOTP;