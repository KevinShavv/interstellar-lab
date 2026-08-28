import { computed, ref } from 'vue'

const currentLang = ref(typeof window !== 'undefined' && window.localStorage.getItem('site-lang') === 'en' ? 'en' : 'zh')
const volumeMuted = ref(typeof window !== 'undefined' && window.localStorage.getItem('site-volume-muted') === '1')

const headerTranslations = {
  zh: {
    brand: '“宇”你同行',
    home: '首页',
    move: '地月转移演示',
    solar: '太阳系',
    tls: '实验室',
  },
  en: {
    brand: 'Interstellar Lab',
    home: 'Home',
    move: 'Moon-Earth Mission',
    solar: 'Solar System',
    tls: 'Laboratory',
  },
}

function persistState() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('site-lang', currentLang.value)
  window.localStorage.setItem('site-volume-muted', volumeMuted.value ? '1' : '0')
}

export function useSiteChrome() {
  const headerText = computed(() => headerTranslations[currentLang.value])
  const navItems = computed(() => [
    { label: headerText.value.home, to: '/' },
    { label: headerText.value.move, to: '/move' },
    { label: headerText.value.solar, to: '/solar' },
    { label: headerText.value.tls, to: '/tls' },
  ])

  function toggleLanguage() {
    currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
    persistState()
  }

  function toggleVolume() {
    volumeMuted.value = !volumeMuted.value
    persistState()
  }

  return {
    currentLang,
    volumeMuted,
    headerText,
    navItems,
    toggleLanguage,
    toggleVolume,
  }
}
