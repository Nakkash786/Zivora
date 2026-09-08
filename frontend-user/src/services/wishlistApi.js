import api from "./api";

// ==========================================================
// GET WISHLIST
// ==========================================================

export const getWishlist = async () => {
  const response = await api.get("/wishlist/");
  return response.data;
};


// ==========================================================
// ADD PRODUCT TO WISHLIST
// ==========================================================

export const addToWishlist = async (productId) => {
  const response = await api.post("/wishlist/add/", {
    product: productId,
  });

  return response.data;
};


// ==========================================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================================

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(
    `/wishlist/remove/${productId}/`
  );

  return response.data;
};


// ==========================================================
// CHECK WISHLIST STATUS
// ==========================================================

export const getWishlistStatus = async (productId) => {
  const response = await api.get(
    `/wishlist/status/${productId}/`
  );

  return response.data;
};