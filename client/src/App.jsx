import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Movies from "./pages/Movies.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Showtimes from "./pages/Showtimes.jsx";
import Cinemas from "./pages/Cinemas.jsx";
import Bookings from "./pages/Bookings.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./components/Layout.jsx";
import Profile from "./pages/Profile.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Layout>
              <Index />
            </Layout>
          }
        />
        <Route
          path="/movies"
          element={
            <Layout>
              <Movies />
            </Layout>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <Layout>
              <MovieDetail />
            </Layout>
          }
        />
        <Route
          path="/showtimes"
          element={
            <Layout>
              <Showtimes />
            </Layout>
          }
        />
        <Route
          path="/cinemas"
          element={
            <Layout>
              <Cinemas />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Layout>
              <ForgotPassword />
            </Layout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Layout>
              <ResetPassword />
            </Layout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <Bookings />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <Admin />
                </Layout>
              }
            />
          }
        />

        {/* 404 Page Not Found */}
        <Route
          path="*"
          element={
            <Layout>
              <PageNotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;