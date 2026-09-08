import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/accounts/register/",
        formData
      );

      console.log("Signup response:", response.data);

      localStorage.setItem(
        "signup_email",
        formData.email
      );

      navigate("/verify-otp");
    } catch (error) {
      console.log(
        "Signup error:",
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
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

      <div className="signup-wrapper">

        {/* LEFT BRAND */}

        <section className="signup-brand">

          <div className="signup-brand-content">

            <div className="signup-logo">
              Zivora
            </div>

            <span className="signup-brand-label">
              YOUR STYLE. YOUR STORY.
            </span>

            <h1>
              Create your
              <br />
              own style.
            </h1>

            <p>
              Join Zivora and discover fashion
              designed to fit your personality,
              your lifestyle and your everyday moments.
            </p>

          </div>

          <div className="signup-brand-footer">
            <span>© 2026 Zivora</span>
            <span>Premium Fashion Store</span>
          </div>

        </section>

        {/* RIGHT FORM */}

        <section className="signup-form-section">

          <div className="signup-form-container">

            <div className="signup-mobile-logo">
              Zivora
            </div>

            <div className="signup-heading">

              <span className="signup-eyebrow">
                GET STARTED
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Sign up to start your Zivora journey.
              </p>

            </div>

            {error && (
              <div className="signup-error">

                <span className="signup-error-icon">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            <form
              className="signup-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="signup-name-row">

                <div className="signup-field">

                  <label htmlFor="first_name">
                    First name
                  </label>

                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />

                </div>

                <div className="signup-field">

                  <label htmlFor="last_name">
                    Last name
                  </label>

                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />

                </div>

              </div>

              {/* USERNAME */}

              <div className="signup-field">

                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="signup-field">

                <label htmlFor="email">
                  Email address
                </label>

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

              {/* PHONE */}

              <div className="signup-field">

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />

              </div>

              {/* PASSWORD */}

              <div className="signup-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="signup-password-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <span className="signup-hint">
                  Minimum 8 characters
                </span>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="signup-field">

                <label htmlFor="password_confirm">
                  Confirm password
                </label>

                <div className="signup-password-wrapper">

                  <input
                    id="password_confirm"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="password_confirm"
                    placeholder="Confirm your password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="signup-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </span>

                {!loading && (
                  <span className="signup-arrow">
                    →
                  </span>
                )}

              </button>

            </form>

            <div className="signup-divider">
              <span>OR</span>
            </div>

            <p className="signup-login-text">

              Already have an account?

              <Link to="/login">
                Sign in
              </Link>

            </p>

            <p className="signup-terms">
              By creating an account, you agree to
              Zivora's Terms & Conditions and
              Privacy Policy.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Signup;