<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/layouts/AppLayout.vue';
import AppButton from '@/components/AppButton.vue';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const router = useRouter();
const formRef = ref(); // Добавили ref

const form = ref({
  email: '',
  password: '',
});

// Правила валидации
const rules = {
  email: [
    { required: true, message: 'Введите email', trigger: 'blur' },
    { type: 'email', message: 'Введите корректный email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Введите пароль', trigger: 'blur' },
    { min: 6, message: 'Пароль должен быть не менее 6 символов', trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  // Валидация перед отправкой
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const success = await authStore.register(form.value);
      if (success) {
        router.push('/login');
      }
    } else {
      ElMessage.error('Исправьте ошибки в форме');
    }
  });
};
</script>

<template>
  <AppLayout>
    <template #title>Регистрация</template>
    <template #inner>
      <!-- Добавили ref="formRef" и :rules -->
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        class="form-container" 
        @submit.prevent="handleRegister"
      >
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <AppButton text="Зарегистрироваться" @click="handleRegister" />
        </el-form-item>
      </el-form>
    </template>
  </AppLayout>
</template>

<style lang="sass" scoped>
.form-container
  max-width: 400px
  margin: 0 auto
</style>