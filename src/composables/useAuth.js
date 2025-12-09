import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  
  const form = ref({
    username: '',
    password: '',
  })
  
  const loading = ref(false)
  const errorMessage = ref('')
  
  const clearError = () => {
    errorMessage.value = ''
  }
  
  const setError = (message) => {
    errorMessage.value = message
  }
  
  const login = async (credentials) => {
    try {
      // TODO: 실제 API 호출로 교체
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
  
  const handleLogin = async () => {
    loading.value = true
    clearError()
    
    try {
      const result = await login(form.value)
      
      if (result.success === true) {
        router.push('/dashboard')
        return
      }
      
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
    } catch (error) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
      console.error('로그인 에러:', error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    form,
    loading,
    errorMessage,
    handleLogin,
  }
}
