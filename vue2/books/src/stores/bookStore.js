import { defineStore } from 'pinia';
import { getBooks } from '@/services/bookService';
import api from '@/constants/api';

export const useBooksStore = defineStore('books', {
  state: () => ({
    books: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchBooks() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/books');
        this.books = response.data;
      } catch (e) {
        this.error = 'Ошибка при загрузке книг';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    async addBook(bookData) {
      try {
        const response = await api.post('/books', bookData);
        this.books.push(response.data);
      } catch (e) {
        console.error('Ошибка при добавлении книги:', e);
      }
    },
    async updateBook(bookId, bookData) {
      try {
        const response = await api.put(`/books/${bookId}`, bookData);
        const index = this.books.findIndex(b => b.id === bookId);
        if (index !== -1) {
          this.books[index] = response.data;
        }
      } catch (e) {
        console.error('Ошибка при обновлении книги:', e);
      }
    },
    async deleteBook(bookId) {
      try {
        await api.delete(`/books/${bookId}`);
        this.books = this.books.filter(b => b.id !== bookId);
      } catch (e) {
        console.error('Ошибка при удалении книги:', e);
      }
    },
    async toggleFavorite(bookId) {
      try {
        const response = await api.post(`/books/${bookId}/favorite`);
        const updatedBook = response.data;
  
        const index = this.books.findIndex(b => b.id === bookId);
        if (index !== -1) {
          this.books[index].isFavorite = updatedBook.isFavorite;
        }
      } catch (e) {
        console.error('Ошибка при изменении статуса избранного:', e);
      }
    },
  },
});
