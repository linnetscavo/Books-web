

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = 'http://localhost:3000';


const api = axios.create({
  baseURL: BASE_URL,        
  timeout: 5000,            
});


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
export const URL_BOOKS = `${BASE_URL}/api/books`;
export const URL_BOOK_BY_ID = (id) => `${BASE_URL}/api/books/${id}`;
export const URL_FAVORITES = `${BASE_URL}/api/books/favorites`;

export default api;