import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // needed for refresh token cookie
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in ResponseWrapper<T>: { status, message, data, timestamp }
    // We unwrap and return the inner `data` field directly.
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && originalRequest.url !== '/api/v1/auth/refresh' && originalRequest.url !== '/api/v1/auth/login') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Use basic axios to prevent infinite interceptor loops
        axios
          .post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
          .then((response: any) => {
            const data = response.data?.data || response.data;
            const token = data.accessToken;
            
            localStorage.setItem('accessToken', token);
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            processQueue(null, token);
            resolve(axiosClient(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('auth-expired'));
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Đã xảy ra lỗi';
    return Promise.reject(new Error(message));
  }
);
