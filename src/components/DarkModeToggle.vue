<template>
  <button
    type="button"
    @click="toggleDark"
    class="p-2 rounded-lg bg-appGray-200 hover:bg-appGray-300 dark:bg-appGray-800 dark:hover:bg-appGray-700 transition-colors text-appGray-700 dark:text-white"
    :aria-label="isDark ? '다크 모드 (켜짐)' : '다크 모드 (꺼짐)'"
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
const currentIcon = computed(() => (isDark.value ? MoonIcon : SunIcon))
</script>
