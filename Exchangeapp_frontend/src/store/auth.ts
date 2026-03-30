import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '../axios';

const decodeUsername = (token: string | null): string | null => {
  if (!token) {
    return null;
  }

  const parts = token.replace('Bearer ', '').split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.username === 'string' ? payload.username : null;
  } catch {
    return null;
  }
};

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const username = computed(() => decodeUsername(token.value));

  const isAuthenticated = computed(() => !!token.value);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      token.value = response.data.token;
      localStorage.setItem('token', token.value || '');
    } catch (error) {
      throw new Error(`Login failed! ${error}`);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await axios.post('/auth/register', { username, password });
      token.value = response.data.token;
      localStorage.setItem('token', token.value || '');
    } catch (error) {
      throw new Error(`Register failed! ${error}`);
    }
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem('token');
  };

  return {
    token,
    username,
    isAuthenticated,
    login,
    register,
    logout
  };
});
