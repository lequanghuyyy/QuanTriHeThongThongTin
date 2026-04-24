import { axiosInstance as api } from './axiosInstance';
import { User, Address } from '../types/user.types';

export const userApi = {
  getProfile: () => api.get<never, User>("/user/profile"),
  updateProfile: (data: Partial<User>) => api.put<never, User>("/user/profile", data),
  getAddresses: () => api.get<never, Address[]>("/user/addresses"),
  addAddress: (data: Omit<Address, "id">) => api.post<never, Address>("/user/addresses", data),
  updateAddress: (id: number, data: Partial<Address>) => api.put<never, Address>(`/user/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete<never, void>(`/user/addresses/${id}`),
  setDefaultAddress: (id: number) => api.put<never, Address>(`/user/addresses/${id}/default`),
  changePassword: (data: any) => api.put<never, void>("/user/password", data),
};
