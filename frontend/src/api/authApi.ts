import { axiosInstance as api } from './axiosInstance';
import { RegisterRequest, AuthTokens } from '../types/user.types';

export const authApi = {
  register: (data: RegisterRequest) => api.post<never, AuthTokens>("/auth/register", data),
  login: (email: string, password: string) =>
    api.post<never, AuthTokens>("/auth/login", { email, password }),
  refresh: (refreshToken: string) =>
    api.post<never, AuthTokens>("/auth/refresh", { refreshToken }),
  logout: () => api.post<never, void>("/auth/logout"),
  forgotPassword: (email: string) =>
    api.post<never, void>("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<never, void>("/auth/reset-password", { token, newPassword }),
};
