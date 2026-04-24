export interface User {
  id: string; // The backend uses UUID for user ID
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
  provider: "LOCAL" | "GOOGLE";
  isEmailVerified: boolean;
}

export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
}
