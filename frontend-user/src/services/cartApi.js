import api from "./api";

// ==========================================
// GET CART
// ==========================================

export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};


// ==========================================
// ADD TO CART
// ==========================================

export const addToCart = async (
  productId,
  variantId,
  quantity = 1
) => {
  const response = await api.post("/cart/add/", {
    product: productId,
    variant: variantId,
    quantity,
  });

  return response.data;
};


// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

export const updateCartItem = async (
  itemId,
  quantity
) => {
  const response = await api.patch(
    `/cart/items/${itemId}/`,
    {
      quantity,
    }
  );

  // Backend returns:
  // {
  //   detail: "...",
  //   cart: {...}
  // }

  return response.data.cart;
};


// ==========================================
// REMOVE CART ITEM
// ==========================================

export const removeCartItem = async (itemId) => {
  const response = await api.delete(
    `/cart/items/${itemId}/remove/`
  );

  return response.data.cart;
};


// ==========================================
// CLEAR CART
// ==========================================

export const clearCart = async () => {
  const response = await api.delete("/cart/clear/");

  return response.data.cart;
};