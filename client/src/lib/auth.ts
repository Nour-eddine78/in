import { apiRequest } from './queryClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    email: string;
    team?: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },
};
