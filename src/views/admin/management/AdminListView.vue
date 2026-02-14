<template>
  <div class="admin-management-container">
    <!-- 헤더 -->
    <div class="page-header">
      <h1 class="text-xl font-semibold text-gray-900">관리자 관리</h1>
      <button
        v-if="isSuperAdmin"
        type="button"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm"
        @click="openInviteModal"
      >
        신규 관리자 등록
      </button>
    </div>

    <!-- 테이블 영역 (무한 스크롤) -->
    <div ref="scrollContainer" class="table-container" @scroll="handleScroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-12">
              <input
                type="checkbox"
                class="rounded border-gray-300"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th>아이디</th>
            <th>역할</th>
            <th>마지막 로그인</th>
          </tr>
        </thead>
        <tbody>
          <!-- 초기 로딩 -->
          <tr v-if="loading && admins.length === 0">
            <td colspan="4" class="loading-cell">로딩 중...</td>
          </tr>

          <!-- 데이터 없음 -->
          <tr v-else-if="!loading && admins.length === 0">
            <td colspan="4" class="empty-cell">등록된 관리자가 없습니다.</td>
          </tr>

          <!-- 데이터 -->
          <template v-else>
            <tr v-for="admin in admins" :key="admin.id">
              <td class="text-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300"
                  :checked="selectedIds.includes(admin.id)"
                  @change="toggleSelect(admin.id)"
                />
              </td>
              <td class="text-center">{{ admin.username }}</td>
              <td class="text-center">
                <span
                  class="role-badge"
                  :class="{
                    'role-super': admin.role === 'SUPER_ADMIN',
                    'role-admin': admin.role === 'ADMIN',
                    'role-viewer': admin.role === 'VIEWER',
                  }"
                >
                  {{ admin.role }}
                </span>
              </td>
              <td class="text-center">{{ formatDate(admin.lastLoginAt) }}</td>
            </tr>

            <!-- 추가 로딩 -->
            <tr v-if="loadingMore">
              <td colspan="4" class="loading-more-cell">
                <div class="flex items-center justify-center gap-2">
                  <div class="loading-spinner"></div>
                  <span>추가 데이터 로딩 중...</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- 스크롤 감지용 센티널 -->
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <!-- 초대 모달 -->
    <InviteAdminModal
      :is-open="isModalOpen"
      @close="closeInviteModal"
      @success="handleInviteSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InviteAdminModal from '@/components/admin/InviteAdminModal.vue'

const auth = useAuthStore()

const isSuperAdmin = computed(() => {
  return auth.admin?.role === 'SUPER_ADMIN'
})

const isModalOpen = ref(false)

function openInviteModal() {
  isModalOpen.value = true
}

function closeInviteModal() {
  isModalOpen.value = false
}

function handleInviteSuccess(admin) {
  console.log('관리자 초대 성공:', admin)
  resetAndLoad()
}

const selectedIds = ref([])

const isAllSelected = computed(() => {
  return admins.value.length > 0 && selectedIds.value.length === admins.value.length
})

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedIds.value = admins.value.map((admin) => admin.id)
  } else {
    selectedIds.value = []
  }
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 무한 스크롤 상태
const loading = ref(false)
const loadingMore = ref(false)
const admins = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const hasMore = ref(true)

// 스크롤 참조
const scrollContainer = ref(null)
const sentinel = ref(null)
let observer = null

// Intersection Observer 설정
function setupIntersectionObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !loadingMore.value && !loading.value) {
        loadMore()
      }
    },
    {
      root: scrollContainer.value,
      rootMargin: '200px',
      threshold: 0,
    }
  )

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
}

// 스크롤 이벤트 핸들러 (백업용)
function handleScroll() {
  if (!scrollContainer.value || loadingMore.value || !hasMore.value || loading.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

  if (scrollPercentage > 0.85) {
    loadMore()
  }
}

// 데이터 로드
async function loadAdmins() {
  if (loading.value || loadingMore.value) return

  const isInitialLoad = currentPage.value === 1

  if (isInitialLoad) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    // TODO: 실제 API 호출
    // const response = await api.getAdmins({ page: currentPage.value, size: pageSize.value })

    await new Promise((resolve) => setTimeout(resolve, 500))

    // 총 7명만 있다고 가정
    const mockTotal = 7
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = Math.min(startIndex + pageSize.value, mockTotal)
    const itemsToCreate = endIndex - startIndex

    const mockData = Array.from({ length: itemsToCreate }, (_, i) => {
      const globalIndex = startIndex + i + 1
      return {
        id: `admin-${globalIndex}`,
        username: `admin${globalIndex}`,
        role: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'][globalIndex % 3],
        lastLoginAt: new Date(Date.now() - globalIndex * 86400000).toISOString(),
      }
    })

    if (isInitialLoad) {
      admins.value = mockData
    } else {
      admins.value = [...admins.value, ...mockData]
    }

    totalCount.value = mockTotal
    hasMore.value = admins.value.length < mockTotal
  } catch (error) {
    console.error('관리자 목록 로드 실패:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 더 보기
async function loadMore() {
  if (!hasMore.value || loadingMore.value || loading.value) return

  currentPage.value++
  await loadAdmins()
}

// 초기화 및 로드
async function resetAndLoad() {
  currentPage.value = 1
  admins.value = []
  hasMore.value = true
  selectedIds.value = []
  await loadAdmins()
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(async () => {
  await loadAdmins()

  setTimeout(() => {
    setupIntersectionObserver()
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.admin-management-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

/* 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

/* 테이블 영역 */
.table-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 10;
}

.data-table th {
  padding: 10px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: #1f2937;
}

.loading-cell,
.empty-cell {
  padding: 60px 16px;
  text-align: center;
  color: #6b7280;
}

.loading-more-cell {
  padding: 20px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.end-cell {
  padding: 20px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

/* 로딩 스피너 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 센티널 (스크롤 감지용) */
.sentinel {
  height: 1px;
  visibility: hidden;
}

/* 역할 뱃지 */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.role-super {
  background: #f3e8ff;
  color: #7c3aed;
}

.role-admin {
  background: #dbeafe;
  color: #2563eb;
}

.role-viewer {
  background: #d1fae5;
  color: #059669;
}

/* 스크롤바 스타일 */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
