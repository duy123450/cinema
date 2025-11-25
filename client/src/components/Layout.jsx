import React, { useEffect } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { apiService } from "../services/api";

function Layout({ children }) {
  // 👇 Session keep-alive effect
  useEffect(() => {
    const keepAlive = setInterval(async () => {
      try {
        await apiService.ping();
        // Session is still active
      } catch (error) {
        // Session expired, but we don't redirect here
        // Redirect will happen on next API call via interceptor
        console.error("Session keep-alive failed:", error);
      }
    }, 300000); // Every 5 minutes (300,000 ms)

    // Cleanup interval on unmount
    return () => clearInterval(keepAlive);
  }, []); // Empty dependency array = runs once on mount

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
