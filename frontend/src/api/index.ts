import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('medisync_auth');
  if (auth) {
    const { token } = JSON.parse(auth);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle session expiration (401)
      if (error.response.status === 401) {
        localStorage.removeItem('medisync_auth');
        if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      
      // Extract error message
      const message = error.response.data?.detail || 'An unexpected error occurred';
      console.error(`[API Error] ${error.response.status}: ${message}`);
    } else if (error.request) {
      console.error('[API Error] No response received from server. Please check your connection.');
    } else {
      console.error('[API Error] Request configuration failed.');
    }
    return Promise.reject(error);
  }
);

export default api;
