import axios from 'axios';
import Swal from 'sweetalert2';

const { hostname } = window.location;
const ip = `http://${hostname}:1337/`; // or localhost:1337

const api = axios.create({
  baseURL: ip,
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt refresh
        await api.post('/api/refresh');

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        try {
          await api.post('/api/logout');
        } catch (logoutError) {
          console.warn("Logout failed:", logoutError);
        }

        Swal.fire({
          icon: 'error',
          title: 'Session expired',
          text: 'Please login again.',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          } else {
            window.location.reload(); // fallback to force reload if already there
          }
        });

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;