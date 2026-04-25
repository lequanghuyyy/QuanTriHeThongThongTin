import { axiosInstance as api } from './axiosInstance';
import type { User, Address } from '../types/user.types';

export const userApi = {
  // Profile — Backend: GET/PUT /api/v1/users/me
  getProfile: () => api.get<never, User>("/users/me"),
  updateProfile: (data: Partial<User>) => api.put<never, User>("/users/me", data),

  // Password — Backend: POST /api/v1/users/me/change-password
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post<never, void>("/users/me/change-password", data),

  // Addresses — Backend: /api/v1/users/me/addresses
  getAddresses: () => api.get<never, Address[]>("/users/me/addresses"),
  addAddress: (data: Omit<Address, "id">) => api.post<never, Address>("/users/me/addresses", data),
  updateAddress: (id: number, data: Partial<Address>) =>
    api.put<never, Address>(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete<never, void>(`/users/me/addresses/${id}`),
  setDefaultAddress: (id: number) =>
    api.patch<never, void>(`/users/me/addresses/${id}/set-default`),
};
