import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalModal = defineStore('globalModal', () => {
  const isOpen = ref(false)
  const message = ref('')

  function showAlert(msg) {
    message.value = msg
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, message, showAlert, close }
})
