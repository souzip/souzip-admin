<template>
  <div class="admin-management-container">
    <!-- 액션 바 (슈퍼관리자만) -->
    <div class="action-bar">
      <div class="action-buttons">
        <button
          type="button"
          class="px-4 py-2 bg-primary-500 text-white rounded transition-colors text-sm"
          @click="openInviteModal"
        >
          관리자 등록
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded transition-colors text-sm"
          :class="
            selectedIds.length > 0
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          "
          :disabled="deleting || selectedIds.length === 0"
          @click="openDeleteConfirm"
        >
          <span v-if="deleting">삭제 중</span>
          <span v-else-if="selectedIds.length > 0">선택 삭제 ({{ selectedIds.length }})</span>
          <span v-else>선택 삭제</span>
        </button>
      </div>
    </div>

    <!-- 데스크톱 테이블 -->
    <div v-if="!isMobile" ref="scrollContainer" class="table-container" @scroll="handleScroll">
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
          <tr v-if="loading && items.length === 0">
            <td colspan="4" class="loading-cell">로딩 중</td>
          </tr>
          <tr v-else-if="!loading && items.length === 0">
            <td colspan="4" class="empty-cell">등록된 관리자가 없습니다.</td>
          </tr>
          <template v-else>
            <tr
              v-for="admin in items"
              :key="admin.id"
              class="row-clickable"
              :class="{ 'row-selected': selectedIds.includes(admin.id) }"
              @click="toggleSelect(admin.id)"
            >
              <td class="text-center" @click.stop>
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
            <tr v-if="loadingMore">
              <td colspan="4" class="loading-more-cell">
                <div class="flex items-center justify-center gap-2">
                  <div class="loading-spinner"></div>
                  <span>추가 데이터 로딩 중</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <!-- 모바일 카드 -->
    <div v-else ref="scrollContainer" class="card-container" @scroll="handleScroll">
      <div v-if="loading && items.length === 0" class="loading-card">로딩 중</div>
      <div v-else-if="!loading && items.length === 0" class="empty-card">
        등록된 관리자가 없습니다.
      </div>
      <template v-else>
        <div
          v-for="admin in items"
          :key="admin.id"
          class="admin-card card-clickable"
          :class="{ 'card-selected': selectedIds.includes(admin.id) }"
          @click="toggleSelect(admin.id)"
        >
          <div class="card-header">
            <input
              type="checkbox"
              class="rounded border-gray-300"
              :checked="selectedIds.includes(admin.id)"
              @click.stop
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
        <div v-if="loadingMore" class="loading-more-card">
          <div class="flex items-center justify-center gap-2">
            <div class="loading-spinner"></div>
            <span>추가 데이터 로딩 중</span>
          </div>
        </div>
      </template>
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <InviteAdminModal
      :is-open="isModalOpen"
      @close="closeInviteModal"
      @success="handleInviteSuccess"
    />
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      type="danger"
      :message="confirmModal.message"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="handleDeleteConfirm"
      @cancel="closeDeleteConfirm"
    />
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

const isMobile = ref(window.innerWidth <= 1024)
const onResize = () => {
  isMobile.value = window.innerWidth <= 1024
}

const isSuperAdmin = computed(() => auth.admin?.role === 'SUPER_ADMIN')

// superAdmin 아니면 로그인으로 리다이렉트
function checkPermission() {
  if (!auth.admin) {
    router.replace('/admin/login')
    return false
  }
  if (!isSuperAdmin.value) {
    router.replace('/admin/login')
    return false
  }
  return true
}

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

const confirmModal = reactive({ isOpen: false, message: '' })
function openDeleteConfirm() {
  if (selectedIds.value.length === 0) return
  confirmModal.message = `선택한 ${selectedIds.value.length}명의 관리자를 삭제하시겠습니까?`
  confirmModal.isOpen = true
}
function closeDeleteConfirm() {
  confirmModal.isOpen = false
}

const alertModal = reactive({ isOpen: false, message: '' })
function showAlert(message) {
  alertModal.message = message
  alertModal.isOpen = true
}
function closeAlertModal() {
  alertModal.isOpen = false
}

const selectedIds = ref([])
const isAllSelected = computed(
  () => items.value.length > 0 && selectedIds.value.length === items.value.length
)
function toggleSelectAll(event) {
  selectedIds.value = event.target.checked ? items.value.map((a) => a.id) : []
}
function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) selectedIds.value.splice(index, 1)
  else selectedIds.value.push(id)
}

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
    const message = error?.response?.data?.message || '관리자 삭제에 실패했습니다.'
    showAlert(message)
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  return new Date(utcString).toLocaleString('ko-KR', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(
  () => auth.admin,
  () => {
    checkPermission()
  },
  { immediate: false }
)

onMounted(() => {
  window.addEventListener('resize', onResize)
  if (!checkPermission()) return
  initialize()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
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
.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
  flex-shrink: 0;
  margin-bottom: 0 !important;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
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
  transition: background 0.1s;
}
.data-table tbody tr:hover {
  background: #f9fafb;
}
.data-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: #1f2937;
}
.row-clickable {
  cursor: pointer;
}
.row-selected {
  background: #fff5f0 !important;
}
.row-selected:hover {
  background: #ffe8dc !important;
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
.card-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 12px 12px 120px;
}
.admin-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  transition: all 0.1s;
}
.card-clickable {
  cursor: pointer;
}
.card-selected {
  background: #fff5f0 !important;
  border-color: #ffb899 !important;
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
.sentinel {
  height: 1px;
  visibility: hidden;
}
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
@media (max-width: 1024px) {
  .action-bar {
    padding: 8px 12px;
  }
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
  .action-buttons button {
    width: 100%;
  }
}
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
