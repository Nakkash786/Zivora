import React from "react";
import "./Terms.css";

function Terms() {
  return (
    <main className="terms-page">
      <section className="terms-header">
        <p className="terms-label">ZIVORA</p>
        <h1>Terms & Conditions</h1>
        <p>
          Please read these terms carefully before using the Zivora website
          and services.
        </p>
      </section>

      <section className="terms-content">
        <div className="terms-section">
          <span>01</span>
          <div>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using Zivora, you agree to follow these Terms &
              Conditions. If you do not agree with any part of these terms,
              please do not use our website or services.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>02</span>
          <div>
            <h2>Account</h2>
            <p>
              You are responsible for providing accurate information when
              creating an account and for keeping your account information
              secure.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>03</span>
          <div>
            <h2>Products & Pricing</h2>
            <p>
              We try to display product information, images, availability,
              and prices accurately. Product availability and prices may
              change without prior notice.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>04</span>
          <div>
            <h2>Orders</h2>
            <p>
              Placing an order does not guarantee acceptance until the order
              has been confirmed by Zivora. We may cancel an order in cases
              such as product unavailability or pricing errors.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>05</span>
          <div>
            <h2>Payments</h2>
            <p>
              Payments are processed through the available payment methods
              shown during checkout. You agree to provide valid information
              required to complete your purchase.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>06</span>
          <div>
            <h2>Shipping & Delivery</h2>
            <p>
              Delivery times may vary depending on the delivery location,
              product availability, and other circumstances. Tracking
              information may be provided when available.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>07</span>
          <div>
            <h2>Returns & Refunds</h2>
            <p>
              Returns and refunds are subject to Zivora's applicable return
              policy. Products must meet the conditions specified in that
              policy.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>08</span>
          <div>
            <h2>Website Usage</h2>
            <p>
              You must not misuse the website, attempt unauthorized access,
              interfere with its operation, or use the service for unlawful
              purposes.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>09</span>
          <div>
            <h2>Intellectual Property</h2>
            <p>
              Zivora's website content, branding, design, text, graphics, and
              other materials are protected and should not be copied or
              reproduced without permission.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>10</span>
          <div>
            <h2>Changes to These Terms</h2>
            <p>
              Zivora may update these Terms & Conditions when necessary.
              Updated terms will apply once they are published on the
              website.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <span>11</span>
          <div>
            <h2>Contact</h2>
            <p>
              If you have questions about these terms, please contact the
              Zivora support team through the Contact Us page.
            </p>
          </div>
        </div>
      </section>

      <div className="terms-updated">
        Last updated: September 2026
      </div>
    </main>
  );
}

export default Terms;