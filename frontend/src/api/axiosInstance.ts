import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Backend wrap response in ApiResponse<T>, we return response.data.data
    // which is the T data object.
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Attempt to refresh token if 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });
          // Note: Here we manually unwrap because this uses raw axios without our interceptor
          const data = res.data.data;
          
          useAuthStore.getState().setAuth(data);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          // Also we need to return the unwrapped data, but wait, originalRequest will go through 
          // the response interceptor again. So we just resolve axios(originalRequest)
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().clearAuth();
          window.location.href = '/dang-nhap';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = '/dang-nhap';
      }
    }
    
    return Promise.reject(error);
  }
);
