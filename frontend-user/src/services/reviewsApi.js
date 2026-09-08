import api from "./api";

// ==========================================================
// GET APPROVED REVIEWS FOR A PRODUCT
// ==========================================================

export const getProductReviews = async (productId) => {
  const response = await api.get(
    `/reviews/product/${productId}/`
  );

  return response.data;
};

// ==========================================================
// CREATE REVIEW
// ==========================================================

export const createReview = async (reviewData) => {
  const response = await api.post(
    "/reviews/create/",
    reviewData
  );

  return response.data;
};

// ==========================================================
// GET MY REVIEWS
// ==========================================================

export const getMyReviews = async () => {
  const response = await api.get(
    "/reviews/my/"
  );

  return response.data;
};

export default {
  getProductReviews,
  createReview,
  getMyReviews,
};