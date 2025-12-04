import axios from 'axios';

// Create axios instance with proper configuration
const api = axios.create({
    baseURL: import.meta.env.DEV
        ? 'http://localhost/server/api'
        : '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// =============================================
// AUTHENTICATION ENDPOINTS
// =============================================

export const apiService = {
    // ===== MOVIES =====
    getMovies: async (status = null) => {
        const url = status ? `/movies?status=${status}` : '/movies';
        const response = await api.get(url);
        return response.data;
    },

    getMovieById: async (movieId) => {
        const response = await api.get(`/movies?id=${movieId}`);
        return response.data;
    },

    createMovie: async (movieData) => {
        const response = await api.post('/movies', movieData);
        return response.data;
    },

    updateMovie: async (movieId, movieData) => {
        const response = await api.put(`/movies?id=${movieId}`, movieData);
        return response.data;
    },

    deleteMovie: async (movieId) => {
        const response = await api.delete(`/movies?id=${movieId}`);
        return response.data;
    },

    // ===== SHOWTIMES =====
    getShowtimes: async (filters = {}) => {
        let url = '/showtimes';
        const params = new URLSearchParams();

        if (filters.movieId) params.append('movie_id', filters.movieId);
        if (filters.cinemaId) params.append('cinema_id', filters.cinemaId);
        if (filters.date) params.append('date', filters.date);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await api.get(url);
        return response.data;
    },

    getShowtimeById: async (showtimeId) => {
        const response = await api.get(`/showtimes?id=${showtimeId}`);
        return response.data;
    },

    createShowtime: async (showtimeData) => {
        const response = await api.post('/showtimes', showtimeData);
        return response.data;
    },

    updateShowtime: async (showtimeId, showtimeData) => {
        const response = await api.put(`/showtimes?id=${showtimeId}`, showtimeData);
        return response.data;
    },

    deleteShowtime: async (showtimeId) => {
        const response = await api.delete(`/showtimes?id=${showtimeId}`);
        return response.data;
    },

    // ===== CINEMAS/THEATERS =====
    getCinemas: async (city = null) => {
        const url = city ? `/theaters?city=${encodeURIComponent(city)}` : '/theaters';
        const response = await api.get(url);
        return response.data;
    },

    getCinemaById: async (cinemaId) => {
        const response = await api.get(`/theaters?id=${cinemaId}`);
        return response.data;
    },

    createCinema: async (cinemaData) => {
        const response = await api.post('/theaters', cinemaData);
        return response.data;
    },

    updateCinema: async (cinemaId, cinemaData) => {
        const response = await api.put(`/theaters?id=${cinemaId}`, cinemaData);
        return response.data;
    },

    deleteCinema: async (cinemaId) => {
        const response = await api.delete(`/theaters?id=${cinemaId}`);
        return response.data;
    },

    // ===== BOOKINGS/TICKETS =====
    getBookings: async (userId = null) => {
        const url = userId ? `/bookings?user_id=${userId}` : '/bookings';
        const response = await api.get(url);
        return response.data;
    },

    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    updateBooking: async (ticketId, bookingData) => {
        const response = await api.put(`/bookings?id=${ticketId}`, bookingData);
        return response.data;
    },

    cancelBooking: async (ticketId) => {
        const response = await api.delete(`/bookings?id=${ticketId}`);
        return response.data;
    },

    // ===== USERS =====
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await api.get(`/users?id=${userId}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/users?id=${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/users?id=${userId}`);
        return response.data;
    },

    // ===== AUTHENTICATION =====
    registerUser: async (formData) => {
        const response = await api.post('/register.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    logout: async () => {
        const response = await api.get('/logout.php');
        return response.data;
    },

    // ===== PROFILE & PASSWORD =====
    updateProfile: async (userId, formData, avatarFile = null) => {
        const formDataWithAvatar = new FormData();
        formDataWithAvatar.append('user_id', userId);
        formDataWithAvatar.append('profile_data', JSON.stringify(formData));

        if (avatarFile) {
            formDataWithAvatar.append('avatar', avatarFile);
        }

        const response = await api.post(`/users?id=${userId}`, formDataWithAvatar, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.user;
    },

    updatePassword: async (userId, passwordData) => {
        const response = await api.post('/update-password.php', {
            user_id: userId,
            ...passwordData
        });
        return response.data;
    },

    // ===== PASSWORD RECOVERY =====
    forgotPassword: async (email) => {
        const response = await api.post('/forget-password.php', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post('/reset-password.php', { token, password });
        return response.data;
    },

    // ===== SESSION MANAGEMENT =====
    ping: async () => {
        const response = await api.get('/ping.php');
        return response.data;
    },
};

export default apiService;