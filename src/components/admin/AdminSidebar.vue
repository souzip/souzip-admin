<template>
  <aside
    class="w-64 bg-white border-gray-200 lg:border-r lg:min-h-[calc(100vh-56px)] lg:relative fixed top-0 right-0 h-full border-l z-40 lg:translate-x-0"
    :class="[openClass, { 'transition-transform duration-300 ease-in-out': isAnimating }]"
  >
    <div class="flex flex-col h-full">
      <div class="lg:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200">
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

          <div v-if="isDestinationOpen" class="nav-submenu">
            <RouterLink
              to="/admin/cities"
              class="nav-item nav-subitem"
              active-class="nav-subitem-active"
              @click="onNavClick"
            >
              <div class="flex items-center gap-2">
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

        <!-- 메시지 발송 (ADMIN·SUPER_ADMIN만) -->
        <RouterLink
          v-if="canPushBroadcast"
          to="/admin/message-push"
          class="nav-item"
          active-class="nav-active"
          @click="onNavClick"
        >
          <div class="flex items-center gap-2">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span>메시지 발송</span>
          </div>
        </RouterLink>

        <!-- 고객지원 (토글) -->
        <div>
          <button
            type="button"
            class="nav-toggle-button"
            :class="{ active: isSupportActive }"
            @click="handleSupportClick"
          >
            <div class="flex items-center gap-2">
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
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>고객지원</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              :class="{ 'rotate-90': isSupportOpen }"
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

          <div v-if="isSupportOpen" class="nav-submenu">
            <!-- 공지사항 -->
            <RouterLink
              to="/admin/notices"
              class="nav-item nav-subitem"
              active-class="nav-subitem-active"
              @click="onNavClick"
            >
              <div class="flex items-center gap-2">
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
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                <span>공지사항</span>
              </div>
            </RouterLink>

            <!-- 나중에 FAQ, 문의하기 등 여기에 추가 -->
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
      <div class="lg:hidden p-4 border-t border-gray-200">
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
const isDestinationOpen = ref(false)
const isSupportOpen = ref(false)

const isSuperAdmin = computed(() => auth.admin?.role === 'SUPER_ADMIN')

const canPushBroadcast = computed(() => {
  const r = auth.admin?.role
  return r === 'SUPER_ADMIN' || r === 'ADMIN'
})

const isDestinationActive = computed(() => route.path.includes('/admin/cities'))

const isSupportActive = computed(() => {
  return route.path.includes('/admin/notices')
  // 나중에 추가: || route.path.includes('/admin/faq') || route.path.includes('/admin/inquiries')
})

const openClass = computed(() => (props.open ? 'translate-x-0' : 'translate-x-full'))

watch(
  () => props.open,
  () => {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
)

watch(
  () => route.path,
  (newPath) => {
    isDestinationOpen.value = newPath.includes('/admin/cities')
    isSupportOpen.value = newPath.includes('/admin/notices')
    // 나중에 추가: || newPath.includes('/admin/faq') || newPath.includes('/admin/inquiries')
  },
  { immediate: true }
)

function handleDestinationClick() {
  isDestinationOpen.value = !isDestinationOpen.value
  if (window.innerWidth >= 1024) {
    router.push('/admin/cities')
  }
}

function handleSupportClick() {
  isSupportOpen.value = !isSupportOpen.value
  if (window.innerWidth >= 1024) {
    router.push('/admin/notices')
  }
}

function onClose() {
  emit('close')
}

function onNavClick() {
  if (window.innerWidth < 1024) {
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
