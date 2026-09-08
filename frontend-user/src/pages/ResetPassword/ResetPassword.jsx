import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("reset_email");
    const savedOtp = sessionStorage.getItem("reset_otp");

    if (!savedEmail || !savedOtp) {
      navigate("/forgot-password");
      return;
    }

    setEmail(savedEmail);
    setOtp(savedOtp);
  }, [navigate]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/accounts/reset-password/", {
        email,
        otp,
        new_password: password,
        confirm_password: confirmPassword,
      });

      setSuccess("Password reset successfully.");

      localStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors?.length) {
        setError(data.non_field_errors[0]);
      } else if (data?.new_password?.length) {
        setError(data.new_password[0]);
      } else if (data?.confirm_password?.length) {
        setError(data.confirm_password[0]);
      } else {
        setError("Unable to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-wrapper">

        {/* LEFT BRAND SECTION */}
        <section className="reset-password-brand">
          <div className="reset-brand-content">

            <span className="reset-brand-logo">
              ZIVORA
            </span>

            <h1>
              Create a
              <br />
              <span>new password.</span>
            </h1>

            <p>
              Choose a strong password to keep your
              Zivora account secure.
            </p>

            <div className="reset-brand-line"></div>

          </div>
        </section>

        {/* RIGHT FORM SECTION */}
        <section className="reset-password-form-section">
          <div className="reset-password-card">

            <div className="reset-password-header">

              <div className="lock-icon">
                🔒
              </div>

              <span className="reset-eyebrow">
                PASSWORD RESET
              </span>

              <h2>
                Set new password
              </h2>

              <p>
                Create a new password for
              </p>

              <strong>
                {email}
              </strong>

            </div>

            {/* ERROR */}
            {error && (
              <div className="reset-message reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="reset-message reset-success">
                <span>✓</span>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* NEW PASSWORD */}
              <div className="reset-form-group">

                <label htmlFor="new-password">
                  New password
                </label>

                <div className="password-wrapper">

                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    tabIndex="-1"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <div className="password-hint">
                  Use at least 8 characters.
                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div className="reset-form-group">

                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className="password-wrapper">

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="reset-submit-button"
                disabled={
                  loading ||
                  !password ||
                  !confirmPassword
                }
              >
                {loading ? (
                  <>
                    <span className="reset-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    Update password
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="reset-login-link">
              Remember your password?
              <Link to="/login">
                Back to login
              </Link>
            </div>

            <div className="reset-security-note">
              <span>🔐</span>
              <p>
                Your new password will replace your old password.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default ResetPassword;