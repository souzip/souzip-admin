<template>
  <RouterView />
  <AlertModal
    :is-open="globalModal.isOpen"
    :message="globalModal.message"
    @close="globalModal.close"
  />
</template>

<script setup>
import { RouterView } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'
import { useGlobalModal } from '@/stores/globalModal'

const globalModal = useGlobalModal()
</script>
