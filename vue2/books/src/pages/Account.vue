
<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
</script>
<template>
  <AppLayout>
    <template #title> Библиотека книг </template>

    <template #controls>
      <router-link :to="getBookPath('new')">
        <AppButton text="Добавить книгу" />
      </router-link>
    </template>
  </AppLayout>
</template>