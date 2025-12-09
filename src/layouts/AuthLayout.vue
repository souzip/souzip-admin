<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <div class="fixed top-4 right-4 z-50">
      <DarkModeToggle />
    </div>
    
    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <img
            src="/logo.png"
            alt="Souzip Logo"
            class="h-20 mx-auto mb-3"
          />
        </div>
        
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import DarkModeToggle from '@/components/DarkModeToggle.vue'
</script>
