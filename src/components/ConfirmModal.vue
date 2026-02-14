<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="modal-button modal-button-cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="modal-button modal-button-confirm"
              :class="confirmButtonClass"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // 'danger' | 'info'
    validator: (value) => ['danger', 'info'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: '확인',
  },
  cancelText: {
    type: String,
    default: '취소',
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const confirmButtonClass = computed(() => {
  return props.type === 'danger' ? 'bg-red-500' : 'bg-primary-500'
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 90%;
}

.modal-body {
  padding: 32px 24px 24px;
  text-align: center;
}

.modal-message {
  color: #111827;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
}

.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 8px;
}

.modal-button {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-button-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-button-cancel:hover {
  background: #e5e7eb;
}

.modal-button-confirm {
  color: white;
}

/* 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
