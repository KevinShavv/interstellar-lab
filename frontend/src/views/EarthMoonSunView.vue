<script setup>
import { computed, onMounted } from 'vue'

import SolarSystem3D from '@/components/SolarSystem3D.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()
const { currentLang } = useSiteChrome()

const scene = computed(() => store.resolveScene('earth-moon-sun'))

const pageMeta = computed(() =>
  currentLang.value === 'zh'
    ? {
        title: '日地月特殊节点',
        eyebrow: '天文现象',
        description: '观察二分二至、近日远日、日食月食与中秋月相等特殊天文节点。',
        backgroundImage: '/assets/simulation/models/sys.jpg',
        openLabel: '进入模块',
      }
    : {
        title: 'Earth-Moon-Sun Nodes',
        eyebrow: 'Astronomical Events',
        description: 'Observe equinoxes, solstices, eclipses, and special lunar phases.',
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
