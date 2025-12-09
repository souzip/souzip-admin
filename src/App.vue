<template>
  <div class="min-h-screen p-8">
    <!-- Tailwind 3 테스트 -->
    <div class="bg-primary-500 text-white p-4 rounded-lg mb-4">
      Tailwind 3 작동 테스트!
    </div>
    
    <div class="space-y-4">
      <button class="btn-primary">Primary Button</button>
      <button class="btn-secondary">Secondary Button</button>
      
      <div class="card">
        <h2 class="text-xl font-bold">Card Component</h2>
        <p class="text-gray-600">디자인 시스템이 잘 작동하는지 확인!</p>
      </div>
      
      <input type="text" placeholder="Input 테스트" class="input-base" />
      
      <div class="flex gap-2">
        <span class="badge-primary">Primary</span>
        <span class="badge-success">Success</span>
      </div>
    </div>
    
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
