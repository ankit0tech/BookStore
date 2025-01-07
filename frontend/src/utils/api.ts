import axios from 'axios';
import store from '../redux/store';

const api = axios.create({
    baseURL: 'localhost',
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
        if (error.response && error.response.status == 401) {
            window.location.href = '/login'
        }
        return Promise.reject(error);
    }
);


export default api;