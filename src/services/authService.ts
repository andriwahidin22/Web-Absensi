
import api from '../config/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'BOS';
  divisi?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
