// frontend/src/services/api.js

const API_BASE_URL = '/api'; // This will work with your PHP backend

export const api = {
    // Movies
    getMovies: async () => {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        return response.json();
    },

    // Showtimes
    getShowtimes: async () => {
        const response = await fetch(`${API_BASE_URL}/showtimes`);
        if (!response.ok) throw new Error('Failed to fetch showtimes');
        return response.json();
    },

    // Cinemas
    getCinemas: async () => {
        const response = await fetch(`${API_BASE_URL}/cinemas`);
        if (!response.ok) throw new Error('Failed to fetch cinemas');
        return response.json();
    },

    // Users
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
    },

    updateUser: async (userId, userData) => {
        const response = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    // Bookings
    getBookings: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/bookings?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
    },

    createBooking: async (bookingData) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) throw new Error('Failed to create booking');
        return response.json();
    },

    deleteBooking: async (bookingId) => {
        const response = await fetch(`${API_BASE_URL}/bookings?id=${bookingId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete booking');
        return response.json();
    },
};