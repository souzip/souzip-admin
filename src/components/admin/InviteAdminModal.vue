<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- 모달 헤더 -->
          <div class="modal-header">
            <h2 class="modal-title">관리자 초대</h2>
            <button type="button" class="close-button" @click="handleClose">
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

          <!-- 모달 바디 -->
          <div class="modal-body">
            <!-- 에러 메시지 -->
            <div v-if="errorMessage" class="error-banner">
              <p class="error-text">{{ errorMessage }}</p>
            </div>

            <!-- 폼 -->
            <form @submit.prevent="handleSubmit">
              <!-- 아이디 -->
              <div class="form-group">
                <label for="username" class="form-label">
                  아이디 <span class="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  placeholder="영문/숫자/언더스코어/한글"
                  class="form-input"
                  :disabled="loading"
                  required
                />
              </div>

              <!-- 비밀번호 -->
              <div class="form-group">
                <label for="password" class="form-label">
                  비밀번호 <span class="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="최소 8자 이상"
                  class="form-input"
                  :disabled="loading"
                  required
                />
              </div>

              <!-- 역할 -->
              <div class="form-group">
                <label class="form-label"> 역할 <span class="text-red-500">*</span> </label>
                <div class="role-options">
                  <label
                    v-for="option in roleOptions"
                    :key="option.value"
                    class="role-option"
                    :class="{
                      'role-option-selected': form.role === option.value,
                    }"
                  >
                    <input
                      v-model="form.role"
                      type="radio"
                      :value="option.value"
                      class="role-radio"
                      :disabled="loading"
                    />
                    <div class="role-content">
                      <div class="role-label">{{ option.label }}</div>
                      <div class="role-description">{{ option.description }}</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- 안내사항 -->
              <div class="info-box">
                <ul class="info-list">
                  <li>ADMIN 또는 VIEWER 역할만 초대 가능</li>
                  <li>아이디는 중복될 수 없음</li>
                </ul>
              </div>
            </form>
          </div>

          <!-- 모달 푸터 -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleClose">취소</button>
            <button type="submit" class="btn btn-primary" :disabled="loading" @click="handleSubmit">
              <span v-if="loading">초대 중...</span>
              <span v-else>초대하기</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { useAdminManagement } from '@/composables/useAdminManagement'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'success'])

const {
  form,
  loading,
  errorMessage,
  successMessage,
  roleOptions,
  inviteAdmin,
  resetForm,
  validateForm,
} = useAdminManagement()

// 모달이 열릴 때마다 폼 초기화
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      resetForm()
      errorMessage.value = ''
      successMessage.value = ''
    }
  }
)

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    const admin = await inviteAdmin()

    if (admin) {
      // 성공 시 바로 모달 닫고 부모에게 알림
      emit('success', admin)
      emit('close')
    }
  } catch {
    // 에러는 composable에서 처리
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
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
  padding: 20px;
  /* 모바일 더블탭 줌 방지 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  /* 모바일 터치 동작 최적화 */
  touch-action: manipulation;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
  /* 터치 영역 확대 */
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  touch-action: manipulation;
}

.close-button:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.close-button:active {
  opacity: 0.7;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  /* 스크롤 성능 향상 */
  -webkit-overflow-scrolling: touch;
}

.error-banner {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-text {
  font-size: 14px;
  color: #dc2626;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.text-red-500 {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.15s;
  /* 입력 필드에서 더블탭 줌 방지 */
  touch-action: manipulation;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #ff7738;
  box-shadow: 0 0 0 3px rgba(255, 119, 56, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-option {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  touch-action: manipulation;
}

.role-option:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.role-option-selected {
  border-color: #ff7738;
  background: #fff5f0;
}

.role-radio {
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.role-content {
  flex: 1;
  margin-left: 12px;
}

.role-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.role-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.info-box {
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  margin-top: 20px;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #1e40af;
  line-height: 1.6;
}

.info-list li {
  margin-bottom: 4px;
}

.info-list li:last-child {
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  /* 터치 영역 최적화 */
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #ff7738;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e66a32;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

  .modal-body form {
    gap: 12px;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
}
</style>
