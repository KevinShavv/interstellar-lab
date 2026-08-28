import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/solar', name: 'solar', component: () => import('@/views/SolarView.vue') },
    { path: '/move', name: 'move', component: () => import('@/views/MoveView.vue') },
    { path: '/tls', name: 'tls', component: () => import('@/views/TlsView.vue') },
    { path: '/earth-moon-sun', name: 'earth-moon-sun', component: () => import('@/views/EarthMoonSunView.vue') },
    { path: '/realtime', name: 'realtime', component: () => import('@/views/RealtimeView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
