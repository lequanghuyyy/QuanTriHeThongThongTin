import { axiosInstance as api } from './axiosInstance';
import type { RegisterRequest, AuthTokens } from '../types/user.types';
import { clearSessionId } from '../utils/sessionManager';

export const authApi = {
  register: (data: RegisterRequest) => api.post<never, AuthTokens>("/auth/register", data),
  login: async (email: string, password: string) => {
    const result = await api.post<never, AuthTokens>("/auth/login", { email, password });
    // Clear guest session after successful login (cart is already merged on backend)
    clearSessionId();
    return result;
  },
  refresh: (refreshToken: string) =>
    api.post<never, AuthTokens>("/auth/refresh", { refreshToken }),
  logout: () => api.post<never, void>("/auth/logout"),
  forgotPassword: (email: string) =>
    api.post<never, void>("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<never, void>("/auth/reset-password", { token, newPassword }),
};
