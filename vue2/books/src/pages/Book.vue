<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; 
import AppLayout from '@/layouts/AppLayout.vue';
import { BookService } from '@/services';
import AppButton from '@/components/AppButton.vue';
import { ElLoading } from 'element-plus';
import { notify } from '@/utils';

const route = useRoute();
const bookId = route?.params.id;
const isCreatingMode = ref(true);


const book = ref(BookService.getEmptyBook());
const bookUpdated = ref(BookService.getEmptyBook());


const handleUploadSuccess = (response, file) => {
  bookUpdated.value.coverUrl = response.path || `/covers/${file.name}`;
};

const fetchBook = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Загрузка книги...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    const data = await BookService.getBookById(bookId);
    book.value = { ...data };
    bookUpdated.value = { ...data };
    isCreatingMode.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    loading.close();
  }
};

const createBook = async () => {
  try {
    const params = { ...bookUpdated.value };
    const loading = ElLoading.service({
      lock: true,
      text: 'Сохранение...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    await BookService.createBook(params);
    loading.close();
    notify('Создано', `Книга ${params.title} создана`, 'success');
  } catch (err) {
    console.error(err);
  }
};

const updateBook = async () => {
  try {
    const params = { ...bookUpdated.value };
    const loading = ElLoading.service({
      lock: true,
      text: 'Сохранение...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    await BookService.updateBook(bookId, params);
    loading.close();
    notify('Обновлено', `Книга ${params.title} обновлена`, 'success');
  } catch (err) {
    console.error(err);
  }
};

const createOrUpdateBook = () => {
  isCreatingMode.value ? createBook() : updateBook();
};

onMounted(async () => {
  if (bookId && bookId !== 'new') {
    await fetchBook();
    isCreatingMode.value = false;
  } else {
    isCreatingMode.value = true;
  }
});
</script>


<template>
  <AppLayout>
    <template #title>
      {{ isCreatingMode ? 'Новая книга' : bookUpdated.title }}
    </template>

    <template #controls>
      <AppButton text="Сохранить" @click="createOrUpdateBook" />
    </template>

    <template #inner>
      <div class="wrapper">
        <div class="row">
          <div class="col">
            <div class="label">Название</div>
            <el-input v-model="bookUpdated.title" placeholder="Название книги" />
          </div>

          <div class="col">
            <div class="label">Автор</div>
            <el-input v-model="bookUpdated.author" placeholder="Автор книги" />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="label">Жанр</div>
            <el-input v-model="bookUpdated.genre" placeholder="Жанр" />
          </div>

          <div class="col">
            <div class="label">Год издания</div>
            <el-input v-model="bookUpdated.year" placeholder="Год" type="number" />
          </div>
        </div>

        <div class="row">
          <div class="col">
          <img
            v-if="bookUpdated.coverUrl"
            :src="bookUpdated.coverUrl"
            alt="Обложка"
            style="max-width: 120px; margin-bottom: 8px;"
          />

          <el-upload
            class="upload-demo"
            drag
            action="http://localhost:3000/upload"  
            name="file"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
          >
              <i class="el-icon-upload"> </i>
            <div class="el-upload__text">Перетащите или <em>нажмите для выбора</em></div>
            <div class="el-upload__tip" slot="tip">Изображение будет загружено на сервер</div>
          </el-upload>
        </div>
        </div>

        <div class="row" v-if="bookUpdated.cover">
          <div class="col">
            <div class="label">Превью обложки:</div>
            <img :src="bookUpdated.cover" alt="Обложка" style="max-height: 200px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15)" />
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/index.sass'

.mb-2
    margin-bottom: 5px

</style>