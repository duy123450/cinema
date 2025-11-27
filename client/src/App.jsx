import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Movies from "./pages/Movies.jsx";
import Showtimes from "./pages/Showtimes.jsx";
import Theaters from "./pages/Theaters.jsx";
import Bookings from "./pages/Bookings.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./components/Layout.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <Router>
      <Routes>
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
          path="/showtimes"
          element={
            <Layout>
              <Showtimes />
            </Layout>
          }
        />
        <Route
          path="/theaters"
          element={
            <Layout>
              <Theaters />
            </Layout>
          }
        />
        <Route
          path="/bookings"
          element={
            <Layout>
              <Bookings />
            </Layout>
          }
        />

        {/* Admin page (also needs header/footer) */}
        <Route
          path="/admin"
          element={
            <Layout>
              <Admin />
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
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
