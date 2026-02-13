<template>
  <AuthLayout>
    <LoadingSpinner :show="loading" />

    <div class="card">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="label-base">아이디</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            autocomplete="username"
            class="input-base"
            placeholder="아이디를 입력하세요."
            :aria-invalid="Boolean(errorMessage)"
          />
        </div>

        <div>
          <label for="password" class="label-base">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="input-base"
            placeholder="비밀번호를 입력하세요."
            :aria-invalid="Boolean(errorMessage)"
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? '로그인 중...' : '로그인' }}
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
