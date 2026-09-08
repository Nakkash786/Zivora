import React from "react";
import "./Returns.css";

function Returns() {
  return (
    <main className="returns-page">
      <section className="returns-header">
        <p className="returns-label">ZIVORA</p>

        <h1>Returns & Refunds</h1>

        <p>
          Learn about return requests, eligibility, refunds, and the steps
          involved in resolving an order issue.
        </p>
      </section>

      <section className="returns-content">
        <div className="returns-section">
          <span>01</span>
          <div>
            <h2>Return Eligibility</h2>
            <p>
              Return eligibility depends on the product, its condition, and
              the applicable return period. Products should be returned in
              the condition required by Zivora's return policy.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>02</span>
          <div>
            <h2>How to Request a Return</h2>
            <p>
              You can request a return for an eligible delivered order from
              your Zivora order details page.
            </p>

            <a href="/orders">View My Orders →</a>
          </div>
        </div>

        <div className="returns-section">
          <span>03</span>
          <div>
            <h2>Return Reasons</h2>
            <p>
              When submitting a return request, please select the reason that
              best describes the issue and provide any additional information
              that may help our support team.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>04</span>
          <div>
            <h2>Product Condition</h2>
            <p>
              Returned products may need to meet applicable condition,
              packaging, and other return requirements before a refund can be
              processed.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>05</span>
          <div>
            <h2>Return Review</h2>
            <p>
              After receiving a return request, Zivora may review the request
              before approving or rejecting it.
            </p>

            <p>
              You can check the latest return status from your order details
              page.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>06</span>
          <div>
            <h2>Refunds</h2>
            <p>
              Once an eligible return has been approved and processed, the
              applicable refund will be initiated according to the payment
              method and refund process.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>07</span>
          <div>
            <h2>Refund Processing Time</h2>
            <p>
              The time required for a refund to appear may vary depending on
              the payment provider, bank, or other financial service involved.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>08</span>
          <div>
            <h2>Non-Eligible Returns</h2>
            <p>
              A return request may be rejected if the order or product does
              not meet the applicable return requirements.
            </p>
          </div>
        </div>

        <div className="returns-section">
          <span>09</span>
          <div>
            <h2>Damaged or Incorrect Product</h2>
            <p>
              If you receive a damaged, defective, or incorrect product,
              contact Zivora support with your order information so that the
              issue can be reviewed.
            </p>

            <a href="/contact">Contact Support →</a>
          </div>
        </div>

        <div className="returns-section">
          <span>10</span>
          <div>
            <h2>Questions About Returns?</h2>
            <p>
              If you need assistance with a return or refund, our support
              team can help you with the next steps.
            </p>

            <a href="/contact">Get in Touch →</a>
          </div>
        </div>
      </section>

      <div className="returns-updated">
        Last updated: September 2026
      </div>
    </main>
  );
}

export default Returns;