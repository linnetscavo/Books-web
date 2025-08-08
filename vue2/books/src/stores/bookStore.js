import { defineStore } from 'pinia';
import { getBooks } from '@/services/bookService';

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
        const data = await getBooks();
        this.books = data;
      } catch (e) {
        this.error = 'Ошибка при загрузке книг';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
