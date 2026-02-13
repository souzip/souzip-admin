<template>
  <div class="min-h-screen bg-gray-50">
    <AdminTopbar @toggleSidebar="toggleSidebar" />

    <div class="flex">
      <AdminSidebar :open="sidebarOpen" />

      <main class="flex-1 min-w-0">
        <div class="page-wrapper">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminTopbar from '@/components/admin/AdminTopbar.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const sidebarOpen = ref(true)

function toggleSidebar() {
  if (sidebarOpen.value === true) {
    sidebarOpen.value = false
    return
  }

  sidebarOpen.value = true
}
</script>
