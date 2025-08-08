import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import Book from '@/pages/Book.vue';
import { ROUTES_PATHS } from '@/constants';

const routes = [
  {
    path: '/',
    redirect: ROUTES_PATHS.BOOKS,
  },
  {
    path: ROUTES_PATHS.BOOKS,
    name: 'Books',
    component: Home,
  },
  {
    path: ROUTES_PATHS.BOOK,
    name: 'Book',
    component: Book,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
