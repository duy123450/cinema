import React, { createContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, check if there's a stored user in localStorage
        const storedUser = localStorage.getItem("user");

        if (storedUser && storedUser !== "undefined") {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === "object") {
              try {
                // Verify the session is still active on the server
                const response = await apiService.ping();

                if (response.success) {
                  // Session is valid, set the user
                  setUser(parsedUser);
                } else {
                  // Session expired, clear localStorage
                  localStorage.removeItem("user");
                }
              } catch (pingError) {
                // Ping failed (network error, server down, etc)
                // Keep user logged in locally but note the error
                console.warn(
                  "Could not verify session with server:",
                  pingError
                );
                setUser(parsedUser);
              }
            }
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("User logged in:", userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    console.log("User logged out");
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
