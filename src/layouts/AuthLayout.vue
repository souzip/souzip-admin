<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="flex-1 flex items-center justify-center px-4 py-12 mb-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <img src="/logo.png" alt="Souzip Logo" class="h-20 mx-auto mb-3" />
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>
