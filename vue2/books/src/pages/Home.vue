<script setup>
import { ref, onMounted } from 'vue'
import { BookService } from '@/services'
import { ROUTES_PATHS } from '@/constants'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import { useRouter } from 'vue-router';
const router = useRouter();

import { ElLoading } from 'element-plus'

const books = ref([])

const handleRowClick = (row) => {
  router.push(`/books/${row.id}`);
};

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
        <el-table 
          :data="books" 
          style="width: 99%" 
          :fit="true"
          @row-click="handleRowClick"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="Обложка" >
            <template #default="scope">
              <img v-if="scope.row.coverUrl" :src="scope.row.coverUrl" class="image" />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="Название" :min-width="150"/>
          <el-table-column prop="author" label="Автор" :min-width="150"/>
          <el-table-column prop="genre" label="Жанр":min-width="150" />
          <el-table-column prop="year" label="Год" width="100"/>
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

  .wrapper 
  overflow-x: auto 




</style>
