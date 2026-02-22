<template>
  <div class="cities-container">
    <div class="filter-bar">
      <CustomSelect
        v-model="selectedCountryId"
        :options="countries"
        value-key="id"
        label-key="nameKr"
        :disabled="countriesLoading || loading"
        :placeholder="countriesLoading ? '불러오는 중' : '선택해주세요'"
        @change="onCountryChange"
      />
      <div class="search-wrap">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="도시명 검색"
          @input="onSearchInput"
        />
        <button v-if="searchKeyword" class="search-clear" @click="clearSearch">✕</button>
      </div>
      <span v-if="items.length > 0" class="filter-count">총 {{ totalItems }}개</span>

      <div v-if="canEdit" class="filter-actions">
        <button
          type="button"
          class="px-4 py-2 bg-primary-500 text-white rounded transition-colors text-sm font-medium hover:bg-primary-600"
          @click="openAddModal"
        >
          도시 등록
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded transition-colors text-sm font-medium"
          :class="
            selectedIds.length > 0
              ? 'bg-red-500 text-white hover:bg-red-600'
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

    <div v-if="!isMobile" ref="scrollContainer" class="table-container" @scroll="handleScroll">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="canEdit" class="w-12">
              <input
                type="checkbox"
                class="rounded border-gray-300"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
              />
            </th>
            <th class="text-left">한글명</th>
            <th class="text-left">영문명</th>
            <th class="text-center w-28">우선순위</th>
            <th class="text-center w-52">수정일</th>
            <th v-if="canEdit" class="text-center w-20">편집</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && items.length === 0">
            <td :colspan="canEdit ? 6 : 5" class="loading-cell">
              <div class="flex items-center justify-center gap-2 text-gray-500">
                <span class="table-spinner"></span>불러오는 중
              </div>
            </td>
          </tr>
          <tr v-else-if="!loading && items.length === 0 && searchKeyword">
            <td :colspan="canEdit ? 6 : 5" class="empty-cell">
              '{{ searchKeyword }}'에 대한 검색 결과가 없습니다.
            </td>
          </tr>
          <tr v-else-if="!loading && items.length === 0">
            <td :colspan="canEdit ? 6 : 5" class="empty-cell">등록된 도시가 없습니다.</td>
          </tr>
          <template v-else>
            <tr
              v-for="city in items"
              :key="city.id"
              :class="{
                'row-clickable': canEdit,
                'row-selected': selectedIds.includes(city.id),
              }"
              @click="canEdit && toggleSelect(city.id)"
            >
              <td v-if="canEdit" class="text-center" @click.stop>
                <input
                  type="checkbox"
                  class="rounded border-gray-300"
                  :checked="selectedIds.includes(city.id)"
                  @change="toggleSelect(city.id)"
                />
              </td>
              <td>{{ city.nameKr }}</td>
              <td class="text-gray-600">{{ city.nameEn }}</td>
              <td class="text-center" @click.stop>
                <div class="priority-wrap">
                  <input
                    v-if="canEdit && editingPriorityId === city.id"
                    v-model="editingPriorityValue"
                    v-focus
                    type="number"
                    min="1"
                    class="priority-input"
                    @keyup.enter="savePriority(city.id)"
                    @keyup.esc="cancelPriority"
                    @blur="savePriority(city.id)"
                  />
                  <button
                    v-else
                    type="button"
                    class="priority-badge"
                    :class="city.priority ? 'priority-set' : 'priority-unset'"
                    :style="!canEdit ? 'cursor: default; pointer-events: none;' : ''"
                    @click.stop="canEdit && startEditPriority(city)"
                  >
                    {{ city.priority ?? '미설정' }}
                  </button>
                </div>
              </td>
              <td class="text-center text-gray-500 text-xs">{{ formatDate(city.updatedAt) }}</td>
              <td v-if="canEdit" class="text-center" @click.stop>
                <button
                  type="button"
                  class="edit-icon"
                  @click="openEditModal(city)"
                  title="도시 이름 수정"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="loadingMore">
              <td :colspan="canEdit ? 6 : 5" class="loading-more-cell">
                <div class="flex items-center justify-center gap-2">
                  <div class="loading-spinner"></div>
                  <span>불러오는 중...</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <div v-else ref="scrollContainer" class="card-container" @scroll="handleScroll">
      <div v-if="loading && items.length === 0" class="loading-card">
        <span class="table-spinner"></span>불러오는 중
      </div>
      <div v-else-if="!loading && items.length === 0 && searchKeyword" class="empty-card">
        '{{ searchKeyword }}'에 대한 검색 결과가 없습니다.
      </div>
      <div v-else-if="!loading && items.length === 0" class="empty-card">
        등록된 도시가 없습니다.
      </div>
      <template v-else>
        <div
          v-for="city in items"
          :key="city.id"
          class="city-card"
          :class="{
            'card-selected': selectedIds.includes(city.id),
            'card-clickable': canEdit,
          }"
          @click="canEdit && toggleSelect(city.id)"
        >
          <div class="card-header">
            <input
              v-if="canEdit"
              type="checkbox"
              class="rounded border-gray-300"
              :checked="selectedIds.includes(city.id)"
              @click.stop
              @change="toggleSelect(city.id)"
            />
            <button
              v-if="canEdit"
              type="button"
              class="priority-badge"
              :class="city.priority ? 'priority-set' : 'priority-unset'"
              @click.stop="startEditPriority(city)"
            >
              우선순위: {{ city.priority ?? '미설정' }}
            </button>
            <span
              v-else
              class="priority-badge"
              :class="city.priority ? 'priority-set' : 'priority-unset'"
            >
              우선순위: {{ city.priority ?? '미설정' }}
            </span>
          </div>
          <div class="card-body">
            <div class="card-field">
              <span class="card-label">한글명</span>
              <div class="card-value-with-edit">
                <span class="card-value">{{ city.nameKr }}</span>
                <button
                  v-if="canEdit"
                  type="button"
                  class="edit-icon-mobile"
                  @click.stop="openEditModal(city)"
                >
                  수정
                </button>
              </div>
            </div>
            <div class="card-field">
              <span class="card-label">영문명</span>
              <span class="card-value">{{ city.nameEn }}</span>
            </div>
            <div class="card-field">
              <span class="card-label">수정일</span>
              <span class="card-value text-gray-500">{{ formatDate(city.updatedAt) }}</span>
            </div>
            <div v-if="canEdit && editingPriorityId === city.id" class="card-field" @click.stop>
              <span class="card-label">우선순위 입력</span>
              <input
                v-model="editingPriorityValue"
                v-focus
                type="number"
                min="1"
                class="priority-input"
                @keyup.enter="savePriority(city.id)"
                @keyup.esc="cancelPriority"
                @blur="savePriority(city.id)"
              />
            </div>
          </div>
        </div>
        <div v-if="loadingMore" class="loading-more-card">
          <div class="flex items-center justify-center gap-2">
            <div class="loading-spinner"></div>
            <span>불러오는 중</span>
          </div>
        </div>
      </template>
      <div ref="sentinel" class="sentinel"></div>
    </div>

    <AddCityModal
      :is-open="isAddModalOpen"
      :countries="countries"
      :default-country-id="selectedCountryId"
      @close="closeAddModal"
      @success="handleAddSuccess"
    />
    <EditCityModal
      :is-open="isEditModalOpen"
      :city="editingCity"
      @close="closeEditModal"
      @success="handleEditSuccess"
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
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDestination } from '@/composables/useDestination'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import CustomSelect from '@/components/CustomSelect.vue'
import AddCityModal from '@/components/admin/AddCityModal.vue'
import EditCityModal from '@/components/admin/EditCityModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AlertModal from '@/components/AlertModal.vue'

const vFocus = {
  mounted(el) {
    el.focus()
  },
}

const auth = useAuthStore()
const canEdit = computed(() => ['SUPER_ADMIN', 'ADMIN'].includes(auth.admin?.role))

const {
  errorMessage,
  countries,
  getCountries,
  fetchCitiesPage,
  deleteCities,
  updateCity,
  updateCityPriority,
} = useDestination()

const isMobile = ref(window.innerWidth <= 1024)
const onResize = () => {
  isMobile.value = window.innerWidth <= 1024
}

const countriesLoading = ref(false)
const selectedCountryId = ref(null)
const searchKeyword = ref('')
const totalItems = ref(0)

function makeFetchFunction() {
  return async (page, pageSize) => {
    const res = await fetchCitiesPage(selectedCountryId.value, searchKeyword.value, page, pageSize)
    totalItems.value = res.pagination?.totalItems ?? 0
    return res
  }
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
  fetchFunction: makeFetchFunction(),
})

onMounted(async () => {
  window.addEventListener('resize', onResize)
  countriesLoading.value = true
  try {
    await getCountries()
    selectedCountryId.value = 83
  } finally {
    countriesLoading.value = false
  }
  initialize()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cleanup()
})

async function onCountryChange() {
  selectedIds.value = []
  cancelPriority()
  searchKeyword.value = ''
  await resetAndLoad()
}

let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    selectedIds.value = []
    cancelPriority()
    resetAndLoad()
  }, 200)
}

function clearSearch() {
  searchKeyword.value = ''
  selectedIds.value = []
  cancelPriority()
  resetAndLoad()
}

const selectedIds = ref([])
const isAllSelected = computed(
  () => items.value.length > 0 && selectedIds.value.length === items.value.length
)
const isIndeterminate = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < items.value.length
)

function toggleSelectAll(e) {
  selectedIds.value = e.target.checked ? items.value.map((c) => c.id) : []
}
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const editingPriorityId = ref(null)
const editingPriorityValue = ref('')

function startEditPriority(city) {
  if (!canEdit.value) return
  editingPriorityId.value = city.id
  editingPriorityValue.value = city.priority ?? ''
}
function cancelPriority() {
  editingPriorityId.value = null
  editingPriorityValue.value = ''
}

async function savePriority(cityId) {
  if (!canEdit.value) return
  if (editingPriorityId.value !== cityId) return
  const raw = editingPriorityValue.value
  const priority = raw === '' ? null : parseInt(raw)
  if (priority !== null && (isNaN(priority) || priority < 1)) {
    showAlert('우선순위는 1 이상의 숫자여야 합니다.')
    cancelPriority()
    return
  }
  cancelPriority()
  try {
    await updateCityPriority(cityId, priority)
    await resetAndLoad()
  } catch {
    showAlert(errorMessage.value || '우선순위 업데이트에 실패했습니다.')
  }
}

const isAddModalOpen = ref(false)
function openAddModal() {
  isAddModalOpen.value = true
}
function closeAddModal() {
  isAddModalOpen.value = false
}
async function handleAddSuccess() {
  isAddModalOpen.value = false
  showAlert('도시가 등록되었습니다.')
  await resetAndLoad()
}

const isEditModalOpen = ref(false)
const editingCity = ref(null)

function openEditModal(city) {
  editingCity.value = city
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingCity.value = null
}

async function handleEditSuccess(data) {
  try {
    await updateCity(editingCity.value.id, data)
    closeEditModal()
    showAlert('도시 이름이 수정되었습니다.')
    await resetAndLoad()
  } catch {
    showAlert(errorMessage.value || '도시 이름 수정에 실패했습니다.')
  }
}

const deleting = ref(false)
const confirmModal = reactive({ isOpen: false, message: '' })

function openDeleteConfirm() {
  if (!selectedIds.value.length) return
  confirmModal.message = `선택한 ${selectedIds.value.length}개의 도시를 삭제하시겠습니까?`
  confirmModal.isOpen = true
}
function closeDeleteConfirm() {
  confirmModal.isOpen = false
}

async function handleDeleteConfirm() {
  closeDeleteConfirm()
  deleting.value = true
  try {
    const result = await deleteCities(selectedIds.value)
    showAlert(`${result.count}개의 도시가 삭제되었습니다.`)
    selectedIds.value = []
    await resetAndLoad()
  } catch {
    showAlert(errorMessage.value || '도시 삭제에 실패했습니다.')
  } finally {
    deleting.value = false
  }
}

const alertModal = reactive({ isOpen: false, message: '' })
function showAlert(msg) {
  alertModal.message = msg
  alertModal.isOpen = true
}
function closeAlertModal() {
  alertModal.isOpen = false
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const utc = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  return new Date(utc).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.cities-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
  flex-shrink: 0;
  margin-bottom: 0 !important;
}
.filter-count {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}
.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 240px;
}
.search-input {
  width: 100%;
  padding: 8px 28px 8px 10px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
}
.search-input:focus {
  border-color: #ff7738;
  box-shadow: 0 0 0 2px rgba(255, 119, 56, 0.15);
}
.search-clear {
  position: absolute;
  right: 8px;
  font-size: 11px;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.search-clear:hover {
  color: #374151;
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
  padding: 11px 16px;
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
  font-size: 13px;
}
.loading-more-cell {
  padding: 20px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.edit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.edit-icon:hover {
  background: #f3f4f6;
  color: #ff7738;
}

.priority-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.priority-set {
  background: #dbeafe;
  color: #2563eb;
}
.priority-set:hover {
  background: #bfdbfe;
}
.priority-unset {
  background: #f3f4f6;
  color: #9ca3af;
}
.priority-unset:hover {
  background: #e5e7eb;
  color: #6b7280;
}
.priority-input {
  width: 72px;
  padding: 3px 8px;
  border: 1px solid #ff7738;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 119, 56, 0.2);
}
.table-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #ff7738;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #ff7738;
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
.table-container::-webkit-scrollbar,
.card-container::-webkit-scrollbar {
  width: 6px;
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
.card-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 12px 12px 80px;
}
.city-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 14px 16px;
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
  padding-bottom: 10px;
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
  align-items: center;
}
.card-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.card-value {
  font-size: 13px;
  color: #1f2937;
}

.card-value-with-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon-mobile {
  padding: 4px 10px;
  font-size: 11px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-icon-mobile:hover {
  background: #ff7738;
  color: white;
}

.loading-card,
.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 16px;
  color: #6b7280;
  font-size: 13px;
}
.loading-more-card {
  padding: 20px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 1024px) {
  .filter-bar {
    flex-wrap: wrap;
    padding: 8px 12px;
  }
  .filter-bar :deep(.custom-select) {
    width: 100%;
    flex: 1 1 100%;
  }
  .search-wrap {
    max-width: 100%;
    flex: 1 1 100%;
  }
  .search-input {
    font-size: 16px;
  }
  .filter-count {
    display: none;
  }
  .filter-actions {
    width: 100%;
    margin-left: 0;
    flex-direction: column;
  }
  .filter-actions button {
    width: 100%;
  }
  .priority-input {
    font-size: 16px;
  }
}

@media (max-width: 350px) {
  .card-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
