import { defineStore } from 'pinia'

import { solarApi } from '@/api/solarApi'

const fallbackModules = [
  {
    slug: 'move',
    title: '地月转移演示',
    summary: '地月轨道转移演示。',
    description: '',
    route: '/move',
    preview_image: '/assets/simulation/models/3.webp',
    accent: '#2dd4bf',
  },
  {
    slug: 'home',
    title: '探索太阳系',
    summary: '太阳系 3D 展示。',
    description: '',
    route: '/solar',
    preview_image: '/assets/simulation/models/sys.jpg',
    accent: '#f59e0b',
  },
  {
    slug: 'tls',
    title: '星体实验室',
    summary: '多天体引力模拟。',
    description: '',
    route: '/tls',
    preview_image: '/assets/simulation/models/5.webp',
    accent: '#60a5fa',
  },
  {
    slug: 'earth-moon-sun',
    title: '日地月特殊节点',
    summary: '二分二至、日食月食、中秋月相等特殊天文节点。',
    description: '',
    route: '/earth-moon-sun',
    preview_image: '/assets/simulation/models/sys.jpg',
    accent: '#f59e0b',
  },
  {
    slug: 'realtime',
    title: '实时天体追踪',
    summary: '接入 NASA Horizons API，获取天体实时星历数据。',
    description: '',
    route: '/realtime',
    preview_image: '/assets/simulation/models/sys.jpg',
    accent: '#8b5cf6',
  },
]

const fallbackScenes = [
  { slug: 'move', title: '地月转移演示', route: '/move', legacy_path: '/legacy/LaunchDemostration.html', kind: 'three-scene' },
  { slug: 'home', title: '探索太阳系', route: '/solar', legacy_path: '/legacy/SolarSystem.html', kind: 'three-scene' },
  { slug: 'tls', title: '星体实验室', route: '/tls', legacy_path: '/legacy/Celestial%20SimulationLab.html', kind: 'three-scene' },
  { slug: 'earth-moon-sun', title: '日地月特殊节点', route: '/earth-moon-sun', legacy_path: '/legacy/EarthMoonSun.html', kind: 'three-scene' },
  { slug: 'realtime', title: '实时天体追踪', route: '/realtime', legacy_path: '/legacy/RealtimeCelestial.html', kind: 'three-scene' },
]

export const useSolarStore = defineStore('solar', {
  state: () => ({
    bootstrapped: false,
    loading: false,
    apiHealthy: false,
    error: '',
    modules: [...fallbackModules],
    scenes: [...fallbackScenes],
    planets: [],
    solarConfig: null,
  }),
  getters: {
    moduleMap: (state) => Object.fromEntries(state.modules.map((module) => [module.slug, module])),
    sceneMap: (state) => Object.fromEntries(state.scenes.map((scene) => [scene.slug, scene])),
  },
  actions: {
    async bootstrap() {
      if (this.bootstrapped || this.loading) {
        return
      }

      this.loading = true

      const [healthResult, modulesResult, scenesResult, planetsResult, configResult] = await Promise.allSettled([
        solarApi.getHealth(),
        solarApi.getModules(),
        solarApi.getScenes(),
        solarApi.getPlanets(),
        solarApi.getSolarSystemConfig(),
      ])

      this.apiHealthy = healthResult.status === 'fulfilled' && healthResult.value?.status === 'ok'

      if (modulesResult.status === 'fulfilled') {
        this.modules = modulesResult.value
      }

      if (scenesResult.status === 'fulfilled') {
        this.scenes = scenesResult.value
      }

      if (planetsResult.status === 'fulfilled') {
        this.planets = planetsResult.value
      }

      if (configResult.status === 'fulfilled') {
        this.solarConfig = configResult.value
      }

      if (!this.apiHealthy) {
        this.error = '后端未连接时会使用本地场景入口。'
      }

      this.loading = false
      this.bootstrapped = true
    },
    resolveScene(slug) {
      return this.sceneMap[slug] || fallbackScenes.find((scene) => scene.slug === slug) || null
    },
  },
})