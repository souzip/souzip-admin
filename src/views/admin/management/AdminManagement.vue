<template>
  <div class="admin-management-container">
    <!-- 헤더 -->
    <div class="page-header">
      <h1 class="text-xl font-semibold text-gray-900">관리자 관리</h1>
      <div class="header-buttons">
        <!-- 등록 버튼 -->
        <button
          v-if="isSuperAdmin"
          type="button"
          class="px-4 py-2 bg-primary-500 text-white rounded transition-colors text-sm"
          @click="openInviteModal"
        >
          신규 관리자 등록
        </button>

        <!-- 삭제 버튼 -->
        <button
          v-if="isSuperAdmin"
          type="button"
          class="px-4 py-2 rounded transition-colors text-sm"
          :class="
            selectedIds.length > 0
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          "
          @click="openDeleteConfirm"
          :disabled="deleting || selectedIds.length === 0"
        >
          <span v-if="deleting">삭제 중...</span>
          <span v-else-if="selectedIds.length > 0">선택 삭제 ({{ selectedIds.length }})</span>
          <span v-else>선택 삭제</span>
        </button>
      </div>
    </div>

    <!-- 데스크톱 테이블 영역 -->
    <div ref="scrollContainer" class="table-container desktop-view" @scroll="handleScroll">
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
          <tr v-if="loading && items.length === 0">
            <td colspan="4" class="loading-cell">로딩 중...</td>
          </tr>

          <!-- 데이터 없음 -->
          <tr v-else-if="!loading && items.length === 0">
            <td colspan="4" class="empty-cell">등록된 관리자가 없습니다.</td>
          </tr>

          <!-- 데이터 -->
          <template v-else>
            <tr v-for="admin in items" :key="admin.id">
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

    <!-- 모바일 카드 영역 -->
    <div ref="scrollContainer" class="card-container mobile-view" @scroll="handleScroll">
      <!-- 초기 로딩 -->
      <div v-if="loading && items.length === 0" class="loading-card">로딩 중...</div>

      <!-- 데이터 없음 -->
      <div v-else-if="!loading && items.length === 0" class="empty-card">
        등록된 관리자가 없습니다.
      </div>

      <!-- 데이터 -->
      <template v-else>
        <div v-for="admin in items" :key="admin.id" class="admin-card">
          <div class="card-header">
            <input
              type="checkbox"
              class="rounded border-gray-300"
              :checked="selectedIds.includes(admin.id)"
              @change="toggleSelect(admin.id)"
            />
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
          </div>
          <div class="card-body">
            <div class="card-field">
              <span class="card-label">아이디</span>
              <span class="card-value">{{ admin.username }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">마지막 로그인</span>
              <span class="card-value">{{ formatDate(admin.lastLoginAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 추가 로딩 -->
        <div v-if="loadingMore" class="loading-more-card">
          <div class="flex items-center justify-center gap-2">
            <div class="loading-spinner"></div>
            <span>추가 데이터 로딩 중...</span>
          </div>
        </div>
      </template>

      <!-- 스크롤 감지용 센티널 -->
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <!-- 초대 모달 -->
    <InviteAdminModal
      :is-open="isModalOpen"
      @close="closeInviteModal"
      @success="handleInviteSuccess"
    />

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      type="danger"
      :message="confirmModal.message"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="handleDeleteConfirm"
      @cancel="closeDeleteConfirm"
    />

    <!-- 알림 모달 -->
    <AlertModal
      :is-open="alertModal.isOpen"
      :message="alertModal.message"
      @close="closeAlertModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminManagement } from '@/composables/useAdminManagement'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import InviteAdminModal from '@/components/admin/InviteAdminModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()
const auth = useAuthStore()
const { getAdmins, deleteAdmins } = useAdminManagement()

const isSuperAdmin = computed(() => {
  return auth.admin?.role === 'SUPER_ADMIN'
})

// 권한 체크 - 슈퍼관리자가 아니면 로그인 페이지로 리다이렉트
function checkPermission() {
  if (!auth.admin) {
    router.replace('/admin/login')
    return false
  }

  if (!isSuperAdmin.value) {
    showAlert('이 페이지는 슈퍼관리자만 접근할 수 있습니다.')
    setTimeout(() => {
      router.replace('/admin/login')
    }, 1500)
    return false
  }

  return true
}

// 무한 스크롤
const {
  loading,
  loadingMore,
  items,
  scrollContainer,
  sentinel,
  handleScroll,
  resetAndLoad,
  initialize,
  cleanup,
} = useInfiniteScroll({
  pageSize: 20,
  fetchFunction: getAdmins,
})

// 초대 모달
const isModalOpen = ref(false)

function openInviteModal() {
  isModalOpen.value = true
}

function closeInviteModal() {
  isModalOpen.value = false
}

function handleInviteSuccess() {
  showAlert('관리자 초대가 완료되었습니다.')
  resetAndLoad()
}

// 삭제 확인 모달
const confirmModal = reactive({
  isOpen: false,
  message: '',
})

function openDeleteConfirm() {
  if (selectedIds.value.length === 0) return

  confirmModal.message = `선택한 ${selectedIds.value.length}명의 관리자를 삭제하시겠습니까?`
  confirmModal.isOpen = true
}

function closeDeleteConfirm() {
  confirmModal.isOpen = false
}

// 알림 모달
const alertModal = reactive({
  isOpen: false,
  message: '',
})

function showAlert(message) {
  alertModal.message = message
  alertModal.isOpen = true
}

function closeAlertModal() {
  alertModal.isOpen = false
}

// 선택
const selectedIds = ref([])

const isAllSelected = computed(() => {
  return items.value.length > 0 && selectedIds.value.length === items.value.length
})

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedIds.value = items.value.map((admin) => admin.id)
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

// 삭제
const deleting = ref(false)

async function handleDeleteConfirm() {
  closeDeleteConfirm()

  deleting.value = true

  try {
    const result = await deleteAdmins(selectedIds.value)

    showAlert(`${result.count}명의 관리자가 삭제되었습니다.`)

    selectedIds.value = []
    resetAndLoad()
  } catch (error) {
    console.error('삭제 실패:', error)
    const message = error?.response?.data?.message || '관리자 삭제에 실패했습니다.'
    showAlert(message)
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 권한 변경 감지
watch(
  () => auth.admin,
  () => {
    checkPermission()
  },
  { immediate: false }
)

onMounted(() => {
  if (!checkPermission()) {
    return
  }

  initialize()
})

onUnmounted(() => {
  cleanup()
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

.header-buttons {
  display: flex;
  gap: 8px;
}

/* 데스크톱 테이블 영역 */
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

/* 모바일 카드 영역 */
.card-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 16px;
  display: none;
}

.admin-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-field {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.card-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 400;
  text-align: right;
}

.loading-card,
.empty-card {
  padding: 60px 16px;
  text-align: center;
  color: #6b7280;
}

.loading-more-card {
  padding: 20px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
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
.table-container::-webkit-scrollbar,
.card-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track,
.card-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb,
.card-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover,
.card-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 반응형 */
.mobile-view {
  display: none;
}

.desktop-view {
  display: block;
}

/* 600px 이하: 카드 뷰로 전환 */
@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .header-buttons {
    flex-direction: column;
    width: 100%;
  }

  .header-buttons button {
    width: 100%;
  }

  .mobile-view {
    display: block;
  }

  .desktop-view {
    display: none;
  }
}

/* 350px 이하: 카드 내부도 세로 배치 */
@media (max-width: 350px) {
  .card-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .card-value {
    text-align: left;
  }
}
</style>
