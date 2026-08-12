import { createContext } from 'react';
import type { AuthUser } from './auth-types';

export type RegisterData = {
  name: string;
  restaurant: string;
  country: string;
  phone: string;
  email: string;
  password: string;
};

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  adminLogin: (email: string, password: string) => Promise<AuthUser>;
  requestRegistrationOtp: (data: RegisterData) => Promise<{ email: string }>;
  verifyRegistrationOtp: (email: string, code: string) => Promise<AuthUser>;
  resendRegistrationOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokenAndLoadUser: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
