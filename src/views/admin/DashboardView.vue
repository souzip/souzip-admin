<template>
  <div class="page-wrapper">
    <div class="page-header">
      <h1 class="text-xl font-semibold">관리자 홈</h1>
      <button type="button" class="btn-secondary" @click="handleLogout">로그아웃</button>
    </div>

    <div class="card">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        로그인/가드/토큰 갱신 흐름 확인용 임시 화면입니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { handleLogout } = useAuth()
</script>
