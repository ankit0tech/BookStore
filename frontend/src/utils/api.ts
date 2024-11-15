import axios from 'axios';

const api = axios.create({
    baseURL: 'localhost',
    headers: {
      'Content-Type': 'application/json',
    },
  
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