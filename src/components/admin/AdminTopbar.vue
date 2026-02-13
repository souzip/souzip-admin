<!-- AdminTopbar.vue -->
<template>
  <header class="h-16 bg-white border-b border-gray-200">
    <div class="h-full px-6 flex items-center justify-between">
      <!-- 로고 -->
      <div class="flex items-center">
        <img src="/logo.png" alt="Souzip Logo" class="h-12" />
      </div>

      <div class="flex items-center gap-2">
        <!-- 데스크톱용 로그아웃 버튼 -->
        <button type="button" class="hidden md:block btn-secondary" @click="handleLogout">
          로그아웃
        </button>

        <!-- 모바일/태블릿용 햄버거 버튼 -->
        <button
          type="button"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="onToggleSidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['toggleSidebar'])
const { handleLogout } = useAuth()

function onToggleSidebar() {
  emit('toggleSidebar')
}
</script>
