<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useSiteChrome } from '@/composables/useSiteChrome'

const route = useRoute()
const { headerText, navItems } = useSiteChrome()

const activePath = computed(() => route.path)
</script>

<template>
  <header class="site-header animate-drop-in" style="animation-delay: 0s;">
    <div class="site-header__inner">
      <div class="site-header__left">
        <RouterLink class="site-header__brand" to="/">
          {{ headerText.brand }}
        </RouterLink>

        <nav class="site-header__nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="site-header__nav-link"
            :class="
              activePath === item.to
                ? 'site-header__nav-link--active'
                : ''
            "
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

    </div>
  </header>
</template>

<style>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 60;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.82);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.site-header__inner {
  max-width: 1540px;
  margin: 0 auto;
  height: 44px;
  border-radius: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.site-header__left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.site-header__brand {
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  text-shadow: none;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-header__nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.72);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  letter-spacing: 0;
  font-size: 0.75rem;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.site-header__nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.site-header__nav-link--active {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.site-header__right {
  display: flex;
  align-items: center;
}

.site-header__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.site-chip {
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(29, 29, 31, 0.9);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.site-chip:hover {
  background: rgba(51, 51, 51, 0.92);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

.site-chip__text {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0;
}

.site-chip__on {
  color: #fff;
}

.site-chip__off {
  color: rgba(255, 255, 255, 0.52);
}

.site-icon-btn {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(29, 29, 31, 0.9);
  color: rgba(255, 255, 255, 0.86);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.site-icon-btn:hover {
  color: #fff;
  background: rgba(51, 51, 51, 0.92);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .site-header {
    background: #000;
  }
}

@media (max-width: 900px) {
  .site-header {
    padding: 0;
  }

  .site-header__inner {
    height: 44px;
    border-radius: 0;
    padding: 0 14px;
  }

  .site-header__brand {
    font-size: 0.78rem;
  }

  .site-header__nav {
    display: none;
  }
}
</style>
