<template>
  <header class="h-14 bg-white border-b border-gray-200">
    <div class="h-full px-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- 모바일용 햄버거 -->
        <button
          type="button"
          class="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
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

        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Souzip Logo" class="h-8" />
          <span class="text-sm font-semibold text-gray-900"> Souzip Admin </span>
        </div>
      </div>

      <div>
        <button type="button" class="btn-secondary" @click="handleLogout">로그아웃</button>
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
