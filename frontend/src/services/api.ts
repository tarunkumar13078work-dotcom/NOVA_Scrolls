import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

const REFRESH_TOKEN_KEY = 'nova_refresh_token';

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('nova_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('nova_token');
  }
};

export const setRefreshToken = (refreshToken: string | null) => {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

let refreshPromise: Promise<AxiosResponse<any>> | null = null;

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as RetriableRequest;

    if (
      error?.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes('/auth/')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || api.post('/auth/refresh', { refreshToken });
      const { data } = await refreshPromise;
      refreshPromise = null;

      setAuthToken(data.token);
      setRefreshToken(data.refreshToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.token}`;

      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      setAuthToken(null);
      setRefreshToken(null);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
