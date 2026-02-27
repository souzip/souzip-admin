<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- 헤더 -->
          <div class="modal-header">
            <h2 class="modal-title">도시 등록</h2>
            <button type="button" class="close-btn" :disabled="loading" @click="handleClose">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 바디 -->
          <div class="modal-body">
            <!-- 에러 배너 -->
            <div v-if="cityFormError" class="error-banner">
              {{ cityFormError }}
            </div>

            <!-- 나라 선택 -->
            <div class="field-group">
              <label class="label-base"> 나라 <span class="text-red-500">*</span> </label>
              <CustomSelect
                v-model="cityForm.countryId"
                :options="countries"
                value-key="id"
                label-key="nameKr"
                placeholder="나라를 선택해주세요"
                :disabled="loading"
              />
            </div>

            <!-- 한글명 -->
            <div class="field-group">
              <label class="label-base"> 한글 도시명 <span class="text-red-500">*</span> </label>
              <input
                v-model="cityForm.nameKr"
                type="text"
                class="input-base"
                placeholder="예) 서울"
                :disabled="loading"
                @keyup.enter="handleSubmit"
              />
            </div>

            <!-- 영문명 -->
            <div class="field-group">
              <label class="label-base"> 영문 도시명 <span class="text-red-500">*</span> </label>
              <input
                v-model="cityForm.nameEn"
                type="text"
                class="input-base"
                placeholder="예) Seoul"
                :disabled="loading"
                @keyup.enter="handleSubmit"
              />
            </div>

            <!-- 위도 / 경도 -->
            <div class="field-row">
              <div class="field-group flex-1">
                <label class="label-base"> 위도 <span class="text-red-500">*</span> </label>
                <input
                  v-model="cityForm.latitude"
                  type="number"
                  step="0.0001"
                  class="input-base"
                  placeholder="예) 37.5665"
                  :disabled="loading"
                />
              </div>
              <div class="field-group flex-1">
                <label class="label-base"> 경도 <span class="text-red-500">*</span> </label>
                <input
                  v-model="cityForm.longitude"
                  type="number"
                  step="0.0001"
                  class="input-base"
                  placeholder="예) 126.9780"
                  :disabled="loading"
                />
              </div>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="modal-footer">
            <button
              type="button"
              class="modal-btn modal-btn-cancel"
              :disabled="loading"
              @click="handleClose"
            >
              취소
            </button>
            <button
              type="button"
              class="modal-btn modal-btn-confirm"
              :disabled="loading"
              @click="handleSubmit"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <span class="btn-spinner"></span>
                등록 중
              </span>
              <span v-else>등록</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { useDestination } from '@/composables/useDestination'
import CustomSelect from '@/components/CustomSelect.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  countries: {
    type: Array,
    default: () => [],
  },
  defaultCountryId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])

const { loading, cityForm, cityFormError, validateCityForm, createCity, resetCityForm } =
  useDestination()

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      resetCityForm()
      if (props.defaultCountryId) {
        cityForm.countryId = props.defaultCountryId
      }
    }
  }
)

async function handleSubmit() {
  if (!validateCityForm()) return
  try {
    await createCity()
    emit('success')
  } catch {
    // cityFormError 에 이미 메시지 세팅됨
  }
}

function handleClose() {
  if (loading.value) return
  resetCityForm()
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  color: #9ca3af;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.close-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 바디 */
.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #dc2626;
  line-height: 1.5;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-row {
  display: flex;
  gap: 12px;
}

/* 푸터 */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modal-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.modal-btn-confirm {
  background: #ff7738;
  color: white;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #e66a32;
}

/* 버튼 스피너 */
.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* 태블릿 이하: 위도/경도 및 버튼 컬럼 */
@media (max-width: 768px) {
  .field-row {
    flex-direction: column;
    gap: 16px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>
