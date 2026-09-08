import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  const isAuthenticated = !!localStorage.getItem(
    "access_token"
  );

  // ==========================================================
  // LOAD USER
  // ==========================================================

  const loadUser = async () => {
    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(
        "/accounts/profile/"
      );

      setUser(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error(
        "Failed to load user:",
        error
      );

      // ------------------------------------------------------
      // If refresh also failed, api.js will reject here
      // ------------------------------------------------------

      const status =
        error.response?.status;

      if (status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem("user");

        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Invalid saved user:",
          error
        );

        localStorage.removeItem("user");
      }
    }

    loadUser();
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const response = await api.post(
        "/accounts/login/",
        {
          email,
          password,
        }
      );

      console.log(
        "Login response:",
        response.data
      );

      const {
        access,
        refresh,
        user: loggedInUser,
      } = response.data;

      // ------------------------------------------------------
      // Save JWT tokens
      // ------------------------------------------------------

      localStorage.setItem(
        "access_token",
        access
      );

      localStorage.setItem(
        "refresh_token",
        refresh
      );

      // ------------------------------------------------------
      // Save user
      // ------------------------------------------------------

      if (loggedInUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);
      } else {
        await loadUser();
      }

      // ------------------------------------------------------
      // Tell Navbar and other components
      // ------------------------------------------------------

      window.dispatchEvent(
        new Event("authChanged")
      );

      return response.data;
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      throw error;
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {
    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );

    try {
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
        "Logout request failed:",
        error
      );
    } finally {
      // ------------------------------------------------------
      // Clear authentication data
      // ------------------------------------------------------

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem("user");

      setUser(null);

      // ------------------------------------------------------
      // Tell Navbar and other components
      // ------------------------------------------------------

      window.dispatchEvent(
        new Event("authChanged")
      );

      navigate("/login", {
        replace: true,
      });
    }
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    window.dispatchEvent(
      new Event("authChanged")
    );
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    loadUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================================
// CUSTOM HOOK
// ==========================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;