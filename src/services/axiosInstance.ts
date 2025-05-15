// src/utils/axiosInstance.js

import axios from 'axios';


const apiUrl = import.meta.env.VITE_API_URL;



const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const account = localStorage.getItem("account");
        if (account) {
            config.headers['Authorization'] = `${account.toLowerCase()}`;
        }
        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle response error globally
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            alert("Unauthorized");
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
