<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTES_PATHS } from '@/constants'
import { Reading, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore';

const route = useRoute()
const router = useRouter();
const authStore = useAuthStore();

const isPathActive = (path) => route.path === path

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => authStore.checkAuthStatus());
</script>

<template>
  <div class="menu">
    <div class="logo">
      <router-link to="/books">
      <img src="https://cdn-icons-png.flaticon.com/512/29/29302.png" alt="Библиотека" width="35" height="35"  style="cursor: pointer;"/>
    </router-link>
    </div>

    <el-menu :router="true" class="nav el-menu-vertical-demo">

      <el-menu-item
        :index="ROUTES_PATHS.BOOKS"
        :class="['item', isPathActive(ROUTES_PATHS.BOOK) && 'active']"
      ><el-icon><Reading /></el-icon>
    </el-menu-item>

      <el-menu-item 
        v-if="!authStore.isLoggedIn" 
        :index="ROUTES_PATHS.LOGIN" 
        :class="['item', isPathActive(ROUTES_PATHS.LOGIN) && 'active']">
        <el-icon><UserFilled /></el-icon>
      </el-menu-item>
      
      <el-menu-item 
        v-if="authStore.isLoggedIn" 
        @click.prevent="handleLogout"
        :index="ROUTES_PATHS.LOGIN"
        :class="['item', isPathActive(ROUTES_PATHS.LOGIN) && 'active']">
        <el-icon><UserFilled /></el-icon>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/index.sass'

.menu
  height: 100%
  min-height: 100vh
  padding: 20px 5px 0
  border-right: 1px solid $border

.nav
  border: none

.logo
  padding: 0 15px 15px
  border-bottom: 1px solid $border

.item
  color: $violet

  &.active
    color: $pink
</style>
