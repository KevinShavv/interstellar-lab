<script setup>
import { computed, onMounted } from 'vue'

import SolarSystem3D from '@/components/SolarSystem3D.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()
const { currentLang } = useSiteChrome()

const scene = computed(() => store.resolveScene('realtime'))

const pageMeta = computed(() =>
  currentLang.value === 'zh'
    ? {
        title: '实时天体追踪',
        eyebrow: 'Skyfield 星历',
        description: '基于 Skyfield + JPL DE430 本地星历，查询太阳系天体实时位置与速度矢量（国内可用，无需联网）。',
        backgroundImage: '/assets/simulation/models/sys.jpg',
        openLabel: '进入模块',
      }
    : {
        title: 'Real-time Celestial Tracking',
        eyebrow: 'NASA Horizons',
        description: 'Access NASA JPL Horizons ephemeris system to query real-time positions and velocity vectors of solar system bodies.',
        backgroundImage: '/assets/simulation/models/sys.jpg',
        openLabel: 'Enter Module',
      },
)

onMounted(() => {
  store.bootstrap()
})
</script>

<template>
  <SolarSystem3D v-if="scene" :src="scene.legacy_path" v-bind="pageMeta" />
</template>
