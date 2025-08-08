<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTES_PATHS } from '@/constants'
import { Reading, Document } from '@element-plus/icons-vue'

const route = useRoute()

const isPathActive = (path) => route.path === path

onMounted(() => isPathActive(route.path))
</script>

<template>
  <div class="menu">
    <div class="logo">
      <img src="https://cdn-icons-png.flaticon.com/512/29/29302.png" alt="Библиотека" width="35" height="35" />
    </div>

    <el-menu :router="true" class="nav el-menu-vertical-demo">
      <el-menu-item
        :index="ROUTES_PATHS.BOOKS"
        :class="['item', isPathActive(ROUTES_PATHS.BOOK) && 'active']"
      >
        <el-icon><Reading /></el-icon>
    </el-menu-item>
      <el-menu-item
        :index="ROUTES_PATHS.ACCOUNT"
        :class="['item', isPathActive(ROUTES_PATHS.BOOKS) && 'active']"
      >
        <el-icon><Document /></el-icon>
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
