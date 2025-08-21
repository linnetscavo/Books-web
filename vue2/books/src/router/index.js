import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import Book from '@/pages/Book.vue';
import Login from '@/pages/Login.vue';
import Register from '@/pages/Register.vue';
import { ROUTES_PATHS } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

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
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES_PATHS.LOGIN,
    name: 'Account',
    component: Login,
  },
  {
    path: ROUTES_PATHS.REGISTER,
    name: 'Register',
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
