// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Movies from "./pages/Movies.jsx";
import Showtimes from "./pages/Showtimes.jsx";
import Theaters from "./pages/Theaters.jsx";
import Bookings from "./pages/Bookings.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/showtimes" element={<Showtimes />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
