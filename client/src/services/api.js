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
// API SERVICE METHODS
// =============================================

export const apiService = {
    // ===== BANNER =====
    getBanners: async () => {
        const response = await api.get('/banner.php');
        return response.data;
    },

    // ===== SEARCH =====
    searchMovies: async (query) => {
        const response = await api.get(`/search.php?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    // ===== MOVIES =====
    getMovies: async (status = null) => {
        const url = status ? `/movies.php?status=${status}` : '/movies.php';
        const response = await api.get(url);
        return response.data;
    },

    getMovieById: async (movieId) => {
        const response = await api.get(`/movies.php?id=${movieId}`);
        return response.data;
    },

    createMovie: async (movieData) => {
        const response = await api.post('/movies.php', movieData);
        return response.data;
    },

    updateMovie: async (movieId, movieData) => {
        const response = await api.put(`/movies.php?id=${movieId}`, movieData);
        return response.data;
    },

    deleteMovie: async (movieId) => {
        const response = await api.delete(`/movies.php?id=${movieId}`);
        return response.data;
    },

    // ===== MOVIE TRAILERS =====
    getMovieTrailers: async (movieId) => {
        const response = await api.get(`/movie-trailers.php?movie_id=${movieId}`);
        return response.data;
    },

    // ===== MOVIE CAST =====
    getMovieCast: async (movieId) => {
        const response = await api.get(`/movie-cast.php?movie_id=${movieId}`);
        return response.data;
    },

    // ===== USER MOVIE RATING =====
    getUserMovieRating: async (movieId, userId) => {
        try {
            const response = await api.get(`/user-rating.php?movie_id=${movieId}&user_id=${userId}`);
            return response.data.rating;
        } catch (error) {
            // If no rating found, return 0
            if (error.response?.status === 404) {
                return 0;
            }
            throw error;
        }
    },

    rateMovie: async (movieId, userId, rating) => {
        const response = await api.post('/user-rating.php', {
            movie_id: movieId,
            user_id: userId,
            rating: rating
        });
        return response.data;
    },

    // ===== ACTORS =====
    getActors: async () => {
        const response = await api.get('/actors.php');
        return response.data;
    },

    getActorById: async (actorId) => {
        const response = await api.get(`/actors.php?id=${actorId}`);
        return response.data;
    },

    getActorMovies: async (actorId) => {
        const response = await api.get(`/actor-movies.php?actor_id=${actorId}`);
        return response.data;
    },

    // ===== SHOWTIMES =====
    getShowtimes: async (filters = {}) => {
        let url = '/showtimes.php';
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
        const response = await api.get(`/showtimes.php?id=${showtimeId}`);
        return response.data;
    },

    createShowtime: async (showtimeData) => {
        const response = await api.post('/showtimes.php', showtimeData);
        return response.data;
    },

    updateShowtime: async (showtimeId, showtimeData) => {
        const response = await api.put(`/showtimes.php?id=${showtimeId}`, showtimeData);
        return response.data;
    },

    deleteShowtime: async (showtimeId) => {
        const response = await api.delete(`/showtimes.php?id=${showtimeId}`);
        return response.data;
    },

    // ===== CINEMAS/THEATERS =====
    getCinemas: async (city = null) => {
        const url = city ? `/cinemas.php?city=${encodeURIComponent(city)}` : '/cinemas.php';
        const response = await api.get(url);
        return response.data;
    },

    getCinemaById: async (cinemaId) => {
        const response = await api.get(`/cinemas.php?id=${cinemaId}`);
        return response.data;
    },

    createCinema: async (cinemaData) => {
        const response = await api.post('/cinemas.php', cinemaData);
        return response.data;
    },

    updateCinema: async (cinemaId, cinemaData) => {
        const response = await api.put(`/cinemas.php?id=${cinemaId}`, cinemaData);
        return response.data;
    },

    deleteCinema: async (cinemaId) => {
        const response = await api.delete(`/cinemas.php?id=${cinemaId}`);
        return response.data;
    },

    // ===== BOOKINGS/TICKETS =====
    getBookings: async (userId = null) => {
        const url = userId ? `/bookings.php?user_id=${userId}` : '/bookings.php';
        const response = await api.get(url);
        return response.data;
    },

    createBooking: async (bookingData) => {
        const response = await api.post('/bookings.php', bookingData);
        return response.data;
    },

    updateBooking: async (ticketId, bookingData) => {
        const response = await api.put(`/bookings.php?id=${ticketId}`, bookingData);
        return response.data;
    },

    cancelBooking: async (ticketId) => {
        const response = await api.delete(`/bookings.php?id=${ticketId}`);
        return response.data;
    },

    // ===== USERS =====
    getUsers: async () => {
        const response = await api.get('/users.php');
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await api.get(`/users.php?id=${userId}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/users.php', userData);
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/users.php?id=${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/users.php?id=${userId}`);
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

        const response = await api.post(`/users.php?id=${userId}`, formDataWithAvatar, {
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

    // ===== NOTIFICATIONS =====
    getNotifications: async () => {
        const response = await api.get('/notifications.php');
        return response.data;
    },

    // ===== CONCESSIONS =====
    getConcessions: async (category = null) => {
        const url = category ? `/concessions.php?category=${category}` : '/concessions.php';
        const response = await api.get(url);
        return response.data;
    },

    // ===== PROMOTIONS =====
    getPromotions: async () => {
        const response = await api.get('/promotions.php');
        return response.data;
    },
};

export default apiService;