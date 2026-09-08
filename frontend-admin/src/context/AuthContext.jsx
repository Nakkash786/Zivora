import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const navigate = useNavigate();


  const [admin, setAdmin] = useState(null);

  const [loading, setLoading] = useState(true);


  /* =========================================================
     AUTHENTICATION STATUS
  ========================================================= */

  const isAuthenticated = Boolean(
    localStorage.getItem(
      "admin_access_token"
    )
  );


  /* =========================================================
     LOAD ADMIN PROFILE
  ========================================================= */

  const loadAdmin = async () => {

    const accessToken =
      localStorage.getItem(
        "admin_access_token"
      );


    // -------------------------------------------------------
    // NO ACCESS TOKEN
    // -------------------------------------------------------

    if (!accessToken) {

      setAdmin(null);

      setLoading(false);

      return;
    }


    try {

      const response =
        await api.get(
          "/accounts/admin/profile/"
        );


      const adminUser =
        response.data;


      setAdmin(
        adminUser
      );


      localStorage.setItem(
        "admin_user",
        JSON.stringify(
          adminUser
        )
      );

    } catch (error) {

      console.error(
        "Load admin profile error:",
        error
      );


      localStorage.removeItem(
        "admin_access_token"
      );

      localStorage.removeItem(
        "admin_refresh_token"
      );

      localStorage.removeItem(
        "admin_user"
      );


      setAdmin(null);

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL AUTH CHECK
  ========================================================= */

  useEffect(() => {

    loadAdmin();

  }, []);


  /* =========================================================
     LOGIN
  ========================================================= */

  const login = async (
    email,
    password
  ) => {

    const response =
      await api.post(
        "/accounts/login/",
        {
          email,
          password,
        }
      );


    const user =
      response.data.user;


    // -------------------------------------------------------
    // ADMIN CHECK
    // -------------------------------------------------------

    if (!user?.is_staff) {

      throw new Error(
        "You are not authorized to access the admin panel."
      );
    }


    // -------------------------------------------------------
    // SAVE ACCESS TOKEN
    // -------------------------------------------------------

    localStorage.setItem(
      "admin_access_token",
      response.data.access
    );


    // -------------------------------------------------------
    // SAVE REFRESH TOKEN
    // -------------------------------------------------------

    localStorage.setItem(
      "admin_refresh_token",
      response.data.refresh
    );


    // -------------------------------------------------------
    // SAVE USER
    // -------------------------------------------------------

    localStorage.setItem(
      "admin_user",
      JSON.stringify(user)
    );


    // -------------------------------------------------------
    // UPDATE STATE
    // -------------------------------------------------------

    setAdmin(user);


    // -------------------------------------------------------
    // GO TO DASHBOARD
    // -------------------------------------------------------

    navigate(
      "/dashboard"
    );


    return response.data;
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = async () => {

    const refreshToken =
      localStorage.getItem(
        "admin_refresh_token"
      );


    try {

      // -----------------------------------------------------
      // BLACKLIST REFRESH TOKEN
      // -----------------------------------------------------

      if (refreshToken) {

        await api.post(
          "/accounts/logout/",
          {
            refresh: refreshToken,
          }
        );
      }

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    } finally {

      // -----------------------------------------------------
      // CLEAR AUTH DATA
      // -----------------------------------------------------

      localStorage.removeItem(
        "admin_access_token"
      );

      localStorage.removeItem(
        "admin_refresh_token"
      );

      localStorage.removeItem(
        "admin_user"
      );


      // -----------------------------------------------------
      // CLEAR ADMIN STATE
      // -----------------------------------------------------

      setAdmin(null);


      // -----------------------------------------------------
      // FULL PAGE REDIRECT
      // -----------------------------------------------------
      // This prevents the previous protected page
      // from being restored after logout.

      window.location.replace(
        "/login"
      );
    }
  };


  /* =========================================================
     AUTH CONTEXT
  ========================================================= */

  return (
    <AuthContext.Provider
      value={{

        // Main admin object
        admin,

        // Alias used by AdminLayout
        user: admin,

        loading,

        isAuthenticated,

        login,

        logout,

        loadAdmin,

      }}
    >

      {children}

    </AuthContext.Provider>
  );
}


/* =========================================================
   USE AUTH
========================================================= */

export function useAuth() {

  return useContext(
    AuthContext
  );
}