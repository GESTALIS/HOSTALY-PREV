import { create } from 'zustand';
import api from "../lib/api";

type AuthState = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ token: data.token });
  },
  logout() {
    localStorage.removeItem('token');
    set({ token: null });
  },
}));


