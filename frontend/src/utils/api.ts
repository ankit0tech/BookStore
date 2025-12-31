import axios from 'axios';
import store from '../redux/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.userinfo.token || localStorage.getItem('authToken');
    
    if ( token ) {
        config.headers.Authorization = token;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            if(currentPath !== '/login' && currentPath !== '/signup') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error);
    }
);


export default api;