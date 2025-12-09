import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)
  
  onMounted(() => {
    const saved = localStorage.getItem('souzip-admin-theme')
    isDark.value = saved === 'dark'
    applyTheme()
  })
  
  const applyTheme = () => {
    if (isDark.value === true) {
      document.documentElement.classList.add('dark')
      return
    }
    
    document.documentElement.classList.remove('dark')
  }
  
  const saveTheme = () => {
    if (isDark.value === true) {
      localStorage.setItem('souzip-admin-theme', 'dark')
      return
    }
    
    localStorage.setItem('souzip-admin-theme', 'light')
  }
  
  watch(isDark, () => {
    saveTheme()
    applyTheme()
  })
  
  const toggleDark = () => {
    isDark.value = isDark.value === false
  }
  
  return { isDark, toggleDark }
}
