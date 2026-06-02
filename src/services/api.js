import axios from 'axios';

const API_URL = 'http://localhost/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/jwt/create/', data),
    register: (data) => api.post('/auth/users/', data),
    getMe: () => api.get('/users/me/'),
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