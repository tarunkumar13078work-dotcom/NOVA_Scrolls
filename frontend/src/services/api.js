import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('nova_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('nova_token');
  }
};

export default api;
