<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">도시 이름 수정</h3>
            <button type="button" class="close-button" @click="close">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">도시 한글명</label>
              <input
                v-model="form.nameKr"
                type="text"
                class="form-input"
                placeholder="예: 서울특별시"
                @keyup.enter="handleSubmit"
              />
            </div>

            <div class="form-group">
              <label class="form-label">도시 영문명</label>
              <input
                v-model="form.nameEn"
                type="text"
                class="form-input"
                placeholder="예: Seoul"
                @keyup.enter="handleSubmit"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="close">취소</button>
            <button
              type="button"
              class="btn-submit"
              :disabled="loading || !isFormValid"
              @click="handleSubmit"
            >
              {{ loading ? '저장 중' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  city: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  nameKr: '',
  nameEn: '',
})

const loading = ref(false)

const isFormValid = computed(() => {
  return form.value.nameKr.trim() !== '' && form.value.nameEn.trim() !== ''
})

watch(
  () => props.city,
  (newCity) => {
    if (newCity) {
      form.value.nameKr = newCity.nameKr || ''
      form.value.nameEn = newCity.nameEn || ''
    }
  },
  { immediate: true }
)

function close() {
  emit('close')
}

function handleSubmit() {
  if (!isFormValid.value || loading.value) return

  emit('success', {
    nameKr: form.value.nameKr.trim(),
    nameEn: form.value.nameEn.trim(),
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: #ff7738;
  box-shadow: 0 0 0 3px rgba(255, 119, 56, 0.1);
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #ff7738;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #ff6520;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .modal-header {
    padding: 12px 20px;
  }

  .modal-body {
    padding: 12px 20px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    padding: 12px 20px;
  }

  .field-group {
    gap: 6px;
  }
}
</style>
