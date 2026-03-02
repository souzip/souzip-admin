<template>
  <div class="notices-container">
    <!-- 액션 바 -->
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
            <th v-if="canEdit" class="col-check">
              <input
                type="checkbox"
                class="rounded border-gray-300"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th class="col-title">제목</th>
            <th class="col-status">상태</th>
            <th class="col-author">작성자</th>
            <th class="col-date">작성일</th>
            <th class="col-date">수정일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && items.length === 0">
            <td :colspan="canEdit ? 6 : 5" class="loading-cell">로딩 중</td>
          </tr>
          <tr v-else-if="!loading && items.length === 0">
            <td :colspan="canEdit ? 6 : 5" class="empty-cell">등록된 공지사항이 없습니다.</td>
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
              <td class="col-title-cell">{{ notice.title }}</td>
              <td class="text-center">
                <span
                  class="status-badge"
                  :class="getStatusFromNotice(notice) ? 'status-public' : 'status-hidden'"
                >
                  {{ getStatusFromNotice(notice) ? '공개' : '숨김' }}
                </span>
              </td>
              <td class="text-center">{{ formatAuthor(notice) }}</td>
              <td class="text-center whitespace-nowrap">{{ formatDate(notice.createdAt) }}</td>
              <td class="text-center whitespace-nowrap">{{ formatDate(notice.updatedAt) }}</td>
            </tr>
            <tr v-if="loadingMore">
              <td :colspan="canEdit ? 6 : 5" class="loading-more-cell">
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
            <span
              class="status-badge"
              :class="getStatusFromNotice(notice) ? 'status-public' : 'status-hidden'"
            >
              {{ getStatusFromNotice(notice) ? '공개' : '숨김' }}
            </span>
          </div>
          <div class="card-body">
            <div class="card-field">
              <span class="card-label">제목</span>
              <span class="card-value notice-title">{{ notice.title }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">작성자</span>
              <span class="card-value">{{ formatAuthor(notice) }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">작성일</span>
              <span class="card-value">{{ formatDate(notice.createdAt) }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">수정일</span>
              <span class="card-value">{{ formatDate(notice.updatedAt) }}</span>
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
    <!-- ✅ 상세보기 모달 추가 -->
    <NoticeDetailModal
      :is-open="detailModal.isOpen"
      :notice="detailModal.notice"
      @close="closeDetailModal"
      @edit="handleEditFromDetail"
      @delete="handleDeleteFromDetail"
    />

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
import NoticeDetailModal from '@/components/admin/NoticeDetailModal.vue'
import NoticeFormModal from '@/components/admin/NoticeFormModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AlertModal from '@/components/AlertModal.vue'

const auth = useAuthStore()
const { getNotices, deleteNotices } = useNoticeManagement()

const isMobile = ref(window.innerWidth <= 1024)
const onResize = () => {
  isMobile.value = window.innerWidth <= 1024
}

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

const detailModal = reactive({ isOpen: false, notice: null })

function openDetailModal(notice) {
  detailModal.notice = notice
  detailModal.isOpen = true
}

function closeDetailModal() {
  detailModal.isOpen = false
}

function handleEditFromDetail(notice) {
  closeDetailModal()
  openEditModal(notice)
}

function handleDeleteFromDetail(noticeId) {
  closeDetailModal()
  selectedIds.value = [noticeId]
  openDeleteConfirm()
}

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

function handleRowClick(notice) {
  openDetailModal(notice)
}

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

function getStatusFromNotice(notice) {
  if ('status' in notice) {
    return notice.status === 'ACTIVE'
  }
  return notice.visible !== false
}

function formatAuthor(notice) {
  if (notice.authorId) {
    return '관리자'
  }
  if (notice.author) {
    if (typeof notice.author === 'object') {
      return notice.author.username ?? '-'
    }
    return notice.author
  }
  return '-'
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

.data-table th,
.data-table td {
  vertical-align: middle;
}

.data-table th {
  padding: 10px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
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

.data-table input[type='checkbox'] {
  width: 14px !important;
  height: 14px !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-check {
  width: 48px;
}

.col-title {
  width: 35%;
}

.col-title-cell {
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 0;
}

.col-status {
  width: 90px;
}

.col-author {
  width: 100px;
}

.col-date {
  width: 180px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-public {
  background: #dcfce7;
  color: #16a34a;
}

.status-hidden {
  background: #f3f4f6;
  color: #9ca3af;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: 24px;
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
  text-align: right;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

.table-container::-webkit-scrollbar {
  width: 6px;
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

  .notice-title {
    text-align: left;
    white-space: normal;
  }
}
</style>
