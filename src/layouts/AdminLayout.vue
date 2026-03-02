<template>
  <div class="min-h-screen bg-gray-50">
    <AdminTopbar @toggleSidebar="toggleSidebar" />

    <div class="flex relative">
      <transition name="fade">
        <div
          v-if="sidebarOpen"
          class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          @click="closeSidebar"
        />
      </transition>

      <AdminSidebar :open="sidebarOpen" @close="closeSidebar" @logout="handleLogout" />

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
import { useAuth } from '@/composables/useAuth'

const { handleLogout } = useAuth()
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
