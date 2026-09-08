import React from "react";
import "./Privacy.css";

function Privacy() {
  return (
    <main className="privacy-page">
      {/* Header */}
      <section className="privacy-header">
        <p className="privacy-label">ZIVORA</p>

        <h1>Privacy Policy</h1>

        <p>
          Your privacy matters to us. This policy explains how Zivora
          collects, uses, and protects your information.
        </p>
      </section>

      {/* Content */}
      <section className="privacy-content">

        <div className="privacy-section">
          <span>01</span>

          <div>
            <h2>Information We Collect</h2>

            <p>
              When you use Zivora, we may collect information that you
              provide while creating an account, placing an order, contacting
              us, or using other services on our website.
            </p>

            <p>
              This may include your name, email address, phone number,
              delivery address, and information related to your orders.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>02</span>

          <div>
            <h2>How We Use Your Information</h2>

            <p>
              We use your information to create and manage your account,
              process orders, provide delivery services, communicate with
              you, and improve your shopping experience.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>03</span>

          <div>
            <h2>Account Information</h2>

            <p>
              You are responsible for keeping your account information
              accurate and maintaining the security of your login
              credentials.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>04</span>

          <div>
            <h2>Orders & Payments</h2>

            <p>
              Information required for processing your orders may be used
              to complete purchases, arrange delivery, provide order
              tracking, and handle returns or refunds.
            </p>

            <p>
              Online payments are processed through our supported payment
              service providers. Zivora does not need to store your complete
              payment-card details on our website.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>05</span>

          <div>
            <h2>Cookies</h2>

            <p>
              Zivora may use cookies or similar technologies to remember
              preferences, support website functionality, and improve the
              overall user experience.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>06</span>

          <div>
            <h2>Information Sharing</h2>

            <p>
              We may share necessary information with trusted service
              providers involved in payment processing, delivery, email
              communication, and website operations.
            </p>

            <p>
              We do not sell your personal information to third parties.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>07</span>

          <div>
            <h2>Data Security</h2>

            <p>
              We take reasonable measures to protect the information
              associated with your Zivora account and orders. However, no
              online service can guarantee complete security.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>08</span>

          <div>
            <h2>Your Choices</h2>

            <p>
              You may review or update certain account information through
              your Zivora profile. You can also contact us if you have
              questions about your personal information.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>09</span>

          <div>
            <h2>Children's Privacy</h2>

            <p>
              Zivora is not intended to knowingly collect personal
              information from children without appropriate permission or
              involvement of a parent or guardian.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>10</span>

          <div>
            <h2>Changes to This Policy</h2>

            <p>
              We may update this Privacy Policy when necessary. Any updated
              version will be published on this page.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <span>11</span>

          <div>
            <h2>Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy or how your
              information is handled, please contact the Zivora support
              team.
            </p>

            <a href="/contact">Contact Zivora Support →</a>
          </div>
        </div>

      </section>

      <div className="privacy-updated">
        Last updated: September 2026
      </div>
    </main>
  );
}

export default Privacy;