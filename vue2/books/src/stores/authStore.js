import { defineStore } from 'pinia';
import { AuthService } from '@/services';
import { notify } from '@/utils';


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, 
    token: localStorage.getItem('token') || null, 
    isLoggedIn: false,
    isLoading: false,
    error: null,
  }),
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await AuthService.login(credentials);
        this.token = response.token;
        this.user = response.user;
        this.isLoggedIn = true;
        localStorage.setItem('token', this.token);
        notify('Успешный вход', 'Вы вошли в аккаунт!', 'success');
      } catch (err) {
        this.error = err.message || 'Ошибка входа';
        notify('Ошибка', this.error, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await AuthService.register(userData);
        this.token = response.token;
        this.user = response.user;
        this.isLoggedIn = true;
        localStorage.setItem('token', this.token);
        
        notify('Успешная регистрация', 'Вы успешно зарегистрированы!', 'success');
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка регистрации';
        notify('Ошибка', this.error, 'error');
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      notify('Выход', 'Вы вышли из аккаунта', 'info');
    },

    checkAuthStatus() {
      this.isLoggedIn = !!this.token;
    },
  },
});