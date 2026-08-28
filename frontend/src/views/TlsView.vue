<script setup>
import { computed, onMounted } from 'vue'

import SolarSystem3D from '@/components/SolarSystem3D.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()
const { currentLang } = useSiteChrome()

const scene = computed(() => store.resolveScene('tls'))

const pageMeta = computed(() =>
  currentLang.value === 'zh'
    ? {
        title: '科学实验室',
        eyebrow: '虚拟实验',
        description: '按实验教材流程讲解：变量、引力、速度、距离。',
        backgroundImage: '/assets/simulation/models/5.webp',
        openLabel: '进入模块',
        lessonGuide: {
          title: '星体实验教材流程',
          subtitle: '4步：变量 -> 引力 -> 速度 -> 距离',
          rhythm: '每步 8 分钟：改参数、看现象、写结论。',
          coverImage: '/assets/simulation/models/5.webp',
          outcomes: ['会做控制变量实验。', '会用公式解释轨道变化。'],
          steps: [
            {
              title: '步骤1：变量与方法',
              diagram: '/assets/lesson-diagrams/tls-variable-map.svg',
              diagramAlt: '变量与结果关系示意图',
              diagramCaption: '先区分自变量与因变量。',
              objective: '建立控制变量流程。',
              formulas: ['控制变量法：每次只改 1 个量', '因变量：轨道形状、周期、稳定性'],
              formulaExplain: '不控变量，结论不可比。',
              keyPoints: ['自变量：m、r、v。', '先记录再下结论。'],
              activity: '先写预测，再做实验。',
              summary: '方法先于结论。',
            },
            {
              title: '步骤2：质量与引力',
              diagram: '/assets/lesson-photos/图片5.png',
              diagramAlt: '万有引力定律示意图',
              diagramCaption: '质量变化会改变引力大小。',
              objective: '理解 m 变大会增强引力。',
              formulaHtml:
                'F = G <span class="formula-frac"><span class="formula-frac__top">m₁ m₂</span><span class="formula-frac__bottom">r²</span></span>',
              formulaExplain: 'r 不变时，m 增大 -> F 增大。',
              keyPoints: ['质量是引力旋钮。', '同速下轨道更易收紧。'],
              activity: '做低/中/高质量三组对比。',
              summary: 'm↑ -> F↑。',
            },
            {
              title: '步骤3：速度与稳定',
              diagram: '/assets/lesson-photos/图片6.png',
              diagramAlt: '速度与轨道平衡示意图',
              diagramCaption: '稳定轨道来自速度与引力匹配。',
              objective: '理解慢/稳/快三种结果。',
              formulasHtml: [
                '<span class="formula-frac"><span class="formula-frac__top">m v²</span><span class="formula-frac__bottom">r</span></span> = <span class="formula-frac"><span class="formula-frac__top">G M m</span><span class="formula-frac__bottom">r²</span></span>',
                'v<sub>escape</sub> ≈ √(<span class="formula-frac"><span class="formula-frac__top">2 G M</span><span class="formula-frac__bottom">r</span></span>)',
              ],
              formulaExplain: '过慢下落，适中绕行，过快逃逸。',
              keyPoints: ['速度不是越大越稳。', '存在稳定窗口。'],
              activity: '做慢/中/快三档实验。',
              summary: '速度决定轨道状态。',
            },
            {
              title: '步骤4：距离与周期',
              diagram: '/assets/lesson-photos/图片5.png',
              diagramAlt: '距离变化对应引力变化示意图',
              diagramCaption: '距离同时影响引力和周期。',
              objective: '理解 r 对力和周期的联动影响。',
              formulasHtml: [
                'F ∝ <span class="formula-frac"><span class="formula-frac__top">1</span><span class="formula-frac__bottom">r²</span></span>',
                'T² ∝ r³',
              ],
              formulaExplain: 'r 变大时，F 变小，T 变长。',
              keyPoints: ['近距离引力更强。', '远距离周期更长。'],
              activity: '做近/中/远三组距离对比。',
              summary: 'r 影响“力+周期”。',
            },
          ],
        },
      }
    : {
        title: 'Scientific Laboratory',
        eyebrow: 'Virtual Experiment',
        description: 'The lab page now uses the homepage purple palette, glass cards, scroll transitions, and entrance animation while preserving the original experiment scene file.',
        backgroundImage: '/assets/simulation/models/5.webp',
        openLabel: 'Enter Module',
        lessonGuide: {
          title: 'Classroom Guide: Celestial Lab',
          subtitle: 'Hands-on middle-school inquiry with gravity and orbit variables.',
          rhythm: 'Recommended: 8 min review + 18 min experiment + 10 min discussion + 6 min summary',
          outcomes: [
            'Explain orbit trends with mass, distance, and speed.',
            'Run a simple controlled-variable experiment.',
            'Write evidence-based conclusions.',
          ],
          steps: [
            {
              title: 'Setup and variables',
              objective: 'Define variables and observation targets first.',
              explain: 'Use mass, distance, and initial speed as key variables.',
              activity: 'Fill in a brief prediction table before running tests.',
              check: 'Should all variables be changed at once?',
            },
            {
              title: 'Mass effect',
              objective: 'Observe how stronger gravity changes orbit behavior.',
              explain: 'Increase central body mass while keeping other variables fixed.',
              activity: 'Run low/medium/high mass trials and compare.',
              check: 'Why does larger mass pull trajectories inward more easily?',
            },
            {
              title: 'Speed effect',
              objective: 'Connect speed range to orbit shape and escape.',
              explain: 'Low speed may fall, proper speed can orbit, high speed may escape.',
              activity: 'Step up speed and find a near-stable orbit range.',
              check: 'Is greater speed always more stable?',
            },
            {
              title: 'Evidence-based conclusion',
              objective: 'Close the loop: phenomenon -> evidence -> conclusion.',
              explain: 'Summarize with observed change, supporting data, and inferred rule.',
              activity: 'Each group presents one strong data comparison.',
              check: 'If prediction fails, what should be checked first?',
            },
          ],
        },
      },
)

onMounted(() => {
  store.bootstrap()
})
</script>

<template>
  <SolarSystem3D v-if="scene" :src="scene.legacy_path" v-bind="pageMeta" />
</template>
