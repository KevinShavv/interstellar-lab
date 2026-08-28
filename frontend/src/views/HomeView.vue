<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAmbientAudio } from '@/composables/useAmbientAudio'
import SiteHeader from '@/components/SiteHeader.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const router = useRouter()
const store = useSolarStore()

const rootRef = ref(null)
const starCanvas = ref(null)
const heroBgImg = ref(null)
const heroOverlay = ref(null)
const heroContent = ref(null)

const { currentLang } = useSiteChrome()

useAmbientAudio('/assets/audio/homepage.wav', { volume: 0.34 })

const translations = {
  zh: {
    brand: '“宇”你同行',
    nav1: '首页',
    nav2: '探索地月转移演示',
    nav3: '太阳系',
    nav4: '“宇”你同行',
    hero_title: '触摸宇宙的每一颗星',
    hero_subtitle: '在虚拟实验室中探索天体物理，跨越光年的距离，体验沉浸式行星观测。',
    hero_btn1: '开启探索旅程',
    hero_btn2: '下载课程资料',
    module_title: '核心探索模块',
    module_subtitle:
      '三条路径，三种能力：观察、推演、验证。',
    card1_tag: '星系图谱',
    card1_title: '太阳系全景',
    card1_punch: '一眼看懂太阳系结构与尺度',
    card1_desc: '从系统尺度快速建立空间感与周期感。',
    card1_detail:
      '适合作为课堂导入，先看全局再进细节。',
    card1_points: [
      { icon: 'public', text: '整体布局对比' },
      { icon: 'schedule', text: '公转节奏可视化' },
      { icon: 'travel_explore', text: '宏观结构认知' },
    ],
    card2_tag: '地月轨道',
    card2_title: '地月系统模拟',
    card2_punch: '像任务指挥一样推演地月转移',
    card2_desc: '把发射、变轨、捕获拆成清晰的任务步骤。',
    card2_detail:
      '适合讲解任务设计与轨道决策逻辑。',
    card2_points: [
      { icon: 'rocket_launch', text: '转移窗口判断' },
      { icon: 'tune', text: '速度-路径反馈' },
      { icon: 'flag', text: '方案推演对比' },
    ],
    card3_tag: '虚拟实验',
    card3_title: '科学实验室',
    card3_punch: '把物理假设变成可验证实验',
    card3_desc: '自由改参数、看响应、做结论。',
    card3_detail:
      '从看演示升级到亲手建模与复盘。',
    card3_points: [
      { icon: 'science', text: '多体参数实验' },
      { icon: 'monitoring', text: '连续反馈观测' },
      { icon: 'lightbulb', text: '假设到结论闭环' },
    ],
    card_btn: '进入探索',
    desc_title: '我们的价值与优势',
    desc_subtitle: '用更直观、更可操作的方式，把宇宙学习做成可体验的探索过程。',
    values_label: '价值观',
    values_intro: '科学严谨，探索自由',
    values_items: [
      {
        icon: 'visibility',
        title: '看得见规律',
        text: '复杂物理先可视化',
      },
      {
        icon: 'touch_app',
        title: '鼓励主动操作',
        text: '可点击、可试错、可对比',
      },
      {
        icon: 'school',
        title: '服务课堂与自学',
        text: '课堂讲解与课后复盘兼容',
      },
      {
        icon: 'auto_awesome',
        title: '统一叙事体验',
        text: '模块一致，路径清晰',
      },
    ],
    advantages_label: '核心优势',
    advantages_items: [
      { icon: 'bolt', title: '快速上手', text: '3分钟进入可交互状态' },
      { icon: 'model_training', title: '任务驱动', text: '从观察到决策逐步推进' },
      { icon: 'query_stats', title: '结果可解释', text: '参数变化与轨道反馈同步呈现' },
      { icon: 'groups', title: '教学友好', text: '适配课堂演示与分组讨论' },
    ],
    footer_desc: '致力于打造下一代沉浸式宇宙教育平台，让科学探索变得像游戏体验一样自然。',
    footer_h1: '快速链接',
    footer_h2: '社交媒体',
    f_link1: '太阳系',
    f_link2: '地月演示',
    f_link3: '实验室',
    f_link4: '官方微博',
    f_link5: '官方小红书',
    f_link6: '官方抖音',
  },
  en: {
    brand: 'Interstellar Lab',
    nav1: 'Home',
    nav2: 'Moon-Earth Mission',
    nav3: 'Solar System',
    nav4: 'Interstellar Lab',
    hero_title: 'Touch Every Star in the Universe',
    hero_subtitle: 'Explore astrophysics in a virtual lab, crossing light-years to experience immersive planetary observations.',
    hero_btn1: 'Start Journey',
    hero_btn2: 'Download Materials',
    module_title: 'Core Exploration Modules',
    module_subtitle:
      'Three tracks, three skills: observe, reason, verify.',
    card1_tag: 'Galactic Atlas',
    card1_title: 'Solar System Panorama',
    card1_punch: 'Understand structure and scale at a glance',
    card1_desc:
      'Build system-level spatial and orbital intuition quickly.',
    card1_detail:
      'Great for lesson kickoff before deeper analysis.',
    card1_points: [
      { icon: 'public', text: 'System layout contrast' },
      { icon: 'schedule', text: 'Orbit rhythm playback' },
      { icon: 'travel_explore', text: 'Macro structure view' },
    ],
    card2_tag: 'Earth Orbit',
    card2_title: 'Earth-Moon Simulation',
    card2_punch: 'Plan Earth-Moon transfer like a mission director',
    card2_desc:
      'Turn launch, transfer, and capture into clear task phases.',
    card2_detail:
      'Designed for transfer logic and mission decision walkthroughs.',
    card2_points: [
      { icon: 'rocket_launch', text: 'Window selection' },
      { icon: 'tune', text: 'Velocity-path feedback' },
      { icon: 'flag', text: 'Strategy comparison' },
    ],
    card3_tag: 'Virtual Lab',
    card3_title: 'Scientific Laboratory',
    card3_punch: 'Turn physical hypotheses into testable experiments',
    card3_desc:
      'Adjust parameters, observe response, validate ideas.',
    card3_detail:
      'Move from watching demos to building experiments.',
    card3_points: [
      { icon: 'science', text: 'Multi-body trials' },
      { icon: 'monitoring', text: 'Continuous feedback' },
      { icon: 'lightbulb', text: 'Hypothesis loop' },
    ],
    card_btn: 'Explore Now',
    desc_title: 'Values & Advantages',
    desc_subtitle: 'A more direct and hands-on way to turn cosmic learning into exploration.',
    values_label: 'Core Values',
    values_intro: 'Rigorous science, open exploration',
    values_items: [
      {
        icon: 'visibility',
        title: 'Make Patterns Visible',
        text: 'Complex physics made visible first',
      },
      {
        icon: 'touch_app',
        title: 'Encourage Active Interaction',
        text: 'Click, test, and compare',
      },
      {
        icon: 'school',
        title: 'Support Class and Self-Study',
        text: 'Built for classes and self-learning',
      },
      {
        icon: 'auto_awesome',
        title: 'Keep One Narrative Language',
        text: 'Consistent modules and user flow',
      },
    ],
    advantages_label: 'Key Advantages',
    advantages_items: [
      { icon: 'bolt', title: 'Fast Start', text: 'Interactive in about 3 minutes' },
      { icon: 'model_training', title: 'Task-Driven', text: 'From observation to decision steps' },
      { icon: 'query_stats', title: 'Explainable', text: 'Parameter and trajectory feedback together' },
      { icon: 'groups', title: 'Classroom Ready', text: 'Works for lecture and team discussion' },
    ],
    footer_desc: 'Dedicated to building the next generation of immersive cosmic education platforms.',
    footer_h1: 'Quick Links',
    footer_h2: 'Social Media',
    f_link1: 'Solar System',
    f_link2: 'Transfer Demo',
    f_link3: 'Laboratory',
    f_link4: 'Weibo',
    f_link5: 'Xiaohongshu',
    f_link6: 'Douyin',
    copyright: '© 2026 Interstellar Lab',
  },
}

const t = computed(() => translations[currentLang.value])

const moduleCards = computed(() => [
  {
    tag: t.value.card1_tag,
    title: t.value.card1_title,
    punchline: t.value.card1_punch,
    description: t.value.card1_desc,
    detail: t.value.card1_detail,
    points: t.value.card1_points,
    route: '/solar',
    image: '/assets/simulation/models/sys.jpg',
    icon: 'wb_sunny',
  },
  {
    tag: t.value.card2_tag,
    title: t.value.card2_title,
    punchline: t.value.card2_punch,
    description: t.value.card2_desc,
    detail: t.value.card2_detail,
    points: t.value.card2_points,
    route: '/move',
    image: '/assets/simulation/models/3.webp',
    icon: 'public',
  },
  {
    tag: t.value.card3_tag,
    title: t.value.card3_title,
    punchline: t.value.card3_punch,
    description: t.value.card3_desc,
    detail: t.value.card3_detail,
    points: t.value.card3_points,
    route: '/tls',
    image: '/assets/simulation/models/5.webp',
    icon: 'science',
  },
])

const footerQuickLinks = computed(() => [
  { label: t.value.f_link1, to: '/solar' },
  { label: t.value.f_link2, to: '/move' },
  { label: t.value.f_link3, to: '/tls' },
])
const courseMaterialsHref = '/course-materials/%E8%AF%BE%E7%A8%8B%E9%85%8D%E5%A5%97ppt.zip'

let animationFrameId = 0
let cruiseTimerId = 0
let revealObserver = null
let stars = []
let meteors = []
let mounted = false

function routeTo(path) {
  router.push(path)
}

function initCanvas() {
  const canvas = starCanvas.value
  if (!canvas) {
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  stars = []

  const starColors = [
    'hsla(260, 60%, 85%,',
    'hsla(180, 50%, 85%,',
    'hsla(45, 60%, 85%,',
    'hsla(220, 100%, 95%,',
  ]

  for (let index = 0; index < 350; index += 1) {
    const colorBase = starColors[Math.floor(Math.random() * starColors.length)]
    const speedScale = 0.002 + Math.random() * 0.012
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5,
      color: colorBase,
      blinkRate: speedScale,
      opacity: Math.random(),
      maxOpacity: 0.4 + Math.random() * 0.6,
      scaleOffset: Math.random() * 0.5,
    })
  }
}

function createMeteor(canvas) {
  if (Math.random() <= 0.998) {
    return
  }

  const angle = Math.PI / 10 + Math.random() * (Math.PI / 6)
  const speed = 2 + Math.random() * 3

  meteors.push({
    x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
    y: -100,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 120 + Math.random() * 200,
    width: 0.8 + Math.random() * 1.2,
    opacity: 0.8,
    color: 'rgba(159, 182, 199,',
  })
}

function drawCanvas() {
  const canvas = starCanvas.value
  const context = canvas?.getContext('2d')

  if (!canvas || !context || !mounted) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  stars.forEach((star) => {
    star.opacity += star.blinkRate

    if (star.opacity > star.maxOpacity || star.opacity < 0.05) {
      star.blinkRate = -star.blinkRate
    }

    const currentOpacity = Math.max(0.05, star.opacity)
    const currentSize = star.size * (0.8 + Math.abs(Math.sin(Date.now() * 0.001 + star.scaleOffset)) * 0.4)
    context.beginPath()
    context.fillStyle = `${star.color}${currentOpacity})`
    context.arc(star.x, star.y, currentSize, 0, Math.PI * 2)
    context.fill()
  })

  createMeteor(canvas)

  meteors = meteors.filter((meteor) => {
    const headX = meteor.x
    const headY = meteor.y
    const norm = Math.sqrt(meteor.vx * meteor.vx + meteor.vy * meteor.vy)
    const tailX = meteor.x - (meteor.vx / norm) * meteor.length
    const tailY = meteor.y - (meteor.vy / norm) * meteor.length
    const gradient = context.createLinearGradient(headX, headY, tailX, tailY)

    gradient.addColorStop(0, `${meteor.color}${meteor.opacity})`)
    gradient.addColorStop(0.2, `${meteor.color}${meteor.opacity * 0.3})`)
    gradient.addColorStop(1, `${meteor.color}0)`)

    context.strokeStyle = gradient
    context.lineWidth = meteor.width
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(headX, headY)
    context.lineTo(tailX, tailY)
    context.stroke()

    meteor.x += meteor.vx
    meteor.y += meteor.vy
    meteor.opacity -= 0.0015

    return meteor.opacity > 0 && meteor.y <= canvas.height + 200
  })

  animationFrameId = window.requestAnimationFrame(drawCanvas)
}

function handleScroll() {
  const scrollPos = window.scrollY
  const windowHeight = window.innerHeight
  const progress = Math.min(scrollPos / windowHeight, 1)
  const blurValue = progress * 25
  const opacityValue = 0.6 * (1 - progress)
  const contentOpacity = 1 - progress * 1.5
  const scaleValue = 1.05 + progress * 0.05

  if (heroBgImg.value) {
    heroBgImg.value.style.filter = `blur(${blurValue}px)`
    heroBgImg.value.style.opacity = `${opacityValue}`
    heroBgImg.value.style.transform = `scale(${scaleValue})`
  }

  if (heroOverlay.value) {
    heroOverlay.value.style.opacity = `${1 - progress}`
  }

  if (heroContent.value) {
    heroContent.value.style.opacity = `${Math.max(0, contentOpacity)}`
    heroContent.value.style.transform = `translateY(${progress * 50}px)`
  }
}

function observeRevealSections() {
  const sections = Array.from(rootRef.value?.querySelectorAll('.reveal-on-scroll') ?? [])

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('revealed'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
    },
  )

  sections.forEach((section) => {
    revealObserver?.observe(section)
  })
}

function spawnCruiser() {
  const container = rootRef.value

  if (!container || !mounted) {
    return
  }

  const icons = ['satellite_alt', 'rocket']
  const cruiser = document.createElement('div')
  const icon = icons[Math.floor(Math.random() * icons.length)]
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const startY = Math.random() * 100
  const endY = Math.random() * 100

  cruiser.className = 'cruise-object'
  cruiser.innerHTML = `<span class="material-symbols-outlined text-primary text-2xl">${icon}</span>`
  cruiser.style.top = `${startY}vh`

  if (side === 'left') {
    cruiser.style.left = '-50px'
  } else {
    cruiser.style.right = '-50px'
    cruiser.style.transform = 'scaleX(-1)'
  }

  container.appendChild(cruiser)

  window.setTimeout(() => {
    cruiser.style.transition = 'all 25s linear'
    cruiser.style.top = `${endY}vh`

    if (side === 'left') {
      cruiser.style.left = '110vw'
    } else {
      cruiser.style.right = '110vw'
    }
  }, 100)

  window.setTimeout(() => {
    cruiser.remove()
  }, 26000)
}

function scheduleCruiser() {
  if (!mounted) {
    return
  }

  const delay = 15000 + Math.random() * 15000
  cruiseTimerId = window.setTimeout(() => {
    spawnCruiser()
    scheduleCruiser()
  }, delay)
}

function scrollToElement(elementId) {
  const element = document.getElementById(elementId)

  if (!element) {
    return
  }

  try {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {
    element.scrollIntoView()
  }
}

function scrollToModules() {
  scrollToElement('modules-section')
}

onMounted(() => {
  mounted = true
  store.bootstrap()
  initCanvas()
  drawCanvas()
  handleScroll()
  observeRevealSections()
  scheduleCruiser()

  window.addEventListener('resize', initCanvas)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  mounted = false
  window.removeEventListener('resize', initCanvas)
  window.removeEventListener('scroll', handleScroll)
  window.cancelAnimationFrame(animationFrameId)
  window.clearTimeout(cruiseTimerId)
  revealObserver?.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="dark bg-background text-on-background font-body selection:bg-primary/30 selection:text-primary overflow-x-hidden home-html"
  >
    <canvas id="star-canvas" ref="starCanvas"></canvas>
    <div class="nebula-glow"></div>

    <SiteHeader />

    <main>
      <section class="relative h-screen flex items-center justify-center overflow-hidden w-full" id="hero-section">
        <div class="absolute inset-0 z-0" id="hero-bg-container">
          <img
            ref="heroBgImg"
            alt="Deep space nebula"
            class="w-full h-full object-cover"
            id="hero-bg-img"
            src="/assets/simulation/models/wallpaper.png"
          />
          <div ref="heroOverlay" class="absolute inset-0" style="background: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.35) 60%, transparent 100%);" id="hero-overlay"></div>
        </div>

        <div ref="heroContent" class="relative z-10 text-center max-w-3xl px-6" id="hero-content">
          <h1 class="font-headline text-3xl md:text-5xl font-bold mb-3 tracking-tighter leading-tight animate-drop-in" style="animation-delay: 0.2s;">
            <span class="galaxy-text" data-i18n="hero_title">{{ t.hero_title }}</span>
          </h1>
          <p
            class="text-on-surface-variant text-base md:text-lg mb-28 max-w-xl mx-auto leading-relaxed animate-drop-in galaxy-text"
            data-i18n="hero_subtitle"
            style="animation-delay: 0.3s;"
          >
            {{ t.hero_subtitle }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center animate-drop-in" style="animation-delay: 0.4s;">
            <button
              class="btn-interactive btn-interactive--primary px-8 py-2.5 rounded-full text-on-primary font-medium text-sm"
              data-i18n="hero_btn1"
              @click="routeTo('/solar')"
            >
              {{ t.hero_btn1 }}
            </button>
            <a
              class="btn-interactive btn-interactive--ghost px-8 py-2.5 rounded-full font-medium text-sm"
              data-i18n="hero_btn2"
              :href="courseMaterialsHref"
              download
            >
              {{ t.hero_btn2 }}
            </a>
          </div>
        </div>

        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <button
            class="scroll-indicator-btn flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20"
            id="scroll-to-modules"
            @click="scrollToModules"
          >
            <span class="material-symbols-outlined text-3xl">keyboard_double_arrow_down</span>
          </button>
        </div>
      </section>

      <section class="relative min-h-screen w-full flex flex-col justify-center overflow-hidden py-24 md:py-28" id="modules-section">
        <div class="max-w-[1400px] mx-auto px-6 md:px-8 w-full reveal-on-scroll">
          <div class="mb-12">
            <div class="max-w-3xl">
              <h2 class="font-headline text-4xl font-bold mb-4 galaxy-text" data-i18n="module_title">{{ t.module_title }}</h2>
              <p class="text-on-surface-variant leading-8 text-base md:text-lg" data-i18n="module_subtitle">{{ t.module_subtitle }}</p>
            </div>
          </div>

          <div class="module-spotlight-list">
            <article
              v-for="(card, index) in moduleCards"
              :key="card.route"
              class="feature-strip group"
              :class="{ 'feature-strip--reverse': index % 2 === 1 }"
            >
              <div class="feature-strip__media">
                <img
                  :alt="card.title"
                  class="feature-strip__image"
                  :src="card.image"
                />
                <div class="feature-strip__image-mask"></div>
                <div class="feature-strip__badge">
                  <span class="feature-strip__badge-icon">
                    <span class="material-symbols-outlined text-primary" data-weight="fill">{{ card.icon }}</span>
                  </span>
                  <span class="feature-strip__badge-tag">{{ card.tag }}</span>
                </div>
                <span class="feature-strip__index">0{{ index + 1 }}</span>
              </div>

              <div class="feature-strip__content">
                <h3 class="feature-strip__title">{{ card.title }}</h3>
                <p class="feature-strip__punch">{{ card.punchline }}</p>

                <div class="feature-strip__chips">
                  <div
                    v-for="point in card.points"
                    :key="`${card.route}-${point.text}`"
                    class="feature-strip__chip"
                  >
                    <span class="material-symbols-outlined text-primary text-[19px]">{{ point.icon }}</span>
                    <p>{{ point.text }}</p>
                  </div>
                </div>

                <div>
                  <button
                    class="feature-strip__cta btn-interactive btn-interactive--soft"
                    @click="routeTo(card.route)"
                  >
                    <span>{{ t.card_btn }}</span>
                    <span class="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-[#0c0e18] w-full py-12 px-8 border-t border-slate-800/20 reveal-on-scroll">
      <div class="max-w-[1920px] mx-auto">
        <div class="flex flex-col md:flex-row justify-between gap-12">
          <div class="max-w-md">
            <span class="text-2xl font-bold galaxy-text mb-6 block font-headline" data-i18n="brand">{{ t.brand }}</span>
            <p class="text-slate-500 text-base leading-relaxed mb-8 font-body" data-i18n="footer_desc">{{ t.footer_desc }}</p>
            <div class="flex gap-4">
              <RouterLink class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary" to="/solar">
                <span class="material-symbols-outlined text-[22px]">public</span>
              </RouterLink>
              <RouterLink class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary" to="/move">
                <span class="material-symbols-outlined text-[22px]">rocket_launch</span>
              </RouterLink>
              <RouterLink class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary" to="/tls">
                <span class="material-symbols-outlined text-[22px]">science</span>
              </RouterLink>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-16">
            <div>
              <h5 class="text-white font-bold mb-8 text-sm uppercase tracking-widest font-headline" data-i18n="footer_h1">{{ t.footer_h1 }}</h5>
              <ul class="space-y-4 text-sm font-body">
                <li v-for="item in footerQuickLinks" :key="item.to">
                  <RouterLink class="text-slate-400 hover:text-primary transition-all" :to="item.to">{{ item.label }}</RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="pt-10 mt-16 border-t border-slate-800/30">
          <span class="text-slate-500 text-sm font-body block text-center md:text-left" data-i18n="copyright">{{ t.copyright }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@keyframes dropIn {
  0% {
    opacity: 0;
    transform: translateY(-60px);
    filter: blur(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes galaxyFlowHorizontal {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: -100% 50%;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-150%) skewX(-25deg);
  }

  100% {
    transform: translateX(150%) skewX(-25deg);
  }
}

@keyframes scrollPulse {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }

  50% {
    transform: translateY(8px);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
}

.animate-drop-in {
  opacity: 0;
  animation: dropIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(60px);
  transition:
    opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
    transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.reveal-on-scroll.revealed {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.galaxy-text {
  background: linear-gradient(90deg, #f8fafc 0%, #c4d3dd 48%, #8aa4b5 100%);
  background-size: 100% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  text-shadow: 0 0 10px rgba(159, 182, 199, 0.12);
}

.home-html,
.scene-html {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  isolation: isolate;
}

.home-html > header,
.home-html > main,
.home-html > footer,
.scene-html > header,
.scene-html > main {
  position: relative;
  z-index: 2;
}

#star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 1;
}

.nebula-glow {
  position: fixed;
  width: 100vw;
  height: 100vh;
  height: 100svh;
  background:
    radial-gradient(circle at 70% 30%, rgba(111, 134, 152, 0.1), transparent 60%),
    radial-gradient(circle at 20% 70%, rgba(159, 182, 199, 0.1), transparent 60%);
  filter: blur(84px);
  z-index: 0;
}

.btn-interactive {
  position: relative;
  border: 1px solid transparent;
  overflow: hidden;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease,
    filter 0.24s ease;
}

.btn-interactive--primary {
  color: #f6f8ff;
  background:
    linear-gradient(135deg, rgba(125, 154, 176, 0.96) 0%, rgba(102, 133, 156, 0.94) 100%),
    radial-gradient(circle at 14% -30%, rgba(255, 255, 255, 0.2), transparent 42%);
  border-color: rgba(181, 198, 210, 0.24);
  box-shadow:
    0 12px 28px rgba(25, 37, 49, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-interactive--ghost {
  color: rgba(237, 243, 255, 0.95);
  background:
    linear-gradient(180deg, rgba(20, 28, 38, 0.7) 0%, rgba(14, 21, 31, 0.62) 100%),
    radial-gradient(circle at 50% -70%, rgba(170, 190, 204, 0.24), transparent 58%);
  border-color: rgba(161, 181, 195, 0.24);
  box-shadow:
    0 10px 24px rgba(8, 12, 30, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.btn-interactive--soft {
  border-color: rgba(161, 181, 195, 0.2);
}

.btn-interactive::after {
  content: '';
  position: absolute;
  top: -120%;
  left: -20%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), transparent 58%);
  transform: rotate(12deg);
  opacity: 0.26;
  pointer-events: none;
}

.btn-interactive:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(24, 36, 48, 0.4);
}

.scroll-indicator-btn {
  animation: scrollPulse 2.4s ease-in-out infinite;
  transition:
    transform 0.3s ease,
    background-color 0.3s ease,
    opacity 0.4s ease,
    filter 0.4s ease,
    border-color 0.3s ease;
  border-color: rgba(161, 181, 195, 0.3);
  background: rgba(18, 25, 34, 0.56);
}

.scroll-indicator-btn:hover {
  animation-play-state: paused;
  transform: scale(1.1);
}

.cruise-object {
  position: fixed;
  pointer-events: none;
  z-index: -1;
  filter: drop-shadow(0 0 8px rgba(159, 182, 199, 0.42));
  opacity: 0.4;
  transition: opacity 1s;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
  vertical-align: middle;
}

.module-spotlight-list {
  margin-top: 12px;
  display: grid;
  gap: 22px;
}

.feature-strip {
  position: relative;
  display: grid;
  grid-template-columns: minmax(360px, 1.15fr) minmax(0, 1fr);
  align-items: stretch;
  min-height: 500px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(162, 178, 232, 0.14);
  background:
    radial-gradient(circle at 65% 20%, rgba(159, 182, 199, 0.13), transparent 48%),
    linear-gradient(180deg, rgba(11, 16, 35, 0.68) 0%, rgba(8, 12, 26, 0.5) 100%);
  box-shadow:
    0 22px 52px rgba(3, 8, 23, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.feature-strip--reverse .feature-strip__media {
  order: 2;
}

.feature-strip--reverse .feature-strip__content {
  order: 1;
}

.feature-strip__media {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  margin: 0;
  border-radius: 0;
}

.feature-strip--reverse .feature-strip__media {
  margin: 0;
}

.feature-strip__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
  transform: scale(1.01);
  transition: transform 0.7s ease;
}

.feature-strip:hover .feature-strip__image {
  transform: scale(1.06);
}

.feature-strip--reverse .feature-strip__image {
  object-position: right center;
}

.feature-strip__image-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(2, 6, 16, 0.28) 0%, rgba(4, 7, 18, 0) 50%, rgba(4, 7, 18, 0.58) 100%);
}

.feature-strip--reverse .feature-strip__image-mask {
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.12) 0%, rgba(4, 7, 18, 0) 54%, rgba(4, 7, 18, 0.46) 100%);
}

.feature-strip__badge {
  position: absolute;
  left: 24px;
  top: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-strip__badge-icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(14, 21, 40, 0.66);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(187, 201, 255, 0.18);
}

.feature-strip__badge-tag {
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 0.15em;
  font-size: 0.84rem;
  text-transform: uppercase;
  color: rgba(236, 233, 255, 0.96);
}

.feature-strip__index {
  position: absolute;
  left: 24px;
  bottom: 22px;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 0.18em;
  color: rgba(232, 240, 255, 0.78);
  font-size: 0.95rem;
}

.feature-strip__content {
  position: relative;
  padding: clamp(34px, 4vw, 58px) clamp(24px, 3.6vw, 52px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 700px;
}

.feature-strip__title {
  margin: 0;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2.3rem, 4.4vw, 4.2rem);
  line-height: 0.94;
  letter-spacing: 0;
  color: #fff;
}

.feature-strip__punch {
  margin: 16px 0 0;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: 0;
  color: rgba(226, 236, 252, 0.95);
  max-width: 30ch;
}

.feature-strip__chips {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.feature-strip__chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(177, 191, 240, 0.16);
  background: rgba(20, 31, 62, 0.5);
  color: rgba(233, 241, 255, 0.9);
}

.feature-strip__chip p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1;
}

.feature-strip__cta {
  margin-top: 22px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(159, 182, 199, 0.2);
  color: #eef1ff;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: 0 12px 28px rgba(16, 15, 39, 0.3);
}

.value-showcase {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(28px, 4vw, 48px);
  align-items: start;
}

.value-orbit-wrap {
  display: flex;
  justify-content: center;
}

.value-orbit {
  --size-w: min(90vw, 780px);
  --size-h: min(66vw, 600px);
  position: relative;
  width: var(--size-w);
  height: var(--size-h);
  border-radius: 50% / 44%;
  background:
    radial-gradient(circle at center, rgba(17, 27, 52, 0.92) 0%, rgba(9, 16, 31, 0.86) 58%, rgba(5, 10, 22, 0.2) 100%),
    radial-gradient(circle at 30% 25%, rgba(137, 173, 196, 0.26), transparent 45%);
  box-shadow:
    0 26px 70px rgba(3, 7, 20, 0.46),
    inset 0 0 60px rgba(150, 176, 255, 0.1);
}

.value-orbit::before,
.value-orbit::after {
  content: '';
  position: absolute;
  inset: 10% 12%;
  border-radius: 50% / 44%;
  border: 1px solid rgba(170, 191, 255, 0.14);
  pointer-events: none;
}

.value-orbit::after {
  inset: 24% 24%;
  border-color: rgba(170, 191, 255, 0.1);
}

.value-disc {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 54%;
  min-width: 180px;
  height: 56%;
  border-radius: 50% / 44%;
  background: radial-gradient(circle at 30% 25%, rgba(192, 210, 255, 0.24), rgba(13, 23, 45, 0.95));
  display: grid;
  place-items: center;
  text-align: center;
  padding: 18px;
  box-shadow: inset 0 0 35px rgba(176, 196, 255, 0.25);
}

.value-disc__icon {
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  color: #c8d9ff;
}

.value-disc h4 {
  margin: 6px 0 2px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.1rem, 1.6vw, 1.45rem);
  letter-spacing: 0.05em;
}

.value-disc p {
  margin: 0;
  font-size: 0.83rem;
  color: rgba(221, 233, 255, 0.84);
  line-height: 1.4;
}

.value-node {
  position: absolute;
  width: min(210px, 29vw);
  text-align: center;
  padding: 8px 10px;
  border-radius: 16px;
  background: rgba(11, 18, 34, 0.46);
  border: 1px solid rgba(164, 180, 236, 0.12);
  box-shadow: 0 14px 28px rgba(5, 9, 21, 0.24);
}

.value-node:nth-of-type(1) {
  top: 4%;
  left: 50%;
  transform: translateX(-50%);
}

.value-node:nth-of-type(2) {
  top: 50%;
  right: 3%;
  transform: translateY(-50%);
}

.value-node:nth-of-type(3) {
  bottom: 4%;
  left: 50%;
  transform: translateX(-50%);
}

.value-node:nth-of-type(4) {
  top: 50%;
  left: 3%;
  transform: translateY(-50%);
}

.value-node__icon {
  width: 42px;
  height: 42px;
  margin: 0 auto 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #d5e3ff;
  background: rgba(23, 34, 60, 0.8);
  box-shadow: 0 10px 20px rgba(7, 11, 24, 0.38);
}

.value-node__icon .material-symbols-outlined {
  font-size: 1.2rem;
}

.value-node h5 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: #f0f5ff;
}

.value-node p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.35;
  color: rgba(214, 225, 246, 0.85);
}

.advantage-panel {
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 0;
}

.advantage-panel__title {
  margin: 0 0 16px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  letter-spacing: 0.04em;
  color: #f2f6ff;
}

.advantage-panel__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.advantage-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  padding: 16px 14px;
  border-radius: 18px;
  border: 1px solid rgba(166, 182, 241, 0.16);
  background:
    linear-gradient(180deg, rgba(18, 27, 51, 0.64) 0%, rgba(14, 22, 43, 0.44) 100%),
    radial-gradient(circle at 12% -50%, rgba(170, 164, 255, 0.22), transparent 46%);
  box-shadow: 0 16px 34px rgba(5, 10, 25, 0.24);
}

.advantage-item__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(149, 172, 188, 0.2);
  color: #cfccff;
}

.advantage-item h5 {
  margin: 0;
  font-size: 1rem;
  color: #f2f6ff;
}

.advantage-item p {
  margin: 2px 0 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: rgba(212, 223, 246, 0.84);
}

@media (max-width: 1080px) {
  .feature-strip {
    grid-template-columns: 1fr;
    min-height: initial;
  }

  .feature-strip--reverse .feature-strip__media,
  .feature-strip--reverse .feature-strip__content {
    order: initial;
  }

  .feature-strip__media {
    min-height: 340px;
    margin: 0;
    border-radius: 0;
  }

  .feature-strip__image,
  .feature-strip--reverse .feature-strip__image {
    object-position: center;
  }

  .feature-strip__content {
    padding: 28px 20px 36px;
  }

  .feature-strip__title {
    font-size: clamp(2rem, 8vw, 3.3rem);
  }

  .value-orbit {
    --size-w: min(94vw, 700px);
    --size-h: min(74vw, 520px);
  }

  .advantage-panel__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 720px) {
  .feature-strip__media {
    min-height: 280px;
    border-radius: 18px;
  }

  .feature-strip__badge {
    left: 14px;
    top: 14px;
  }

  .feature-strip__index {
    left: 14px;
    bottom: 12px;
  }

  .feature-strip__punch {
    max-width: none;
  }

  .feature-strip__chips {
    gap: 8px;
  }

  .value-orbit {
    width: 100%;
    aspect-ratio: auto;
    border-radius: 18px;
    padding: 0;
    background:
      radial-gradient(circle at center, rgba(17, 27, 52, 0.72) 0%, rgba(9, 16, 31, 0.62) 58%, rgba(5, 10, 22, 0.2) 100%),
      radial-gradient(circle at 30% 25%, rgba(137, 173, 196, 0.22), transparent 45%);
    box-shadow: 0 18px 36px rgba(4, 8, 22, 0.24);
  }

  .value-orbit::before,
  .value-orbit::after {
    display: none;
  }

  .value-disc {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    min-width: 0;
    aspect-ratio: auto;
    border-radius: 14px;
    justify-items: start;
    text-align: left;
    gap: 4px;
    padding: 0 0 8px;
    background: rgba(11, 18, 34, 0.5);
    box-shadow: none;
    margin-bottom: 10px;
  }

  .value-node {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    transform: none;
    display: flex;
    align-items: center;
    text-align: left;
    gap: 10px;
    background: rgba(11, 18, 34, 0.45);
    border-radius: 14px;
    padding: 10px 10px;
    border: 1px solid rgba(164, 180, 236, 0.12);
    margin-bottom: 8px;
  }

  .value-node + .value-node {
    border-top: 1px solid rgba(170, 191, 255, 0.14);
  }

  .value-node__icon {
    margin: 0;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
  }

  .value-node h5 {
    margin-bottom: 2px;
  }

  .advantage-panel__list {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

html {
  scroll-behavior: smooth;
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

.home-html,
.scene-html {
  color: #171717;
  background: #fafafa;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
}

.home-html.dark,
.scene-html.dark {
  background: #fafafa !important;
  color: #171717 !important;
}

.home-html::selection,
.scene-html::selection {
  color: #f2f2f2;
  background: #171717;
}

#star-canvas,
.cruise-object {
  display: none;
}

.nebula-glow {
  position: fixed;
  inset: 0;
  width: auto;
  height: auto;
  z-index: 0;
  opacity: 0.72;
  filter: blur(20px);
  background:
    conic-gradient(from 210deg at 50% 18%, #007cf0 0deg, #00dfd8 54deg, #7928ca 132deg, #ff0080 196deg, #ff4d4d 252deg, #f9cb28 312deg, #007cf0 360deg);
  -webkit-mask-image: linear-gradient(to bottom, black 0, rgba(0, 0, 0, 0.78) 24%, transparent 62%);
  mask-image: linear-gradient(to bottom, black 0, rgba(0, 0, 0, 0.78) 24%, transparent 62%);
}

#hero-section {
  min-height: 92vh;
  background:
    linear-gradient(180deg, rgba(250, 250, 250, 0.08), #fafafa 88%),
    conic-gradient(from 210deg at 50% 34%, #007cf0 0deg, #00dfd8 58deg, #7928ca 130deg, #ff0080 194deg, #ff4d4d 256deg, #f9cb28 314deg, #007cf0 360deg);
}

#hero-bg-container {
  display: none;
}

#hero-content {
  color: #171717;
  max-width: 760px;
  margin-top: 28px;
}

#hero-content h1,
#modules-section h2,
#product-desc-section h2 {
  color: #171717;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

#hero-content h1 {
  font-size: clamp(3rem, 7vw, 5.9rem);
  line-height: 0.95;
}

#hero-content p,
#modules-section > div > div:first-child p,
#product-desc-section > div > div:first-child p {
  color: #4d4d4d;
  font-size: clamp(1rem, 1.55vw, 1.18rem);
  line-height: 1.65;
}

.galaxy-text {
  display: inline;
  color: inherit;
  background: none;
  text-shadow: none;
}

.animate-drop-in {
  animation-duration: 0.7s;
}

.btn-interactive {
  min-height: 48px;
  border-radius: 100px !important;
  border: 1px solid #171717;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.04),
    0 8px 16px -10px rgba(0, 0, 0, 0.18);
  font-weight: 500 !important;
  letter-spacing: 0;
}

.btn-interactive::after {
  display: none;
}

.btn-interactive--primary,
.btn-interactive--soft {
  color: #fff !important;
  background: #171717 !important;
}

.btn-interactive--ghost {
  color: #171717 !important;
  background: #fff !important;
  border-color: #ebebeb;
}

.btn-interactive:hover {
  filter: none;
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.04),
    0 8px 16px -8px rgba(0, 0, 0, 0.16);
}

.scroll-indicator-btn {
  color: #171717 !important;
  background: #fff !important;
  border-color: #ebebeb !important;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

#modules-section,
#product-desc-section {
  min-height: auto;
  padding-top: clamp(72px, 9vw, 120px);
  padding-bottom: clamp(72px, 9vw, 120px);
  background: #fafafa;
}

#modules-section > div > div:first-child,
#product-desc-section > div > div:first-child {
  text-align: left;
  margin-bottom: 32px;
}

#modules-section h2,
#product-desc-section h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
}

.module-spotlight-list {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-strip,
.feature-strip--reverse {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #ebebeb;
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.02),
    0 1px 1px rgba(0, 0, 0, 0.04),
    0 8px 16px -12px rgba(0, 0, 0, 0.18);
}

.feature-strip--reverse .feature-strip__media,
.feature-strip--reverse .feature-strip__content {
  order: initial;
}

.feature-strip__media {
  min-height: 0;
  height: auto;
  aspect-ratio: 16 / 10;
  background: #f5f5f5;
  border-bottom: 1px solid #ebebeb;
}

.feature-strip__image {
  opacity: 0.9;
  filter: saturate(0.78) contrast(1.04);
}

.feature-strip__image-mask {
  background: linear-gradient(180deg, transparent 42%, rgba(0, 0, 0, 0.58) 100%);
}

.feature-strip__badge {
  left: 16px;
  top: 16px;
  gap: 8px;
}

.feature-strip__badge-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border-color: rgba(255, 255, 255, 0.64);
  background: rgba(255, 255, 255, 0.9);
  color: #171717;
}

.feature-strip__badge-icon .material-symbols-outlined {
  color: #171717 !important;
}

.feature-strip__badge-tag,
.feature-strip__index {
  color: #fff;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.72rem;
  letter-spacing: 0;
  text-transform: none;
}

.feature-strip__index {
  left: 16px;
  bottom: 14px;
}

.feature-strip__content {
  padding: 24px;
  color: #171717;
}

.feature-strip__title {
  color: #171717;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  font-size: clamp(1.35rem, 2vw, 1.65rem);
  font-weight: 600;
  line-height: 1.18;
  letter-spacing: 0;
}

.feature-strip__punch {
  margin-top: 10px;
  max-width: none;
  color: #4d4d4d;
  font-size: 0.98rem;
  line-height: 1.6;
  font-weight: 400;
}

.feature-strip__chips {
  margin-top: 18px;
  display: grid;
  gap: 8px;
}

.feature-strip__chip {
  border: 1px solid #ebebeb;
  border-radius: 8px;
  background: #fafafa;
  color: #4d4d4d;
  padding: 9px 10px;
}

.feature-strip__chip .material-symbols-outlined {
  color: #0070f3 !important;
}

.feature-strip__cta {
  margin-top: 22px;
  padding: 0 18px;
  min-height: 42px;
  box-shadow: none;
}

.value-showcase {
  grid-template-columns: 1fr;
}

.value-orbit {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  padding: 1px;
  background: #ebebeb;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.02),
    0 1px 1px rgba(0, 0, 0, 0.04);
}

.value-orbit::before,
.value-orbit::after {
  display: none;
}

.value-disc,
.value-node {
  position: static !important;
  transform: none !important;
  width: auto;
  min-width: 0;
  height: auto;
  border-radius: 11px;
  border: 0;
  background: #fff;
  box-shadow: none;
  text-align: left;
  padding: 20px;
}

.value-disc {
  display: block;
}

.value-disc__icon,
.value-node__icon,
.advantage-item__icon {
  color: #171717;
  background: #f5f5f5;
  box-shadow: inset 0 0 0 1px #ebebeb;
}

.value-disc h4,
.value-node h5,
.advantage-panel__title,
.advantage-item h5 {
  color: #171717;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  font-weight: 600;
  letter-spacing: 0;
}

.value-disc p,
.value-node p,
.advantage-item p {
  color: #4d4d4d;
}

.advantage-panel {
  margin-top: 18px;
}

.advantage-panel__title {
  font-size: 1.5rem;
}

.advantage-item {
  border-radius: 12px;
  border: 1px solid #ebebeb;
  background: #fff;
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.04),
    0 8px 16px -12px rgba(0, 0, 0, 0.16);
}

footer.bg-\[\#0c0e18\] {
  background: #fff !important;
  border-top: 1px solid #ebebeb !important;
  color: #171717;
}

footer .galaxy-text,
footer h5 {
  color: #171717 !important;
}

footer p,
footer span,
footer a {
  color: #4d4d4d !important;
}

footer a:hover {
  color: #0070f3 !important;
}

.scene-html {
  background:
    linear-gradient(180deg, rgba(250, 250, 250, 0.16), #fafafa 440px),
    conic-gradient(from 220deg at 50% 0%, rgba(0, 124, 240, 0.45), rgba(0, 223, 216, 0.34), rgba(121, 40, 202, 0.34), rgba(255, 0, 128, 0.3), rgba(249, 203, 40, 0.35), rgba(0, 124, 240, 0.45));
}

.scene-html .glass-feature-card,
.scene-html .lesson-flow-step,
.scene-html .lesson-guide-meta {
  background: #fff !important;
  border-color: #ebebeb !important;
  color: #171717 !important;
  box-shadow: var(--shadow);
}

.scene-html :is(.galaxy-text, h1, h2, h3, h4, p, li, figcaption) {
  color: inherit;
  background: none;
  text-shadow: none;
}

.scene-html :is(.lesson-guide-head__eyebrow, .lesson-flow-step__index) {
  color: #0070f3;
  font-family: var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0;
}

.scene-html :is(.lesson-guide-head__title, .lesson-flow-step__title) {
  color: #171717;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  letter-spacing: 0;
}

.scene-html :is(.lesson-guide-head__subtitle, .lesson-guide-meta__outcomes, .lesson-flow-step__objective, .lesson-flow-step__block p, .lesson-flow-step__points, .lesson-flow-step__caption) {
  color: #4d4d4d;
}

@media (max-width: 1080px) {
  .module-spotlight-list {
    grid-template-columns: 1fr;
  }

  .feature-strip {
    display: grid;
    grid-template-columns: minmax(260px, 0.95fr) minmax(0, 1fr);
  }

  .value-orbit,
  .advantage-panel__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  #hero-section {
    min-height: 88vh;
    padding-top: 72px;
  }

  #hero-content h1 {
    font-size: clamp(2.7rem, 15vw, 4.6rem);
  }

  .feature-strip {
    display: flex;
  }

  .feature-strip__media {
    border-radius: 0;
  }

  .value-orbit,
  .advantage-panel__list {
    grid-template-columns: 1fr;
  }
}

/* Apple-inspired dark gallery pass. Keep this block last so it overrides the previous visual experiment. */
.home-html,
.scene-html,
.home-html.dark,
.scene-html.dark {
  color: #fff !important;
  background: #000 !important;
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
}

.home-html::selection,
.scene-html::selection {
  color: #fff;
  background: #0066cc;
}

#star-canvas,
.nebula-glow,
.cruise-object {
  display: none !important;
}

#hero-section {
  min-height: 100vh;
  background: #000 !important;
}

#hero-bg-container {
  display: block !important;
}

#hero-bg-img {
  opacity: 0.46 !important;
  filter: none !important;
  transform: scale(1.02) !important;
}

#hero-overlay {
  opacity: 1 !important;
  background: rgba(0, 0, 0, 0.48) !important;
}

#hero-content {
  color: #fff;
  max-width: 840px;
  margin-top: 0;
}

#hero-content h1,
#modules-section h2,
#product-desc-section h2 {
  color: #fff;
  font-family: var(--font-display, system-ui, -apple-system, sans-serif);
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

#hero-content h1 {
  font-size: clamp(3rem, 7vw, 5.8rem);
  line-height: 1.04;
}

#hero-content p,
#modules-section > div > div:first-child p,
#product-desc-section > div > div:first-child p {
  color: #cccccc;
  font-size: clamp(1.15rem, 2.2vw, 1.75rem);
  line-height: 1.28;
  font-weight: 400;
}

.galaxy-text {
  color: inherit;
  background: none;
  text-shadow: none;
}

.btn-interactive {
  min-height: 44px;
  border-radius: 9999px !important;
  border: 1px solid #0066cc;
  background: transparent;
  box-shadow: none;
  font-size: 1.0625rem;
  font-weight: 400 !important;
  letter-spacing: 0;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.btn-interactive::after {
  display: none;
}

.btn-interactive--primary,
.btn-interactive--soft {
  color: #fff !important;
  background: #0066cc !important;
  border-color: #0066cc !important;
}

.btn-interactive--ghost {
  color: #2997ff !important;
  background: transparent !important;
  border-color: #2997ff !important;
}

.btn-interactive:active,
.site-chip:active,
.site-icon-btn:active,
.scroll-indicator-btn:active {
  transform: scale(0.95);
}

.btn-interactive:hover {
  filter: none;
  transform: translateY(-1px);
  box-shadow: none;
}

.scroll-indicator-btn {
  color: #1d1d1f !important;
  background: rgba(210, 210, 215, 0.68) !important;
  border-color: transparent !important;
  box-shadow: none !important;
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

#modules-section,
#product-desc-section {
  min-height: auto;
  padding-top: 80px;
  padding-bottom: 80px;
  background: #1d1d1f !important;
}

#product-desc-section {
  background: #000 !important;
}

#modules-section > div,
#product-desc-section > div {
  max-width: 1440px;
}

#modules-section > div > div:first-child,
#product-desc-section > div > div:first-child {
  text-align: center;
  margin: 0 auto 48px;
  max-width: 860px;
}

#modules-section h2,
#product-desc-section h2 {
  font-size: clamp(2.4rem, 4.8vw, 4rem);
  line-height: 1.1;
}

.module-spotlight-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.feature-strip,
.feature-strip--reverse {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  min-height: min(760px, 82vh);
  border: 0;
  border-radius: 0;
  background: #272729;
  box-shadow: none;
}

.feature-strip:nth-child(2) {
  background: #2a2a2c;
}

.feature-strip:nth-child(3) {
  background: #252527;
}

.feature-strip--reverse .feature-strip__media {
  order: 2;
}

.feature-strip--reverse .feature-strip__content {
  order: 1;
}

.feature-strip__media {
  min-height: 0;
  height: 100%;
  aspect-ratio: auto;
  border: 0;
  background: #000;
}

.feature-strip__image {
  opacity: 0.92;
  filter: none;
  transform: scale(1);
}

.feature-strip:hover .feature-strip__image {
  transform: scale(1.025);
}

.feature-strip__image-mask {
  background: rgba(0, 0, 0, 0.22);
}

.feature-strip__badge {
  left: 32px;
  top: 32px;
  gap: 10px;
}

.feature-strip__badge-icon {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(210, 210, 215, 0.64);
  color: #1d1d1f;
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.feature-strip__badge-icon .material-symbols-outlined {
  color: #1d1d1f !important;
}

.feature-strip__badge-tag,
.feature-strip__index {
  color: rgba(255, 255, 255, 0.86);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  font-size: 0.875rem;
  letter-spacing: 0;
  text-transform: none;
}

.feature-strip__index {
  left: 32px;
  bottom: 28px;
}

.feature-strip__content {
  display: flex;
  justify-content: center;
  padding: clamp(48px, 7vw, 96px);
  color: #fff;
  max-width: none;
  text-align: center;
}

.feature-strip__title {
  color: #fff;
  font-family: var(--font-display, system-ui, -apple-system, sans-serif);
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: 0;
}

.feature-strip__punch {
  margin: 14px auto 0;
  max-width: 24ch;
  color: #cccccc;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  line-height: 1.18;
  font-weight: 400;
}

.feature-strip__chips {
  margin: 28px auto 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 560px;
}

.feature-strip__chip {
  border: 0;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cccccc;
  padding: 9px 14px;
}

.feature-strip__chip .material-symbols-outlined {
  color: #2997ff !important;
}

.feature-strip__cta {
  margin-top: 28px;
  min-height: 44px;
  padding: 0 22px;
  color: #fff;
  background: #0066cc !important;
  border-color: #0066cc;
}

.value-showcase {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.value-orbit {
  width: 100%;
  height: auto;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.value-orbit::before,
.value-orbit::after {
  display: none;
}

.value-disc,
.value-node {
  position: static !important;
  transform: none !important;
  width: auto;
  min-width: 0;
  height: auto;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #272729;
  box-shadow: none;
  text-align: left;
}

.value-disc {
  display: block;
}

.value-disc__icon,
.value-node__icon,
.advantage-item__icon {
  color: #1d1d1f;
  background: rgba(210, 210, 215, 0.64);
  box-shadow: none;
}

.value-disc h4,
.value-node h5,
.advantage-panel__title,
.advantage-item h5 {
  color: #fff;
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  font-weight: 600;
  letter-spacing: 0;
}

.value-disc p,
.value-node p,
.advantage-item p {
  color: #cccccc;
  font-size: 1rem;
  line-height: 1.47;
}

.advantage-panel {
  width: 100%;
  margin-top: 32px;
}

.advantage-panel__title {
  margin-bottom: 20px;
  text-align: center;
  font-size: clamp(2rem, 3vw, 2.5rem);
}

.advantage-panel__list {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.advantage-item {
  padding: 24px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #272729;
  box-shadow: none;
}

footer.bg-\[\#0c0e18\] {
  background: #1d1d1f !important;
  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #cccccc;
}

footer .galaxy-text,
footer h5 {
  color: #fff !important;
}

footer p,
footer span,
footer a {
  color: #cccccc !important;
}

footer a:hover {
  color: #2997ff !important;
}

.scene-html {
  background: #000 !important;
}

.scene-html #star-canvas,
.scene-html .nebula-glow {
  display: none !important;
}

.scene-html :is(.glass-feature-card, .lesson-flow-step, .lesson-guide-meta) {
  background: #272729 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  box-shadow: none;
  border-radius: 18px;
}

.scene-html :is(.galaxy-text, h1, h2, h3, h4, p, li, figcaption) {
  color: inherit;
  background: none;
  text-shadow: none;
}

.scene-html :is(.lesson-guide-head__eyebrow, .lesson-flow-step__index) {
  color: #2997ff;
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  letter-spacing: 0;
}

.scene-html :is(.lesson-guide-head__title, .lesson-flow-step__title) {
  color: #fff;
  font-family: var(--font-display, system-ui, -apple-system, sans-serif);
  letter-spacing: 0;
}

.scene-html :is(.lesson-guide-head__subtitle, .lesson-guide-meta__outcomes, .lesson-flow-step__objective, .lesson-flow-step__block p, .lesson-flow-step__points, .lesson-flow-step__caption) {
  color: #cccccc;
}

@media (max-width: 1080px) {
  .feature-strip,
  .feature-strip--reverse {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .feature-strip--reverse .feature-strip__media,
  .feature-strip--reverse .feature-strip__content {
    order: initial;
  }

  .feature-strip__media {
    aspect-ratio: 16 / 9;
  }

  .value-orbit,
  .advantage-panel__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  #hero-section {
    min-height: 92vh;
    padding-top: 44px;
  }

  #hero-content h1 {
    font-size: clamp(2.6rem, 12vw, 4rem);
  }

  #hero-content p {
    font-size: 1.15rem;
    line-height: 1.35;
  }

  .feature-strip__content {
    padding: 44px 22px 56px;
  }

  .feature-strip__chips,
  .value-orbit,
  .advantage-panel__list {
    grid-template-columns: 1fr;
  }
}

/* Readability pass: wallpaper backdrop with top-black gradient. */
#hero-section {
  background: #000 !important;
}

#hero-section::before {
  display: none;
}

#hero-bg-img {
  opacity: 1 !important;
  object-position: center center;
  filter: none !important;
}

#hero-overlay {
  /* inline style controls the gradient */
}

#hero-content {
  width: min(92vw, 800px);
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(14px, 1.6vw, 22px);
}

#hero-content h1 {
  margin-bottom: 0 !important;
}

#hero-content p {
  margin-bottom: 0 !important;
  line-height: 1.5 !important;
}

#hero-content > div {
  gap: 12px !important;
}

@media (min-width: 960px) {
  #hero-content h1 {
    white-space: nowrap;
    font-size: clamp(3rem, 5.5vw, 5rem);
    line-height: 1.08;
  }

  #hero-content p {
    max-width: none;
    white-space: nowrap;
    font-size: clamp(1.1rem, 1.6vw, 1.4rem);
    line-height: 1.5 !important;
  }

  .feature-strip__title,
  .feature-strip__punch,
  .value-node h5,
  .advantage-item h5 {
    white-space: nowrap;
  }

  .feature-strip__punch {
    max-width: none;
  }

  .feature-strip__chips {
    flex-wrap: nowrap;
  }

  .feature-strip__chip p {
    white-space: nowrap;
  }
}

/* CTA spacing. */
.home-html .animate-drop-in:has(.btn-interactive),
.scene-html .animate-drop-in:has(.btn-interactive) {
  margin-top: 0 !important;
}


.feature-strip__cta {
  margin-top: clamp(42px, 4vw, 68px) !important;
}

.scene-html .btn-interactive {
  margin-top: clamp(10px, 1.4vw, 20px);
}

</style>
