<template>
  <button
    @click="toggleDark"
    class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
  >
    <component :is="currentIcon" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import SunIcon from '@/components/icons/SunIcon.vue'
import MoonIcon from '@/components/icons/MoonIcon.vue'

const { isDark, toggleDark } = useDarkMode()

const currentIcon = computed(() => {
  if (isDark.value === true) {
    return MoonIcon
  }
  
  return SunIcon
})
</script>
