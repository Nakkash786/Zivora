import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ==========================================================
// PUBLIC ENDPOINTS
// ==========================================================

const publicEndpoints = [
  "/accounts/register/",
  "/accounts/login/",
  "/accounts/verify-otp/",
  "/accounts/resend-otp/",
  "/accounts/forgot-password/",
  "/accounts/verify-password-reset-otp/",
  "/accounts/reset-password/",
];

// ==========================================================
// CHECK PUBLIC ENDPOINT
// ==========================================================

const isPublicEndpoint = (url = "") => {
  return publicEndpoints.some((endpoint) => {
    return url === endpoint || url.startsWith(endpoint);
  });
};

// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    // ------------------------------------------------------
    // Public endpoint
    // ------------------------------------------------------

    if (isPublicEndpoint(requestUrl)) {
      if (config.headers) {
        delete config.headers.Authorization;
      }

      return config;
    }

    // ------------------------------------------------------
    // JWT Access Token
    // ------------------------------------------------------

    const accessToken =
      localStorage.getItem("access_token");

    if (accessToken) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    // ------------------------------------------------------
    // IMPORTANT:
    // If body is FormData, don't force JSON Content-Type.
    // Browser/Axios will automatically set:
    // multipart/form-data; boundary=...
    // ------------------------------------------------------

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      // JSON requests
      config.headers = config.headers || {};

      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================================
// REFRESH TOKEN VARIABLES
// ==========================================================

let isRefreshing = false;

let failedQueue = [];

// ==========================================================
// PROCESS FAILED REQUEST QUEUE
// ==========================================================

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    // ------------------------------------------------------
    // Never refresh public endpoints
    // ------------------------------------------------------

    if (isPublicEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    // ------------------------------------------------------
    // Only handle 401
    // ------------------------------------------------------

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // ------------------------------------------------------
    // Get refresh token
    // ------------------------------------------------------

    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new Event("authChanged")
      );

      return Promise.reject(error);
    }

    // ------------------------------------------------------
    // Another request is refreshing
    // ------------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((newAccessToken) => {
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      });
    }

    // ------------------------------------------------------
    // Start refresh
    // ------------------------------------------------------

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/accounts/token/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken =
        refreshResponse.data.access;

      const newRefreshToken =
        refreshResponse.data.refresh;

      // ----------------------------------------------------
      // Save new access token
      // ----------------------------------------------------

      localStorage.setItem(
        "access_token",
        newAccessToken
      );

      // ----------------------------------------------------
      // Save rotated refresh token
      // ----------------------------------------------------

      if (newRefreshToken) {
        localStorage.setItem(
          "refresh_token",
          newRefreshToken
        );
      }

      // ----------------------------------------------------
      // Resolve queued requests
      // ----------------------------------------------------

      processQueue(
        null,
        newAccessToken
      );

      // ----------------------------------------------------
      // Retry original request
      // ----------------------------------------------------

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {

      // ----------------------------------------------------
      // Refresh failed
      // ----------------------------------------------------

      processQueue(
        refreshError,
        null
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new Event("authChanged")
      );

      return Promise.reject(
        refreshError
      );

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;