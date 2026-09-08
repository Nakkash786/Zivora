import api from "./api";

// ==========================================================
// GET ADDRESSES
// ==========================================================

export const getAddresses = async () => {
  const response = await api.get("/accounts/addresses/");
  return response.data;
};

// ==========================================================
// CREATE ORDER
// ==========================================================

export const createOrder = async (orderData) => {
  const response = await api.post(
    "/orders/create/",
    orderData
  );

  return response.data;
};

// ==========================================================
// VERIFY RAZORPAY PAYMENT
// ==========================================================

export const verifyRazorpayPayment = async ({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await api.post(
    "/orders/razorpay/verify/",
    {
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }
  );

  return response.data;
};

// ==========================================================
// RAZORPAY PAYMENT FAILED
// ==========================================================

export const markRazorpayPaymentFailed = async ({
  orderId,
  razorpayOrderId,
  reason = "",
  note = "",
}) => {
  const response = await api.post(
    "/orders/razorpay/failed/",
    {
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      reason,
      note,
    }
  );

  return response.data;
};

// ==========================================================
// GET MY ORDERS
// ==========================================================

export const getMyOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

// ==========================================================
// GET SINGLE ORDER
// ==========================================================

export const getOrder = async (orderId) => {
  const response = await api.get(
    `/orders/${orderId}/`
  );

  return response.data;
};

// ==========================================================
// CANCEL ORDER
// ==========================================================

export const cancelOrder = async (
  orderId,
  reason,
  note = ""
) => {
  const response = await api.post(
    `/orders/${orderId}/cancel/`,
    {
      reason,
      note,
    }
  );

  return response.data;
};

// ==========================================================
// REQUEST RETURN
// ==========================================================

export const requestReturn = async (
  orderId,
  reason,
  note = ""
) => {
  const response = await api.post(
    `/orders/${orderId}/return/`,
    {
      reason,
      note,
    }
  );

  return response.data;
};