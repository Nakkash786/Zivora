import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-column footer-brand">
          <h2>ZIVORA</h2>

          <p>
            Discover fashion that fits your style. Shop the latest trends
            with Zivora.
          </p>

          <div className="footer-socials">
            <a
              href="#"
              aria-label="Instagram"
              onClick={(e) => e.preventDefault()}
            >
              Instagram
            </a>

            <a
              href="#"
              aria-label="Facebook"
              onClick={(e) => e.preventDefault()}
            >
              Facebook
            </a>

            <a
              href="#"
              aria-label="Pinterest"
              onClick={(e) => e.preventDefault()}
            >
              Pinterest
            </a>
          </div>
        </div>

        {/* SHOP */}
        <div className="footer-column">
          <h3>SHOP</h3>

          <Link to="/products">All Products</Link>
          <Link to="/products?gender=MEN">Men</Link>
          <Link to="/products?gender=WOMEN">Women</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>

        {/* HELP */}
        <div className="footer-column">
          <h3>HELP</h3>

          <Link to="/contact">Contact Us</Link>
          <Link to="/shipping">Shipping &amp; Delivery</Link>
          <Link to="/returns">Returns &amp; Refunds</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-column footer-newsletter">
          <h3>STAY IN THE LOOP</h3>

          <p>
            Subscribe to receive updates about new collections, offers and
            exclusive deals.
          </p>

          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
            />

            <button type="submit" aria-label="Subscribe">
              →
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Zivora. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;