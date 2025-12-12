import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost/server/api' : '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(r => r, e => {
    if (e.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(e);
});

const get = (u) => api.get(u).then(r => r.data);
const post = (u, d) => api.post(u, d).then(r => r.data);
const put = (u, d) => api.put(u, d).then(r => r.data);

export const apiService = {
    // Banner
    getBanners: () => get('/banner.php'),

    // Search
    searchMovies: (q) => get(`/search.php?q=${encodeURIComponent(q)}`),

    // Movies
    getMovies: (s) => get(`/movies.php${s ? `?status=${s}` : ''}`),
    getMovieById: (id) => get(`/movies.php?movie_id=${id}`),

    // Actors
    getActors: () => get('/actors.php'),
    getActorById: (id) => get(`/actors.php?actor_id=${id}`),
    getActorMovies: (id) => get(`/actor-movies.php?actor_id=${id}`),

    // Auth
    login: (d) => post('/login.php', d),
    register: (d) => post('/register.php', d),
    logout: () => post('/logout.php'),
    updateProfile: (d) => put('/users.php', d),
    updatePassword: (d) => post('/update-password.php', d),

    // Showtimes
    getShowtimes: (f) => get(`/showtimes.php${f ? `?filters=${JSON.stringify(f)}` : ''}`),
    getShowtimeById: (id) => get(`/showtimes.php?showtime_id=${id}`),

    // Cinemas
    getCinemas: () => get('/cinemas.php'),
    getCinemaById: (id) => get(`/cinemas.php?cinema_id=${id}`),

    // Bookings & Tickets
    getBookings: (uid) => get(`/bookings.php${uid ? `?user_id=${uid}` : ''}`),
    buyTickets: (d) => post('/buy-tickets.php', d),
    getSeats: (sid) => get(`/seats.php?showtime_id=${sid}`),
    cancelBooking: (id) => post('/bookings.php', { action: 'cancel', booking_id: id }),

    // Concessions
    getConcessions: () => get('/concessions.php'),

    // Promotions
    getPromotions: () => get('/promotions.php'),
    applyPromotion: (code) => post('/promotions.php', { code }),

    // Reviews
    getReviews: (mid) => get(`/reviews.php?movie_id=${mid}`),
    submitReview: (d) => post('/reviews.php', d),

    // Notifications
    getNotifications: () => get('/notifications.php'),

    // Admin
    getAdminStats: () => get('/admin-stats.php')
};

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

                                // ===== MOVIE REVIEWS =====
                                getMovieReviews: async (movieId) => {
                                    const response = await api.get(`/reviews.php?movie_id=${movieId}`);
                                    return response.data;
                                },

                                    submitReview: async (movieId, userId, rating, comment) => {
                                        const response = await api.post('/reviews.php', {
                                            movie_id: movieId,
                                            user_id: userId,
                                            rating: rating,
                                            comment: comment
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

                                                    createActor: async (actorData) => {
                                                        const response = await api.post('/actors.php', actorData);
                                                        return response.data;
                                                    },

                                                        updateActor: async (actorId, actorData) => {
                                                            const response = await api.put(`/actors.php?id=${actorId}`, actorData);
                                                            return response.data;
                                                        },

                                                            deleteActor: async (actorId) => {
                                                                const response = await api.delete(`/actors.php?id=${actorId}`);
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
                                                                        try {
                                                                            const response = await api.get(`/showtimes.php?id=${showtimeId}`);

                                                                            console.log("getShowtimeById response:", response.data); // DEBUG

                                                                            // Ensure we return an object with showtime_id
                                                                            if (response.data && typeof response.data === 'object') {
                                                                                return response.data;
                                                                            }

                                                                            throw new Error("Invalid showtime data format");
                                                                        } catch (error) {
                                                                            console.error("Error in getShowtimeById:", error);
                                                                            throw error;
                                                                        }
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

                                                                                                                                                                                // ===== SEATS =====
                                                                                                                                                                                getSeats: async (showtimeId) => {
                                                                                                                                                                                    const response = await api.get(`/seats.php?showtime_id=${showtimeId}`);
                                                                                                                                                                                    return response.data;
                                                                                                                                                                                },

                                                                                                                                                                                    // ===== PROMOTIONS =====
                                                                                                                                                                                    getPromotions: async () => {
                                                                                                                                                                                        const response = await api.get('/promotions.php');
                                                                                                                                                                                        return response.data;
                                                                                                                                                                                    },

                                                                                                                                                                                        // ===== ADMIN =====
                                                                                                                                                                                        getAdminStats: async () => {
                                                                                                                                                                                            const response = await api.get('/admin-stats.php');
                                                                                                                                                                                            return response.data;
                                                                                                                                                                                        },
};

export default apiService;