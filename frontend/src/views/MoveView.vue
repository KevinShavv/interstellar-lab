<script setup>
import { computed, onMounted } from 'vue'

import SolarSystem3D from '@/components/SolarSystem3D.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()
const { currentLang } = useSiteChrome()

const scene = computed(() => store.resolveScene('move'))

const pageMeta = computed(() =>
  currentLang.value === 'zh'
    ? {
        title: '地月转移演示',
        eyebrow: '轨道任务',
        description: '按地月任务流程讲解：受力、入轨、制动、复盘。',
        backgroundImage: '/assets/simulation/models/3.webp',
        openLabel: '进入模块',
        lessonGuide: {
          title: '地月转移教材流程',
          subtitle: '4步：受力 -> 入轨 -> 制动 -> 复盘',
          rhythm: '每步 8 分钟：看轨迹、看公式、做判断。',
          coverImage: '/assets/simulation/models/3.webp',
          outcomes: ['会解释四个任务阶段。', '会用数据写结论。'],
          steps: [
            {
              title: '步骤1：受力与轨迹',
              diagram: '/assets/lesson-photos/图片7.png',
              diagramAlt: '地月转移曲线轨道示意图',
              diagramCaption: '转移轨道是连续弯曲，不是直线。',
              objective: '先建立“力改变轨迹”概念。',
              formula: 'F = ma',
              formulaExplain: '合力存在，轨迹就会弯曲。',
              keyPoints: ['地月都在运动。', '速度方向同样关键。'],
              activity: '对比直线假设和真实轨迹。',
              summary: '转移任务本质是轨道控制。',
            },
            {
              title: '步骤2：入轨速度窗口',
              diagram: '/assets/lesson-diagrams/move-orbit-window.svg',
              diagramAlt: '入轨速度窗口示意图',
              diagramCaption: '速度过小回落，过大偏离。',
              objective: '理解“入轨速度有窗口”。',
              formulasHtml: [
                'v² ≈ <span class="formula-frac"><span class="formula-frac__top">GM</span><span class="formula-frac__bottom">r</span></span>',
                'v = <span class="formula-frac"><span class="formula-frac__top">2π r</span><span class="formula-frac__bottom">T</span></span>',
              ],
              formulaExplain: '给定半径下，速度过偏会失稳。',
              keyPoints: ['先入轨，再转移。', '速度决定轨道形状。'],
              activity: '测试低/中/高三档速度。',
              summary: '入轨先于转移。',
            },
            {
              title: '步骤3：近月制动',
              diagram: '/assets/lesson-diagrams/move-loi-brake.svg',
              diagramAlt: '近月制动与捕获示意图',
              diagramCaption: '到月球附近不等于被捕获。',
              objective: '理解制动是捕获关键。',
              formulas: ['Δv = v_after - v_before', '相对速度过大易掠过目标'],
              formulaExplain: '减速到窗口内，捕获概率更高。',
              keyPoints: ['制动时机很关键。', '过快常掠过。'],
              activity: '对比早制动、晚制动、适时制动。',
              summary: '近月阶段先控速。',
            },
            {
              title: '步骤4：数据复盘',
              diagram: '/assets/lesson-diagrams/move-data-evidence.svg',
              diagramAlt: '状态-速度-受力数据表示意图',
              diagramCaption: '状态、速度、受力一起看。',
              objective: '形成“现象-数据-结论”表达。',
              formulaHtml:
                'E = <span class="formula-frac"><span class="formula-frac__top">1</span><span class="formula-frac__bottom">2</span></span> m v² + U',
              formulaExplain: '能量变化可解释轨道状态切换。',
              keyPoints: ['先写结论，再给数据。', '不要只写“看起来成功”。'],
              activity: '写一条“结论+两条证据”。',
              summary: '数据是结论依据。',
            },
          ],
        },
      }
    : {
        title: 'Moon-Earth Transfer Demo',
        eyebrow: 'Orbital Mission',
        description: 'The page now follows the exact homepage rhythm for header, colors, button feedback, and entrance motion while keeping the original transfer demo file and route.',
        backgroundImage: '/assets/simulation/models/3.webp',
        openLabel: 'Enter Module',
        lessonGuide: {
          title: 'Classroom Guide: Earth-Moon Transfer',
          subtitle: 'A middle-school level walkthrough of gravity, speed, and orbital stages.',
          rhythm: 'Recommended: 6 min intro + 14 min observation + 12 min explanation + 8 min discussion',
          outcomes: [
            'Describe launch, transfer, braking, and capture stages.',
            'Explain how speed changes orbit.',
            'Read speed/force/state indicators from the UI.',
          ],
          steps: [
            {
              title: 'Mission setup',
              objective: 'Understand why transfer is not straight-line flight.',
              explain: 'Spacecraft motion is curved under gravity, not a simple straight path.',
              activity: 'Predict first, then compare with simulation trajectory.',
              check: 'Why can’t the craft just fly straight to the Moon?',
            },
            {
              title: 'Launch and transfer',
              objective: 'See how speed and direction shape orbit.',
              explain: 'Insufficient speed falls back; proper speed enters orbit; adjusted speed can transfer.',
              activity: 'Test several thrust settings and compare outcomes.',
              check: 'Does only increasing speed always help reach the Moon faster?',
            },
            {
              title: 'Lunar braking',
              objective: 'Understand why slowing down is necessary near the Moon.',
              explain: 'Without braking, the craft may fly by or escape instead of being captured.',
              activity: 'Compare pre/post-brake speed and orbit changes.',
              check: 'Is continuous acceleration near the Moon better for capture?',
            },
            {
              title: 'Wrap-up',
              objective: 'Build a full stage-based mission understanding.',
              explain: 'Use a four-stage model and connect each stage with control goals.',
              activity: 'Group 1-minute mission replay and reflection.',
              check: 'If Moon mass increases, does capture become easier?',
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
