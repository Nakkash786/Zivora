import api from "./api";

// Validate coupon
export const validateCoupon = async (code, orderAmount) => {
  const response = await api.post("/coupons/validate/", {
    code,
    order_amount: orderAmount,
  });

  return response.data;
};

export default {
  validateCoupon,
};