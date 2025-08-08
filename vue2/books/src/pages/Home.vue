<script setup>
import { ref, onMounted } from 'vue'
import { BookService } from '@/services'
import { ROUTES_PATHS } from '@/constants'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'

import { ElLoading } from 'element-plus'

const books = ref([])

const fetchBooks = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Загрузка книг...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    books.value = await BookService.getBooks()
  } catch (error) {
    console.log(error)
  } finally {
    loading.close()
  }
}

const getBookPath = (id) => `/books/${id}`

onMounted(fetchBooks)
</script>

<template>
  <AppLayout>
    <template #title> Библиотека книг </template>

    <template #controls>
      <router-link :to="getBookPath('new')">
        <AppButton text="Добавить книгу" />
      </router-link>
    </template>

    <template #inner>
      <div class="wrapper">
        <el-table :data="books" style="width: 100%">
          <el-table-column prop="id" label="ID" />
          <el-table-column label="Обложка">
            <template #default="scope">
              <router-link :to="getBookPath(scope.row.id)">
                <img :src="scope.row.coverUrl" class="image" />
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="Название" />
          <el-table-column prop="author" label="Автор" />
          <el-table-column prop="genre" label="Жанр" />
          <el-table-column prop="year" label="Год" />
        </el-table>
      </div>
    </template>
  </AppLayout>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/index.sass'

.image
  width: 60px
  height: 100px
  object-fit: cover

</style>
