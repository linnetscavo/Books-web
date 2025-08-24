import axios from 'axios';
import { URL_BOOKS } from '@/constants';
import { useAuthStore } from '@/stores/authStore'; 

const getAuthHeaders = () => {
  const authStore = useAuthStore();
  const token = authStore.token;
  return token
    ? { headers: { 'Authorization': `Bearer ${token}` } }
    : {};
};

export const getBooks = async () => {
  try {
    const response = await axios.get(URL_BOOKS, getAuthHeaders());
    return response?.data || [];
  } catch (error) {
    console.error('Ошибка при загрузке книг:', error);
    return [];
  }
};

export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${URL_BOOKS}/${id}`, getAuthHeaders());
    return response?.data;
  } catch (error) {
    console.error('Ошибка при загрузке книги:', error);
    throw error;
  }
};

export const createBook = async (bookData) => {
  try {
    const response = await axios.post(URL_BOOKS, bookData, getAuthHeaders());
    return response?.data;
  } catch (error) {
    console.error('Ошибка при создании книги:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await axios.put(`${URL_BOOKS}/${id}`, bookData, getAuthHeaders());
    return response?.data;
  } catch (error) {
    console.error('Ошибка при обновлении книги:', error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await axios.delete(`${URL_BOOKS}/${id}`, getAuthHeaders());
    return response?.data;
  } catch (error) {
    console.error('Ошибка при удалении книги:', error);
    throw error;
  }
};

export const getEmptyBook = () => ({
  id: null,
  title: '',
  author: '',
  year: '',
  genre: '',
  description: '',
  coverUrl: '',
   
});