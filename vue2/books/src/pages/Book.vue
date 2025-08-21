<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; 
import AppLayout from '@/layouts/AppLayout.vue';
import { BookService } from '@/services';
import AppButton from '@/components/AppButton.vue';
import { ElLoading } from 'element-plus';
import { notify } from '@/utils';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();

const route = useRoute();
const bookId = route?.params.id;
const isCreatingMode = ref(true);


const book = ref(BookService.getEmptyBook());
const bookUpdated = ref(BookService.getEmptyBook());

const rules = {
  title: [{ required: true, message: 'Введите название', trigger: 'blur' }],
  author: [{ required: true, message: 'Введите автора', trigger: 'blur' }],
  year: [
    { required: true, message: 'Введите год', trigger: 'blur' },
    { type: 'number', message: 'Год должен быть числом', trigger: 'blur' }
  ],
  genre: [{ required: true, message: 'Введите жанр', trigger: 'blur' }],
  description: [{ required: true, message: 'Введите описание', trigger: 'blur' }]
};

const handleUploadSuccess = (response, file) => {
  console.log('Загрузка успешна:', response); // Для отладки
  if (response.coverUrl) {
    bookUpdated.value.coverUrl = response.coverUrl;
  }
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

const confirmDelete = async () => {
  ElMessageBox.confirm(
    `Вы уверены, что хотите удалить книгу "${bookUpdated.value.title}"?`,
    'Подтверждение удаления',
    {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await BookService.deleteBook(bookId);
        ElMessage.success(`Книга "${bookUpdated.value.title}" удалена`);
        // Перенаправляем на список книг
        router.push('/books');
      } catch (error) {
        ElMessage.error('Ошибка при удалении книги');
        console.error(error);
      }
    })
    .catch(() => {
      ElMessage.info('Удаление отменено');
    });
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
      <AppButton
          v-if="!isCreatingMode"
          type="danger"
          text="Удалить"
          @click="confirmDelete"
          style="margin-left: auto"
        />
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
          <div class="row">
          <div class="col">
            <div class="label">Описание</div>
            <el-input
              v-model="bookUpdated.description"
              type="textarea"
              :rows="4"
              placeholder="Введите описание книги"
            />
          </div>
        </div>

          <el-upload
            class="upload-demo"
            drag
            action="http://localhost:3000/upload/cover"  
            name="cover"                                   
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :auto-upload="true"                            
          >
            <i class="el-icon-upload"></i>
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