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
    getMovieById: (id) => get(`/movies.php?id=${id}`),
    createMovie: (d) => post('/movies.php', d),
    updateMovie: (id, d) => put(`/movies.php?id=${id}`, d),
    deleteMovie: (id) => api.delete(`/movies.php?id=${id}`).then(r => r.data),

    // Actors
    getActors: () => get('/actors.php'),
    getActorById: (id) => get(`/actors.php?id=${id}`),
    getActorMovies: (id) => get(`/actor-movies.php?actor_id=${id}`),
    createActor: (d) => post('/actors.php', d),
    updateActor: (id, d) => put(`/actors.php?id=${id}`, d),
    deleteActor: (id) => api.delete(`/actors.php?id=${id}`).then(r => r.data),

    // Auth
    login: (d) => post('/login.php', d),
    register: (d) => post('/register.php', d),
    logout: () => post('/logout.php'),
    updateProfile: (d) => put('/users.php', d),
    updatePassword: (d) => post('/update-password.php', d),
    forgotPassword: (d) => post('/forget-password.php', d),
    resetPassword: (d) => post('/reset-password.php', d),

    // Showtimes
    getShowtimes: (f) => {
        let url = '/showtimes.php';
        if (f) {
            const p = new URLSearchParams();
            if (f.movieId) p.append('movie_id', f.movieId);
            if (f.cinemaId) p.append('cinema_id', f.cinemaId);
            if (f.date) p.append('date', f.date);
            if (p.toString()) url += '?' + p.toString();
        }
        return get(url);
    },
    getShowtimeById: (id) => get(`/showtimes.php?id=${id}`),
    createShowtime: (d) => post('/showtimes.php', d),
    updateShowtime: (id, d) => put(`/showtimes.php?id=${id}`, d),
    deleteShowtime: (id) => api.delete(`/showtimes.php?id=${id}`).then(r => r.data),

    // Cinemas
    getCinemas: () => get('/cinemas.php'),
    getCinemaById: (id) => get(`/cinemas.php?id=${id}`),

    // Bookings & Tickets
    getBookings: (uid) => get(`/bookings.php${uid ? `?user_id=${uid}` : ''}`),
    buyTickets: (d) => post('/buy-tickets.php', d),
    getSeats: (sid) => get(`/seats.php?showtime_id=${sid}`),
    cancelBooking: (d) => post('/bookings.php', { action: 'cancel', ...d }),

    // Concessions
    getConcessions: () => get('/concessions.php'),

    // Promotions
    getPromotions: () => get('/promotions.php'),
    applyPromotion: (code) => post('/promotions.php', { code }),

    // Reviews
    getReviews: (mid) => get(`/reviews.php?movie_id=${mid}`),
    submitReview: (d) => post('/reviews.php', d),
    rateMovie: (d) => post('/user-rating.php', d),
    getUserRating: (mid, uid) => get(`/user-rating.php?movie_id=${mid}&user_id=${uid}`),

    // Trailers & Cast
    getMovieTrailers: (mid) => get(`/movie-trailers.php?movie_id=${mid}`),
    getMovieCast: (mid) => get(`/movie-cast.php?movie_id=${mid}`),

    // Notifications
    getNotifications: () => get('/notifications.php'),

    // Admin
    getAdminStats: () => get('/admin-stats.php'),
    getUsers: () => get('/users.php'),
    getUserById: (id) => get(`/users.php?id=${id}`),
    createUser: (d) => post('/users.php', d),
    updateUser: (id, d) => put(`/users.php?id=${id}`, d)
};

export default apiService;