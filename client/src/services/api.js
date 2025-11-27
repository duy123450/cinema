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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Export named functions that use the axios instance
export const apiService = {
    // Movies
    getMovies: async () => {
        const response = await api.get('/movies');
        return response.data;
    },

    // Showtimes
    getShowtimes: async () => {
        const response = await api.get('/showtimes');
        return response.data;
    },

    // Cinemas
    getCinemas: async () => {
        const response = await api.get('/theaters');
        return response.data;
    },

    // Users
    getUsers: async () => {
        const response = await api.get('/users');
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

    registerUser: async (formData) => {
        const response = await api.post('/register.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update profile with optional avatar
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

    // Bookings
    getBookings: async (userId) => {
        const response = await api.get(`/bookings?user_id=${userId}`);
        return response.data;
    },

    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    deleteBooking: async (bookingId) => {
        const response = await api.delete(`/bookings?id=${bookingId}`);
        return response.data;
    },

    // Ping endpoint for session keep-alive
    ping: async () => {
        const response = await api.get('/ping.php');
        return response.data;
    },
};