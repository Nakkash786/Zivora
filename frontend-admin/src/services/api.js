import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================================
// PUBLIC ENDPOINTS
// ==========================================================

const publicEndpoints = [
  "/accounts/login/",
  "/accounts/token/refresh/",
];

// ==========================================================
// REFRESH STATE
// ==========================================================

let isRefreshing = false;

let refreshSubscribers = [];


// ==========================================================
// CHECK PUBLIC ENDPOINT
// ==========================================================

const isPublicEndpoint = (url = "") => {
  return publicEndpoints.some(
    (endpoint) => url === endpoint
  );
};


// ==========================================================
// SUBSCRIBE TO TOKEN REFRESH
// ==========================================================

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};


// ==========================================================
// NOTIFY TOKEN REFRESH
// ==========================================================

const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newAccessToken);
  });

  refreshSubscribers = [];
};


// ==========================================================
// CLEAR ADMIN AUTH
// ==========================================================

const clearAdminAuth = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
};


// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

api.interceptors.request.use(
  (config) => {

    const accessToken =
      localStorage.getItem("admin_access_token");

    const requestUrl = config.url || "";

    const publicRequest =
      isPublicEndpoint(requestUrl);


    // ------------------------------------------------------
    // ADMIN AUTHORIZATION
    // ------------------------------------------------------

    if (accessToken && !publicRequest) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }


    // ------------------------------------------------------
    // PUBLIC REQUEST
    // ------------------------------------------------------

    if (publicRequest) {

      if (config.headers) {
        delete config.headers.Authorization;
      }
    }


    // ------------------------------------------------------
    // FORMDATA / IMAGE UPLOAD
    // ------------------------------------------------------

    if (config.data instanceof FormData) {

      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }

      // Browser automatically adds:
      //
      // multipart/form-data;
      // boundary=...
    }


    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(

  (response) => {
    return response;
  },


  async (error) => {

    const originalRequest = error.config;

    const status = error.response?.status;

    const requestUrl =
      originalRequest?.url || "";


    // ------------------------------------------------------
    // ONLY HANDLE 401
    // ------------------------------------------------------

    if (
      status !== 401 ||
      !originalRequest ||
      isPublicEndpoint(requestUrl)
    ) {
      return Promise.reject(error);
    }


    // ------------------------------------------------------
    // PREVENT INFINITE RETRY
    // ------------------------------------------------------

    if (originalRequest._retry) {

      clearAdminAuth();

      return Promise.reject(error);
    }

    originalRequest._retry = true;


    // ------------------------------------------------------
    // GET REFRESH TOKEN
    // ------------------------------------------------------

    const refreshToken =
      localStorage.getItem(
        "admin_refresh_token"
      );


    if (!refreshToken) {

      clearAdminAuth();

      return Promise.reject(error);
    }


    // ------------------------------------------------------
    // IF ANOTHER REQUEST IS ALREADY REFRESHING
    // WAIT FOR IT
    // ------------------------------------------------------

    if (isRefreshing) {

      return new Promise(
        (resolve, reject) => {

          subscribeTokenRefresh(
            (newAccessToken) => {

              if (!newAccessToken) {

                reject(error);

                return;
              }


              originalRequest.headers =
                originalRequest.headers || {};

              originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


              resolve(
                api(originalRequest)
              );
            }
          );

        }
      );
    }


    // ------------------------------------------------------
    // START TOKEN REFRESH
    // ------------------------------------------------------

    isRefreshing = true;


    try {

      const refreshResponse =
        await axios.post(
          `${API_BASE_URL}/accounts/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );


      const newAccessToken =
        refreshResponse.data.access;


      if (!newAccessToken) {
        throw new Error(
          "New access token was not returned."
        );
      }


      // ----------------------------------------------------
      // SAVE NEW ACCESS TOKEN
      // ----------------------------------------------------

      localStorage.setItem(
        "admin_access_token",
        newAccessToken
      );


      // ----------------------------------------------------
      // WAKE WAITING REQUESTS
      // ----------------------------------------------------

      onTokenRefreshed(
        newAccessToken
      );


      // ----------------------------------------------------
      // RETRY ORIGINAL REQUEST
      // ----------------------------------------------------

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      return api(originalRequest);

    } catch (refreshError) {

      // ----------------------------------------------------
      // REFRESH FAILED
      // ----------------------------------------------------

      clearAdminAuth();

      onTokenRefreshed(null);

      return Promise.reject(
        refreshError
      );

    } finally {

      isRefreshing = false;
    }

  }
);


export default api;