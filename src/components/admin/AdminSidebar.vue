<template>
  <aside
    class="w-64 bg-white border-gray-200 md:border-r md:min-h-[calc(100vh-56px)] md:relative fixed top-0 right-0 h-full border-l z-40 md:translate-x-0"
    :class="[openClass, { 'transition-transform duration-300 ease-in-out': isAnimating }]"
  >
    <div class="flex flex-col h-full">
      <div class="md:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <span class="font-semibold text-gray-900">메뉴</span>
        <button
          type="button"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="onClose"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 네비게이션 -->
      <nav class="p-4 space-y-1 flex-1 overflow-y-auto">
        <RouterLink to="/admin" class="nav-item" active-class="nav-active" @click="onNavClick">
          대시보드
        </RouterLink>
      </nav>

      <!-- 모바일용 로그아웃 버튼 -->
      <div class="md:hidden p-4 border-t border-gray-200">
        <button type="button" class="w-full btn-secondary" @click="onLogout">로그아웃</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'logout'])

const isAnimating = ref(false)

const openClass = computed(() => {
  if (props.open) {
    return 'translate-x-0'
  }
  return 'translate-x-full'
})

// open 상태가 변경될 때만 애니메이션 활성화
watch(
  () => props.open,
  () => {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
)

function onClose() {
  emit('close')
}

function onNavClick() {
  if (window.innerWidth < 768) {
    emit('close')
  }
}

function onLogout() {
  emit('logout')
}
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(17, 24, 39, 0.9);
  transition: background 0.2s ease;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-active {
  background: rgba(255, 119, 56, 0.14);
  color: rgba(255, 119, 56, 1);
}
</style>
