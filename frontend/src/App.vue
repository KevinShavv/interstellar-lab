<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()

onMounted(() => {
  store.bootstrap()
})
</script>

<template>
  <div class="app-shell">
    <RouterView />
  </div>
</template>
