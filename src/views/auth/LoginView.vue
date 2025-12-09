<template>
  <AuthLayout>
    <LoadingSpinner :show="loading" />
    
    <div class="card">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            아이디
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="input-base w-full"
            placeholder="아이디를 입력하세요."
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            비밀번호
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="input-base w-full"
            placeholder="비밀번호를 입력하세요."
          />
        </div>
        
        <div v-show="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          로그인
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useAuth } from '@/composables/useAuth'

const { form, loading, errorMessage, handleLogin } = useAuth()
</script>
