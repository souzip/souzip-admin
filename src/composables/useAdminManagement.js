import { reactive, ref } from 'vue'
import client from '@/api/Client'

export function useAdminManagement() {
  const form = reactive({
    username: '',
    password: '',
    role: 'ADMIN',
  })

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const roleOptions = [
    { value: 'ADMIN', label: 'ADMIN', description: 'CRUD 가능' },
    { value: 'VIEWER', label: 'VIEWER', description: '조회만 가능' },
  ]

  // 관리자 초대
  async function inviteAdmin() {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const res = await client.post('/api/admin/invite', {
        username: form.username,
        password: form.password,
        role: form.role,
      })

      successMessage.value = '관리자 초대가 완료되었습니다.'
      resetForm()

      return res.data.data
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || '관리자 초대에 실패했습니다.'
      throw error
    } finally {
      loading.value = false
    }
  }

  // 관리자 목록 조회
  async function getAdmins(pageNo = 1, pageSize = 20) {
    const res = await client.get('/api/admin/list', {
      params: { pageNo, pageSize },
    })

    return res.data.data
  }

  // 관리자 삭제
  async function deleteAdmin(adminId) {
    const res = await client.delete(`/api/admin/${adminId}`)
    return res.data
  }

  // 여러 관리자 삭제
  async function deleteAdmins(adminIds) {
    loading.value = true

    try {
      const deletePromises = adminIds.map((id) => deleteAdmin(id))
      await Promise.all(deletePromises)

      return { success: true, count: adminIds.length }
    } finally {
      loading.value = false
    }
  }

  function resetForm() {
    form.username = ''
    form.password = ''
    form.role = 'ADMIN'
  }

  function validateForm() {
    errorMessage.value = ''

    if (!form.username || form.username.length < 2 || form.username.length > 20) {
      errorMessage.value = '아이디는 2-20자 사이여야 합니다.'
      return false
    }

    if (!/^[a-zA-Z0-9_가-힣]+$/.test(form.username)) {
      errorMessage.value = '아이디는 영문, 숫자, 언더스코어, 한글만 가능합니다.'
      return false
    }

    if (!form.password || form.password.length < 8) {
      errorMessage.value = '비밀번호는 최소 8자 이상이어야 합니다.'
      return false
    }

    if (!form.role) {
      errorMessage.value = '역할을 선택해주세요.'
      return false
    }

    return true
  }

  return {
    form,
    loading,
    errorMessage,
    successMessage,
    roleOptions,
    inviteAdmin,
    getAdmins,
    deleteAdmin,
    deleteAdmins,
    resetForm,
    validateForm,
  }
}
