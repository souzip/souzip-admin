<!-- src/views/admin/notice/NoticesView.vue -->
<template>
  <div class="notices-container">
    <!-- 액션 바 (VIEWER 제외) -->
    <div v-if="canEdit" class="action-bar">
      <div class="action-buttons">
        <button
          type="button"
          class="px-4 py-2 bg-primary-500 text-white rounded transition-colors text-sm"
          @click="openCreateModal"
        >
          공지사항 등록
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
            <th v-if="canEdit" class="w-12">
              <input
                type="checkbox"
                class="rounded border-gray-300"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th :colspan="canEdit ? 1 : 2">제목</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && items.length === 0">
            <td :colspan="canEdit ? 3 : 2" class="loading-cell">로딩 중</td>
          </tr>
          <tr v-else-if="!loading && items.length === 0">
            <td :colspan="canEdit ? 3 : 2" class="empty-cell">등록된 공지사항이 없습니다.</td>
          </tr>
          <template v-else>
            <tr
              v-for="notice in items"
              :key="notice.id"
              :class="['row-clickable', { 'row-selected': selectedIds.includes(notice.id) }]"
              @click="handleRowClick(notice)"
            >
              <td v-if="canEdit" class="text-center" @click.stop>
                <input
                  type="checkbox"
                  class="rounded border-gray-300"
                  :checked="selectedIds.includes(notice.id)"
                  @change="toggleSelect(notice.id)"
                />
              </td>
              <td>{{ notice.title }}</td>
              <td class="text-center whitespace-nowrap">{{ formatDate(notice.createdAt) }}</td>
            </tr>
            <tr v-if="loadingMore">
              <td :colspan="canEdit ? 3 : 2" class="loading-more-cell">
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
        등록된 공지사항이 없습니다.
      </div>
      <template v-else>
        <div
          v-for="notice in items"
          :key="notice.id"
          class="notice-card card-clickable"
          :class="{ 'card-selected': selectedIds.includes(notice.id) }"
          @click="handleRowClick(notice)"
        >
          <div v-if="canEdit" class="card-header">
            <input
              type="checkbox"
              class="rounded border-gray-300"
              :checked="selectedIds.includes(notice.id)"
              @click.stop
              @change="toggleSelect(notice.id)"
            />
          </div>
          <div class="card-body">
            <div class="card-field">
              <span class="card-label">제목</span>
              <span class="card-value notice-title">{{ notice.title }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">작성일</span>
              <span class="card-value">{{ formatDate(notice.createdAt) }}</span>
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

    <!-- 모달들 -->
    <NoticeFormModal
      :is-open="formModal.isOpen"
      :notice="formModal.notice"
      @close="closeFormModal"
      @success="handleFormSuccess"
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
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNoticeManagement } from '@/composables/useNoticeManagement'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import NoticeFormModal from '@/components/admin/NoticeFormModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AlertModal from '@/components/AlertModal.vue'

const auth = useAuthStore()
const { getNotices, deleteNotices } = useNoticeManagement()

const isMobile = ref(window.innerWidth <= 600)
const onResize = () => {
  isMobile.value = window.innerWidth <= 600
}

// VIEWER는 조회만
const canEdit = computed(() => {
  const role = auth.admin?.role
  return role === 'SUPER_ADMIN' || role === 'ADMIN'
})

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
} = useInfiniteScroll({ pageSize: 20, fetchFunction: getNotices })

// 등록/수정 모달
const formModal = reactive({ isOpen: false, notice: null })
function openCreateModal() {
  formModal.notice = null
  formModal.isOpen = true
}
function openEditModal(notice) {
  formModal.notice = notice
  formModal.isOpen = true
}
function closeFormModal() {
  formModal.isOpen = false
}
function handleFormSuccess(type) {
  closeFormModal()
  showAlert(type === 'update' ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.')
  resetAndLoad()
}

// 행 클릭: VIEWER는 아무것도 안 함, 나머지는 수정 모달
function handleRowClick(notice) {
  if (!canEdit.value) return
  openEditModal(notice)
}

// 삭제
const confirmModal = reactive({ isOpen: false, message: '' })
function openDeleteConfirm() {
  if (selectedIds.value.length === 0) return
  confirmModal.message = `선택한 ${selectedIds.value.length}건의 공지사항을 삭제하시겠습니까?`
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
  selectedIds.value = event.target.checked ? items.value.map((n) => n.id) : []
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
    const result = await deleteNotices(selectedIds.value)
    showAlert(`${result.count}건의 공지사항이 삭제되었습니다.`)
    selectedIds.value = []
    resetAndLoad()
  } catch (error) {
    const message = error?.response?.data?.message || '공지사항 삭제에 실패했습니다.'
    showAlert(message)
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  return new Date(utcString).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  initialize()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cleanup()
})
</script>

<style scoped>
.notices-container {
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
  vertical-align: middle;
}
.data-table th:nth-child(2) {
  text-align: left;
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
  vertical-align: middle;
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
.notice-card {
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
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-field {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}
.card-value {
  font-size: 13px;
  color: #1f2937;
  text-align: right;
}
.notice-title {
  text-align: left;
  flex: 1;
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
.data-table input[type='checkbox'] {
  width: 14px !important;
  height: 14px !important;
  cursor: pointer;
  display: flex;
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
@media (max-width: 600px) {
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
</style>
