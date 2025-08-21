// src/constants/api.js

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = 'http://localhost:3000';

// Создаём экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: BASE_URL,        // Базовый URL для всех запросов
  timeout: 5000,            // Таймаут 5 секунд
});

// Добавляем токен авторизации в заголовки для каждого запроса
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Экспортируем удобные URL (если нужно использовать вне api)
export const URL_BOOKS = `${BASE_URL}/api/books`;
export const URL_BOOK_BY_ID = (id) => `${BASE_URL}/api/books/${id}`;
export const URL_FAVORITES = `${BASE_URL}/api/books/favorites`;

// Экспортируем настроенный экземпляр axios
export default api;