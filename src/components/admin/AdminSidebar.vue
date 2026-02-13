<template>
  <aside class="w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-56px)]" :class="openClass">
    <nav class="p-4 space-y-1">
      <RouterLink to="/admin" class="nav-item" active-class="nav-active"> 대시보드 </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const openClass = computed(() => {
  if (props.open === true) {
    return 'block'
  }

  return 'hidden'
})
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(17, 24, 39, 0.9);
  transition: background 0.2s ease;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-active {
  background: rgba(255, 119, 56, 0.14);
  color: rgba(255, 119, 56, 1);
}
</style>
