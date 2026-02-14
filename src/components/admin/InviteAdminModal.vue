<template>
  <!-- 모달 배경 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="handleClose"
  >
    <!-- 모달 컨텐츠 -->
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- 모달 헤더 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">관리자 초대</h2>
        <button
          type="button"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          @click="handleClose"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500"
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
      <div class="p-6">
        <!-- 성공 메시지 -->
        <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-800">{{ successMessage }}</p>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>

        <!-- 폼 -->
        <form @submit.prevent="handleSubmit">
          <!-- 아이디 -->
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              아이디 <span class="text-red-500">*</span>
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="4-20자, 영문/숫자/언더스코어"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              :disabled="loading"
              required
            />
            <p class="text-xs text-gray-500 mt-1">4-20자, 영문/숫자/언더스코어만 가능</p>
          </div>

          <!-- 비밀번호 -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="최소 8자 이상"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              :disabled="loading"
              required
            />
            <p class="text-xs text-gray-500 mt-1">최소 8자 이상</p>
          </div>

          <!-- 역할 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              역할 <span class="text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <label
                v-for="option in roleOptions"
                :key="option.value"
                class="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{
                  'border-orange-500 bg-orange-50': form.role === option.value,
                }"
              >
                <input
                  v-model="form.role"
                  type="radio"
                  :value="option.value"
                  class="mt-1"
                  :disabled="loading"
                />
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-900">{{ option.label }}</div>
                  <div class="text-sm text-gray-600">{{ option.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- 안내사항 -->
          <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-sm font-medium text-blue-900 mb-2">안내사항</h3>
            <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>SUPER_ADMIN 권한이 필요합니다.</li>
              <li>ADMIN 또는 VIEWER 역할만 초대 가능합니다.</li>
              <li>SUPER_ADMIN 역할은 초대할 수 없습니다.</li>
              <li>아이디는 중복될 수 없습니다.</li>
            </ul>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <span v-if="loading">초대 중...</span>
              <span v-else>초대하기</span>
            </button>
            <button
              type="button"
              class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="loading"
              @click="handleClose"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
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

  const admin = await inviteAdmin()

  if (admin) {
    // 성공 시 1.5초 후 모달 닫고 부모에게 알림
    setTimeout(() => {
      emit('success', admin)
      emit('close')
    }, 1500)
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
}
</script>
