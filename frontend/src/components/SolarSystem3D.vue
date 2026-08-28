<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { useAmbientAudio } from '@/composables/useAmbientAudio'
import SiteHeader from '@/components/SiteHeader.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  backgroundImage: {
    type: String,
    required: true,
  },
  openLabel: {
    type: String,
    default: 'Enter Module',
  },
  lessonGuide: {
    type: Object,
    default: null,
  },
  /** 是否在全屏内打开场景（默认是，不新开窗口） */
  fullscreen: {
    type: Boolean,
    default: true,
  },
})

const rootRef = ref(null)
const starCanvas = ref(null)
const heroBgImg = ref(null)
const heroOverlay = ref(null)
const heroContent = ref(null)
const { currentLang } = useSiteChrome()

useAmbientAudio('/assets/audio/showpage.wav', { volume: 0.3 })

let revealObserver = null
let stars = []
let animationFrameId = 0
let lastFrameTime = 0
let mounted = false
let scrollFrame = 0

function initCanvas() {
  const canvas = starCanvas.value
  const context = canvas?.getContext('2d')
  if (!canvas) {
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  stars = []

  const starColors = [
    'hsla(200, 55%, 86%,',
    'hsla(35, 68%, 85%,',
    'hsla(45, 60%, 85%,',
    'hsla(220, 100%, 95%,',
  ]

  const starCount = window.innerWidth < 768 ? 36 : window.innerWidth < 1280 ? 64 : 88

  for (let index = 0; index < starCount; index += 1) {
    const colorBase = starColors[Math.floor(Math.random() * starColors.length)]
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.6 + Math.random() * 1.8,
      color: colorBase,
      opacityBase: 0.18 + Math.random() * 0.34,
      opacitySpread: 0.08 + Math.random() * 0.24,
      blinkRate: 0.0008 + Math.random() * 0.0022,
      phase: Math.random() * Math.PI * 2,
    })
  }
}

function drawCanvas(timestamp = 0) {
  const canvas = starCanvas.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context || !mounted) {
    return
  }

  if (timestamp - lastFrameTime < 1000 / 10) {
    animationFrameId = window.requestAnimationFrame(drawCanvas)
    return
  }

  lastFrameTime = timestamp
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(6, 10, 21, 0.72)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  stars.forEach((star) => {
    const opacity = Math.max(
      0.08,
      Math.min(0.92, star.opacityBase + Math.sin(timestamp * star.blinkRate + star.phase) * star.opacitySpread),
    )
    const size = star.size * (0.92 + Math.abs(Math.sin(timestamp * star.blinkRate * 0.45 + star.phase)) * 0.2)
    context.beginPath()
    context.fillStyle = `${star.color}${opacity})`
    context.arc(star.x, star.y, size, 0, Math.PI * 2)
    context.fill()
  })

  Array.from({ length: 2 }).forEach(() => {
    const headX = Math.random() * canvas.width
    const headY = Math.random() * canvas.height * 0.55
    const tailX = headX - (90 + Math.random() * 120)
    const tailY = headY - (18 + Math.random() * 34)
    const gradient = context.createLinearGradient(headX, headY, tailX, tailY)
    const opacity = 0.12 + Math.random() * 0.16
    gradient.addColorStop(0, `rgba(143, 181, 200, ${opacity})`)
    gradient.addColorStop(0.2, `rgba(143, 181, 200, ${opacity * 0.35})`)
    gradient.addColorStop(1, 'rgba(143, 181, 200, 0)')
    context.strokeStyle = gradient
    context.lineWidth = 0.7 + Math.random() * 0.8
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(headX, headY)
    context.lineTo(tailX, tailY)
    context.stroke()
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

const sceneIframe = ref(null)
const showScene = ref(false)

function openModule() {
  showScene.value = true
}

function scrollToNextSection() {
  if (props.lessonGuide?.steps?.length) {
    scrollToElement('lesson-guide-section')
    return
  }

  openModule()
}

function queueScroll() {
  if (scrollFrame) {
    return
  }

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0
    handleScroll()
  })
}

onMounted(() => {
  mounted = true
  // 立即重置滚动位置
  window.scrollTo(0, 0)
  // 重置 hero 状态
  if (heroBgImg.value) { heroBgImg.value.style.filter = ''; heroBgImg.value.style.opacity = ''; heroBgImg.value.style.transform = ''; }
  if (heroOverlay.value) { heroOverlay.value.style.opacity = ''; }
  if (heroContent.value) { heroContent.value.style.opacity = ''; heroContent.value.style.transform = ''; }
  initCanvas()
  drawCanvas()
  handleScroll()
  observeRevealSections()

  window.addEventListener('resize', initCanvas)
  window.addEventListener('scroll', queueScroll, { passive: true })
})

onUnmounted(() => {
  mounted = false
  window.removeEventListener('resize', initCanvas)
  window.removeEventListener('scroll', queueScroll)
  window.cancelAnimationFrame(animationFrameId)
  window.cancelAnimationFrame(scrollFrame)
  revealObserver?.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    :class="[
      'dark bg-background text-on-background font-body selection:bg-primary/30 selection:text-primary overflow-x-hidden scene-html',
      { 'scene-html--en': currentLang === 'en' },
    ]"
  >
    <canvas id="star-canvas" ref="starCanvas"></canvas>
    <div class="nebula-glow"></div>

    <SiteHeader />

    <main>
      <section class="relative h-screen flex items-center justify-center overflow-hidden w-full">
        <div class="absolute inset-0 z-0">
          <img
            ref="heroBgImg"
            :alt="title"
            class="w-full h-full object-cover opacity-60 scale-105"
            :src="backgroundImage"
          />
          <div ref="heroOverlay" class="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background"></div>
        </div>

        <div ref="heroContent" class="relative z-10 text-center max-w-5xl px-6">
          <p class="text-primary uppercase tracking-[0.35em] text-xs md:text-sm mb-5 animate-drop-in" style="animation-delay: 0.1s;">
            {{ eyebrow }}
          </p>
          <h1 class="font-headline text-5xl md:text-7xl font-bold mb-6 tracking-tighter leading-tight animate-drop-in" style="animation-delay: 0.2s;">
            <span class="galaxy-text">{{ title }}</span>
          </h1>
          <p
            class="text-on-surface-variant text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed animate-drop-in galaxy-text"
            style="animation-delay: 0.3s;"
          >
            {{ description }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-drop-in" style="animation-delay: 0.4s;">
            <button
              class="btn-interactive compat-backdrop px-10 py-4 rounded-2xl bg-surface-container-highest/50 backdrop-blur-md border border-white/10 font-medium cursor-pointer text-white"
              type="button"
              @click="openModule"
            >
              {{ openLabel }}
            </button>
          </div>
        </div>

        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <button
            class="scroll-indicator-btn compat-backdrop flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20"
            type="button"
            @click="scrollToNextSection"
          >
            <span class="material-symbols-outlined text-3xl">keyboard_double_arrow_down</span>
          </button>
        </div>
      </section>

      <section
        v-if="lessonGuide?.steps?.length"
        id="lesson-guide-section"
        class="lesson-guide-section relative min-h-[82vh] w-full flex items-center justify-center overflow-hidden py-20 md:py-24"
      >
        <div class="max-w-[1400px] mx-auto px-6 md:px-8 w-full relative z-10 reveal-on-scroll">
          <div class="lesson-guide-head">
            <div class="lesson-guide-head__title-wrap">
              <p class="lesson-guide-head__eyebrow">{{ currentLang === 'zh' ? '教材内容' : 'Textbook Notes' }}</p>
              <h2 class="lesson-guide-head__title">{{ lessonGuide.title }}</h2>
              <p class="lesson-guide-head__subtitle">{{ lessonGuide.subtitle }}</p>
            </div>
            <div
              v-if="lessonGuide.rhythm || lessonGuide.outcomes?.length"
              class="lesson-guide-meta"
            >
              <p v-if="lessonGuide.rhythm" class="lesson-guide-meta__rhythm">{{ lessonGuide.rhythm }}</p>
              <ul v-if="lessonGuide.outcomes?.length" class="lesson-guide-meta__outcomes">
                <li v-for="item in lessonGuide.outcomes" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>

          <div class="lesson-flow-list">
            <article
              v-for="(step, index) in lessonGuide.steps"
              :key="step.title"
              class="lesson-flow-step"
              :class="{
                'lesson-flow-step--reverse': index % 2 === 1 && !!step.diagram,
                'lesson-flow-step--text': !step.diagram,
              }"
            >
              <figure v-if="step.diagram" class="lesson-flow-step__figure">
                <img
                  :src="step.diagram"
                  :alt="step.diagramAlt || step.title"
                  class="lesson-flow-step__image"
                />
                <figcaption class="lesson-flow-step__caption">
                  {{ step.diagramCaption || 'Diagram caption: pair the formula with the concept.' }}
                </figcaption>
              </figure>

              <div class="lesson-flow-step__body">
                <div class="lesson-flow-step__index">第{{ index + 1 }} 步</div>
                <h3 class="lesson-flow-step__title">{{ step.title }}</h3>
                <p class="lesson-flow-step__objective">{{ step.objective }}</p>

                <div v-if="step.keyPoints?.length" class="lesson-flow-step__block">
                  <h4>关键观察点</h4>
                  <ul class="lesson-flow-step__points">
                    <li v-for="point in step.keyPoints" :key="point">{{ point }}</li>
                  </ul>
                </div>

                <div v-if="step.formula || step.formulas?.length" class="lesson-flow-step__block lesson-flow-step__block--formula">
                  <h4>核心公式</h4>
                  <div v-if="step.formulaHtml" class="lesson-flow-step__formula" v-html="step.formulaHtml"></div>
                  <div v-else-if="step.formula" class="lesson-flow-step__formula">{{ step.formula }}</div>
                  <ul v-if="step.formulasHtml?.length" class="lesson-flow-step__formula-list">
                    <li v-for="item in step.formulasHtml" :key="item" v-html="item"></li>
                  </ul>
                  <ul v-else-if="step.formulas?.length" class="lesson-flow-step__formula-list">
                    <li v-for="item in step.formulas" :key="item">{{ item }}</li>
                  </ul>
                  <p v-if="step.formulaExplain">{{ step.formulaExplain }}</p>
                </div>

                <div v-if="step.explain" class="lesson-flow-step__block">
                  <h4>知识讲解</h4>
                  <p>{{ step.explain }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>

    <!-- 全屏场景覆盖层 -->
    <div
      v-if="showScene"
      class="fixed inset-0 z-[100] bg-black"
    >
      <iframe
        ref="sceneIframe"
        :src="src"
        class="w-full h-full border-none"
        allow="autoplay; fullscreen; xr-spatial-tracking"
      />
    </div>
  </div>
</template>

<style scoped>
.compat-backdrop {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .compat-backdrop {
    background-color: rgba(10, 16, 22, 0.92);
  }
}

.scene-html--en {
  font-family: 'Times New Roman', Times, serif;
}

.scene-html--en :is(.font-headline, .font-body) {
  font-family: 'Times New Roman', Times, serif !important;
}

.scene-html--en :is(.lesson-flow-step__formula, .lesson-flow-step__formula-list) {
  font-family: 'Times New Roman', Times, serif;
}

.lesson-guide-head {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  margin: 0 auto 34px;
  max-width: 1240px;
}

.lesson-guide-head__eyebrow {
  margin: 0 0 8px;
  color: rgba(186, 199, 245, 0.84);
  letter-spacing: 0.08em;
  text-transform: none;
  font-size: 0.9rem;
  font-weight: 700;
}

.lesson-guide-head__title {
  margin: 0;
  color: #f4f7ff;
  font-family: 'Times New Roman', 'Songti SC', serif;
  letter-spacing: 0.02em;
  font-size: clamp(2.4rem, 4.4vw, 3.7rem);
  line-height: 1.05;
}

.lesson-guide-head__subtitle {
  margin: 10px 0 0;
  color: rgba(220, 229, 248, 0.88);
  font-size: 1.3rem;
  line-height: 1.68;
}

.lesson-guide-meta {
  max-width: 1240px;
  padding: clamp(22px, 2.3vw, 34px) clamp(24px, 3vw, 42px);
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 28px;
  background: rgba(28, 28, 30, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.lesson-guide-meta__rhythm {
  margin: 0 0 14px;
  color: #dbe5ff;
  font-size: 1.16rem;
  font-weight: 600;
  line-height: 1.64;
}

.lesson-guide-meta__outcomes {
  margin: 0;
  padding-left: 20px;
  color: rgba(218, 227, 247, 0.85);
  display: grid;
  gap: 8px;
  font-size: 1.16rem;
  line-height: 1.66;
}

.lesson-flow-list {
  display: grid;
  gap: 30px;
  max-width: 1240px;
  margin: 0 auto;
}

.lesson-flow-step {
  display: grid;
  grid-template-columns: minmax(520px, 1.28fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(34px, 4vw, 56px);
  padding: clamp(30px, 3.4vw, 48px);
  border-bottom: none;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 30px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.02)),
    rgba(28, 28, 30, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.lesson-flow-step--reverse {
  grid-template-columns: minmax(0, 1fr) minmax(520px, 1.28fr);
}

.lesson-flow-step--text {
  display: block;
}

.lesson-flow-step--reverse .lesson-flow-step__figure {
  order: 2;
}

.lesson-flow-step--reverse .lesson-flow-step__body {
  order: 1;
}

.lesson-flow-step__figure {
  margin: 0;
  display: grid;
  grid-template-rows: auto auto;
  gap: 14px;
}

.lesson-flow-step__image {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
}

.lesson-flow-step__caption {
  margin: 0;
  padding: 0 4px;
  color: rgba(205, 217, 243, 0.74);
  font-size: 1.08rem;
  line-height: 1.62;
}

.lesson-flow-step__body {
  padding: 2px 0 4px;
  max-width: 680px;
}

.lesson-flow-step--text .lesson-flow-step__body {
  max-width: 920px;
}

.lesson-flow-step__index {
  display: inline-block;
  color: #dce4ff;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  font-weight: 700;
}

.lesson-flow-step__title {
  margin: 12px 0 0;
  color: #f3f7ff;
  font-size: 1.94rem;
  line-height: 1.34;
  font-family: 'Times New Roman', 'Songti SC', serif;
}

.lesson-flow-step__objective {
  margin: 14px 0 0;
  color: rgba(216, 227, 249, 0.94);
  font-size: 1.28rem;
  line-height: 1.72;
}

.lesson-flow-step__block {
  margin-top: 20px;
  padding-top: 0;
  border-top: none;
}

.lesson-flow-step__block h4 {
  margin: 0;
  color: #dde5ff;
  font-size: 1.14rem;
  letter-spacing: 0.01em;
  text-transform: none;
}

.lesson-flow-step__block p {
  margin: 8px 0 0;
  color: rgba(214, 225, 246, 0.88);
  font-size: 1.2rem;
  line-height: 1.72;
}

.lesson-flow-step__points {
  margin: 10px 0 0;
  padding-left: 24px;
  color: rgba(220, 230, 248, 0.86);
  display: grid;
  gap: 8px;
  font-size: 1.16rem;
  line-height: 1.68;
}

.lesson-flow-step__formula {
  display: block;
  min-height: auto;
  padding: 0;
  color: #eef3ff;
  font-family: 'Times New Roman', 'Cambria Math', serif;
  font-size: 1.4rem;
  letter-spacing: 0.035em;
  word-spacing: 0.1em;
  font-kerning: normal;
  font-variant-ligatures: none;
  font-style: italic;
}

.lesson-flow-step__formula :deep(.formula-frac),
.lesson-flow-step__formula-list :deep(.formula-frac) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin: 0 0.22em;
  line-height: 1.05;
}

.lesson-flow-step__formula :deep(.formula-frac__top),
.lesson-flow-step__formula-list :deep(.formula-frac__top) {
  display: block;
  padding: 0 0.34em 0.08em;
  border-bottom: 1.6px solid rgba(226, 236, 255, 0.92);
}

.lesson-flow-step__formula :deep(.formula-frac__bottom),
.lesson-flow-step__formula-list :deep(.formula-frac__bottom) {
  display: block;
  padding: 0.08em 0.34em 0;
}

.lesson-flow-step__formula-list {
  margin: 10px 0 0;
  padding-left: 24px;
  color: rgba(228, 235, 250, 0.9);
  display: grid;
  gap: 8px;
  font-family: 'Times New Roman', 'Cambria Math', serif;
  font-size: 1.26rem;
  letter-spacing: 0.03em;
  word-spacing: 0.08em;
  font-kerning: normal;
  font-variant-ligatures: none;
  line-height: 1.66;
  font-style: italic;
}

.lesson-flow-step__block--formula p {
  color: rgba(204, 220, 248, 0.9);
  font-size: 1.12rem;
  font-style: normal;
}

.lesson-flow-step__block--summary {
  border-top-color: transparent;
}

@media (max-width: 980px) {
  .lesson-guide-head {
    grid-template-columns: 1fr;
    margin-bottom: 26px;
  }

  .lesson-guide-meta,
  .lesson-flow-step {
    border-radius: 24px;
    padding: 24px;
  }

  .lesson-flow-step,
  .lesson-flow-step--reverse {
    display: block;
  }

  .lesson-flow-step__figure {
    margin-bottom: 24px;
  }

  .lesson-flow-step__image {
    height: auto;
    object-fit: contain;
    border-radius: 18px;
  }

  .lesson-flow-step--reverse .lesson-flow-step__figure,
  .lesson-flow-step--reverse .lesson-flow-step__body {
    order: initial;
  }
}
</style>
