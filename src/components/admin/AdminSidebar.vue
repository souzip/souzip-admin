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
        <!-- 여행지 관리 (토글) -->
        <div>
          <button
            type="button"
            class="nav-toggle-button"
            :class="{ active: isDestinationActive }"
            @click="handleDestinationClick"
          >
            <div class="flex items-center gap-2">
              <!-- 지구본 아이콘 -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>여행지 관리</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              :class="{ 'rotate-90': isDestinationOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- 하위 메뉴 -->
          <div v-if="isDestinationOpen" class="nav-submenu">
            <!-- 나라 관리 -->
            <RouterLink
              to="/admin/countries"
              class="nav-item nav-subitem"
              active-class="nav-subitem-active"
              @click="onNavClick"
            >
              <div class="flex items-center gap-2">
                <!-- 깃발 아이콘 -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
                <span>나라 관리</span>
              </div>
            </RouterLink>

            <!-- 도시 관리 -->
            <RouterLink
              to="/admin/cities"
              class="nav-item nav-subitem"
              active-class="nav-subitem-active"
              @click="onNavClick"
            >
              <div class="flex items-center gap-2">
                <!-- 건물 아이콘 -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>도시 관리</span>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- 관리자 관리 (SUPER_ADMIN만) -->
        <RouterLink
          v-if="isSuperAdmin"
          to="/admin/management"
          class="nav-item"
          active-class="nav-active"
          @click="onNavClick"
        >
          <div class="flex items-center gap-2">
            <!-- 사용자 관리 아이콘 -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>관리자 관리</span>
          </div>
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'logout'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isAnimating = ref(false)
const isDestinationOpen = ref(false) // 기본으로 닫힘

// SUPER_ADMIN 체크
const isSuperAdmin = computed(() => {
  return auth.admin?.role === 'SUPER_ADMIN'
})

// 여행지 관리 active 상태 체크
const isDestinationActive = computed(() => {
  return route.path.includes('/admin/countries') || route.path.includes('/admin/cities')
})

const openClass = computed(() => {
  if (props.open) {
    return 'translate-x-0'
  }
  return 'translate-x-full'
})

watch(
  () => props.open,
  () => {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
)

// 경로에 따라 토글 상태 관리
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/admin/countries') || newPath.includes('/admin/cities')) {
      // 여행지 관리 경로일 때 열기
      isDestinationOpen.value = true
    } else {
      // 다른 경로일 때 닫기
      isDestinationOpen.value = false
    }
  },
  { immediate: true }
)

function handleDestinationClick() {
  // 토글
  isDestinationOpen.value = !isDestinationOpen.value

  // 데스크탑(md 이상)에서만 나라 관리로 이동
  if (window.innerWidth >= 768) {
    router.push('/admin/countries')
  }
}

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
.nav-toggle-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(17, 24, 39, 0.9);
  transition: background 0.2s ease;
  font-weight: 500;
  font-size: 15px;
}

.nav-toggle-button svg {
  color: inherit;
  transition: color 0.2s ease;
}

.nav-toggle-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-toggle-button.active {
  background: rgba(255, 119, 56, 0.14);
  color: rgba(255, 119, 56, 1);
}

.nav-submenu {
  margin-top: 4px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(17, 24, 39, 0.9);
  transition: background 0.2s ease;
  font-size: 15px;
  font-weight: 500;
}

.nav-item svg {
  color: inherit;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-active {
  background: rgba(255, 119, 56, 0.14);
  color: rgba(255, 119, 56, 1);
}

.nav-active:hover {
  background: rgba(255, 119, 56, 0.14);
}
/* 하위 메뉴용 스타일 (배경 없이 텍스트 색상만, 작은 크기) */
.nav-subitem {
  background: transparent;
  font-size: 13px;
  font-weight: 400;
}

.nav-subitem:hover {
  background: transparent;
}

.nav-subitem-active {
  background: transparent !important;
  color: rgba(255, 119, 56, 1);
}
</style>
