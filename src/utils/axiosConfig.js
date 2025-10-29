import axios from 'axios';

// ✅ Set base URL globally (works both locally and in production)
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// ✅ Request interceptor to attach token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ Export same instance (so your imports still work)
export default axios;
