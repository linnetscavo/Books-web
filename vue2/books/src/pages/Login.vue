<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/layouts/AppLayout.vue';
import AppButton from '@/components/AppButton.vue';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const router = useRouter();
const formRef = ref(); 

const form = ref({
  email: '',
  password: '',
});

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

const handleLogin = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      await authStore.login(form.value);
      if (authStore.isLoggedIn) {
        router.push('/books');
      }
    } else {
      ElMessage.error('Исправьте ошибки в форме');
    }
  });
};
</script>

<template>
  <AppLayout>
    <template #title>Вход</template>
    <template #inner>
      <!-- Добавили ref="formRef" и :rules -->
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        class="form-container" 
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <AppButton text="Войти" @click="handleLogin" />
          <router-link to="/register" style="margin-left: 10px;">
            <el-link type="primary">Нет аккаунта? Зарегистрироваться</el-link>
          </router-link>
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