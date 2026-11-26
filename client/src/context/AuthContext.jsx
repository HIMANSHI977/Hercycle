
import {
  useEffect,
  useState
} from "react";

import AuthContext from "./AuthContext.js";

import API from '../services/api.js'

import {
  connectSocket,
  disconnectSocket
} from "../services/socket.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login session
  useEffect(() => {
    const token = localStorage.getItem("hercycle_token");

    if (!token) {
      setLoading(false);
      return;
    }

    API.get("/auth/me")
      .then((response) => {
        setUser(response.data.user);
        connectSocket(token);
      })
      .catch((error) => {
        console.error(
          "Session restoration failed:",
          error.message
        );

        localStorage.removeItem("hercycle_token");
        disconnectSocket();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      // No socket disconnection here.
      // The socket should remain connected while the user is authenticated.
    };
  }, []);

  // Register
  const register = async (formData) => {
    const response = await API.post(
      "/auth/register",
      formData
    );

    const { token, user } = response.data;

    localStorage.setItem("hercycle_token", token);

   disconnectSocket();
setUser(user);
connectSocket(token);

    return response.data;
  };

  // Login
  const login = async (formData) => {
    const response = await API.post(
      "/auth/login",
      formData
    );

    const { token, user } = response.data;

    localStorage.setItem("hercycle_token", token);

   disconnectSocket();
setUser(user);
connectSocket(token);

    return response.data;
  };

  // Logout
  const logout = () => {
    disconnectSocket();

    localStorage.removeItem("hercycle_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
