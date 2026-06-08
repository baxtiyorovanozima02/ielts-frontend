import axios from 'axios';

const API_URL = 'http://localhost/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                    refresh: refreshToken,
                });
                const newAccess = res.data.access;
                localStorage.setItem('access_token', newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/jwt/create/', data),
    register: (data) => api.post('/auth/users/', data),
    getMe: () => api.get('/users/me/'),
    addXP: (amount) => api.post('/users/xp/', { amount }),
    completeDailyGoal: () => api.post('/users/daily-goal/'),
};

export const testsAPI = {
    getSections: () => api.get('/tests/sections/'),
    getTests: (section) => api.get(`/tests/tests/?section=${section}`),
    getTest: (id) => api.get(`/tests/tests/${id}/`),
    submitWriting: (testId, data) => api.post(`/tests/tests/${testId}/evaluate/`, data),
    submitSpeaking: (testId, data) => api.post(`/tests/tests/${testId}/speaking/`, data),
    getWritingResults: () => api.get('/tests/results/writing/'),
    getSpeakingResults: () => api.get('/tests/results/speaking/'),
};

export const aiAPI = {
    getDailyPlan: () => api.get('/tests/daily-plan/'),
    getWritingResults: () => api.get('/tests/results/writing/'),
    getSpeakingResults: () => api.get('/tests/results/speaking/'),
};

export const statisticsAPI = {
    getHistory: () => api.get('/tests/statistics/history/'),
    getOverall: () => api.get('/tests/statistics/overall/'),
    getWeakAreas: () => api.get('/tests/statistics/weak-areas/'),
};

export const vocabularyAPI = {
    getWords: () => api.get('/vocabulary/words/'),
    addWord: (data) => api.post('/vocabulary/words/', data),
    deleteWord: (id) => api.delete(`/vocabulary/words/${id}/`),
    getDueWords: () => api.get('/vocabulary/words/due/'),
    reviewWord: (data) => api.post('/vocabulary/words/review/', data),
};

export default api;