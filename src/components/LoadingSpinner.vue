<template>
  <div
    v-show="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="status"
    aria-live="polite"
    :aria-busy="show ? 'true' : 'false'"
  >
    <div
      class="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary-500"
    ></div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})
</script>
