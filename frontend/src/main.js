import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

async function init() {
  // Dev mode: eagerly load HomeView so its global styles are injected
  // before the router resolves any sub-page on a direct refresh.
  if (import.meta.env.DEV) {
    await import('@/views/HomeView.vue')
  }

  createApp(App).use(createPinia()).use(router).mount('#app')
}

init()
