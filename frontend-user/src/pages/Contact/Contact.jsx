import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <main className="contact-page">
      {/* =========================
          HEADER
      ========================= */}

      <section className="contact-header">
        <p className="contact-label">GET IN TOUCH</p>

        <h1>Contact Us</h1>

        <p className="contact-intro">
          Have a question about your order, products, delivery, or anything
          else? We are here to help.
        </p>
      </section>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="contact-container">
        {/* Contact Information */}

        <div className="contact-info">
          <div className="contact-info-header">
            <span>01</span>
            <h2>Let's talk</h2>
          </div>

          <p className="contact-description">
            Our support team is ready to assist you with any questions or
            concerns regarding your Zivora experience.
          </p>

          <div className="contact-details">
            <div className="contact-detail">
              <span className="contact-detail-number">01</span>

              <div>
                <h3>Email</h3>
                <a href="mailto:support@zivora.com">
                  support@zivora.com
                </a>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-number">02</span>

              <div>
                <h3>Phone</h3>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-number">03</span>

              <div>
                <h3>Working Hours</h3>
                <p>Monday – Saturday</p>
                <p>10:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-number">04</span>

              <div>
                <h3>Location</h3>
                <p>Kerala, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}

        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <p>CONTACT FORM</p>
            <h2>Send us a message</h2>
          </div>

          {submitted && (
            <div className="contact-success">
              Thank you! Your message has been received.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-field">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="subject">Subject</label>

              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="message">Message</label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="contact-submit">
              <span>Send Message</span>
              <span className="contact-submit-arrow">→</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Contact;