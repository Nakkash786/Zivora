import React from "react";
import "./Shipping.css";

function Shipping() {
  return (
    <main className="shipping-page">
      <section className="shipping-header">
        <p className="shipping-label">ZIVORA</p>

        <h1>Shipping & Delivery</h1>

        <p>
          Everything you need to know about order processing, delivery,
          tracking, and shipping.
        </p>
      </section>

      <section className="shipping-content">
        <div className="shipping-section">
          <span>01</span>

          <div>
            <h2>Order Processing</h2>

            <p>
              Once your order is successfully placed, we begin processing it.
              Orders are generally prepared for shipment after payment or
              order confirmation.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>02</span>

          <div>
            <h2>Delivery Time</h2>

            <p>
              Delivery time may vary depending on your location, product
              availability, courier service, and other circumstances.
            </p>

            <p>
              The estimated delivery information shown during checkout should
              be considered an approximate timeframe.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>03</span>

          <div>
            <h2>Shipping Address</h2>

            <p>
              Please make sure that your delivery address, phone number, and
              other contact information are correct before placing your order.
            </p>

            <p>
              An incorrect or incomplete address may result in delivery
              delays.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>04</span>

          <div>
            <h2>Order Tracking</h2>

            <p>
              After your order has been shipped, tracking information may be
              available through your Zivora account.
            </p>

            <p>
              You can open your order details to check the current status of
              your order.
            </p>

            <a href="/orders">View My Orders →</a>
          </div>
        </div>

        <div className="shipping-section">
          <span>05</span>

          <div>
            <h2>Delivery Status</h2>

            <p>
              Your order may move through different stages such as Order
              Placed, Payment Confirmed, Processing, Shipped, Out for
              Delivery, and Delivered.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>06</span>

          <div>
            <h2>Delivery Attempts</h2>

            <p>
              Our delivery partners may make delivery attempts according to
              their standard procedures. Please ensure that someone is
              available to receive the package when required.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>07</span>

          <div>
            <h2>Delayed Orders</h2>

            <p>
              Occasionally, an order may be delayed because of weather,
              courier issues, high demand, address problems, or other
              circumstances outside our control.
            </p>
          </div>
        </div>

        <div className="shipping-section">
          <span>08</span>

          <div>
            <h2>Damaged Package</h2>

            <p>
              If your package appears damaged when it arrives, please contact
              Zivora support as soon as possible with the relevant order
              information.
            </p>

            <a href="/contact">Contact Support →</a>
          </div>
        </div>

        <div className="shipping-section">
          <span>09</span>

          <div>
            <h2>Questions About Delivery?</h2>

            <p>
              If you need help with your delivery or order status, our support
              team is available to assist you.
            </p>

            <a href="/contact">Get in Touch →</a>
          </div>
        </div>
      </section>

      <div className="shipping-updated">
        Last updated: September 2026
      </div>
    </main>
  );
}

export default Shipping;