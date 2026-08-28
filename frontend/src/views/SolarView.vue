<script setup>
import { computed, onMounted } from 'vue'

import SolarSystem3D from '@/components/SolarSystem3D.vue'
import { useSiteChrome } from '@/composables/useSiteChrome'
import { useSolarStore } from '@/store/solarStore'

const store = useSolarStore()
const { currentLang } = useSiteChrome()

const scene = computed(() => store.resolveScene('home'))

const pageMeta = computed(() =>
  currentLang.value === 'zh'
    ? {
        title: '太阳系全景',
        eyebrow: '星系图谱',
        description: '按教材流程讲太阳系：看图、套公式、下结论。',
        backgroundImage: '/assets/simulation/models/sys.jpg',
        openLabel: '进入模块',
        lessonGuide: {
          title: '太阳系教材流程',
          subtitle: '4步：结构 -> 昼夜 -> 四季 -> 辐射',
          rhythm: '每步 8 分钟：看图、套公式、下结论。',
          coverImage: '/assets/simulation/models/sys.jpg',
          outcomes: ['会用公式解释现象。', '能写“结论+依据”。'],
          steps: [
            {
              title: '步骤1：结构与周期',
              diagram: '/assets/lesson-photos/图片1.png',
              diagramAlt: '太阳系结构抽象示意图',
              diagramCaption: '先看中心与轨道层级。',
              objective: '认识“中心天体+分层轨道”。',
              formula: 'T² ∝ r³',
              formulaExplain: 'r 越大，T 越长。',
              keyPoints: ['太阳在中心。', '外行星周期更长。'],
              explain: '先按远近分层，再判断谁公转更慢。',
              activity: '比较地球与海王星的公转周期。',
              summary: '半径大 -> 周期长。',
            },
            {
              title: '步骤2：自转与昼夜',
              diagram: '/assets/lesson-photos/图片2.png',
              diagramAlt: '地轴倾角与太阳照射示意图',
              diagramCaption: '昼夜先看自转。',
              objective: '用自转解释昼夜交替。',
              formulasHtml: [
                'ω = <span class="formula-frac"><span class="formula-frac__top">2π</span><span class="formula-frac__bottom">T</span></span>',
                'T<sub>earth</sub> ≈ 24 h',
              ],
              formulaExplain: '地球自转一周约 24 h。',
              keyPoints: ['昼夜主因是自转。', '周期决定昼夜节律。'],
              activity: '标注晨、午、昏、夜位置。',
              summary: '昼夜 = 自转结果。',
            },
            {
              title: '步骤3：公转与四季',
              diagram: '/assets/lesson-photos/图片3.png',
              diagramAlt: '公转与倾角关系示意图',
              diagramCaption: '四季核心是受光角变化。',
              objective: '用倾角+公转解释四季。',
              formulas: ['Q ∝ cosθ', '四季主因：地轴倾角（23.44°）+ 公转'],
              formulaExplain: '太阳高度角越小，单位面积受热越弱。',
              keyPoints: ['四季不是单看地日距离。', '南北半球受光反向变化。', '北半球冬季时地球实际处于近日点附近。'],
              explain: '春分/秋分太阳直射赤道；夏至直射北回归线（23.44°N）；冬至直射南回归线（23.44°S）。',
              activity: '在3D场景中定位春分、夏至、秋分、冬至四个轨道标记点，比较各位置的日地距离和受光情况。',
              summary: '四季 = 地轴倾角 + 公转位置 → 太阳高度角变化。',
            },
            {
              title: '步骤4：距离与辐射',
              diagram: '/assets/lesson-photos/图片4.png',
              diagramAlt: '辐射与距离关系示意图',
              diagramCaption: '平方反比用于定性判断。',
              objective: '会用距离判断辐射强弱。',
              formulaHtml:
                'I ∝ <span class="formula-frac"><span class="formula-frac__top">1</span><span class="formula-frac__bottom">r²</span></span>',
              formulaExplain: '距离翻倍，辐射约降为四分之一。',
              keyPoints: ['远 -> 辐射弱。', '近 -> 辐射强。'],
              activity: '比较 r 与 2r 的辐射比。',
              summary: '距离决定辐射衰减趋势。',
            },
          ],
        },
      }
    : {
        title: 'Solar System Panorama',
        eyebrow: 'Galactic Atlas',
        description: 'The original solar-system scene stays intact, while the entry flow, buttons, scrolling rhythm, and hero animation now match the homepage exactly.',
        backgroundImage: '/assets/simulation/models/sys.jpg',
        openLabel: 'Enter Module',
        lessonGuide: {
          title: 'Classroom Guide: Solar System',
          subtitle: 'A middle-school friendly lesson flow from observation to explanation.',
          rhythm: 'Recommended: 5 min intro + 12 min observation + 13 min explanation + 10 min practice',
          outcomes: [
            'Explain day/night and seasons with correct motion concepts.',
            'Distinguish orbit distance effects from axial tilt effects.',
            'Compare inner and outer planets using evidence.',
          ],
          steps: [
            {
              title: 'See the whole system first',
              objective: 'Build a clear spatial view before details.',
              explain: 'Identify the Sun as center and compare orbital scales from inner to outer planets.',
              activity: 'Students rank planets by distance, then verify in the scene.',
              check: 'Why do outer planets appear farther apart? Mention larger orbital radius.',
            },
            {
              title: 'Earth focus: day/night and seasons',
              objective: 'Connect geography phenomena to physical motion.',
              explain: 'Day/night comes from rotation; seasons mainly come from axial tilt (23.44°) plus revolution. Vernal/Autumnal equinoxes: Sun over equator; Summer/Winter solstices: Sun at ±23.44°.',
              activity: 'Locate the 4 season markers (equinoxes & solstices) on Earth\'s orbit and compare Sun angle.',
              check: 'Is nearest Earth-Sun distance always summer in the north? No — perihelion is in January (NH winter).',
            },
            {
              title: 'Planet comparison',
              objective: 'Use distance, composition, and environment together.',
              explain: 'Inner planets are mostly rocky; outer planets are gas/ice giants.',
              activity: 'Group mini-report comparing two planets.',
              check: 'Why are outer planets colder? Less solar radiation.',
            },
            {
              title: 'Wrap-up and transfer',
              objective: 'Apply model-based reasoning to real questions.',
              explain: 'Follow observe -> explain -> verify.',
              activity: 'Analyze a given orbit snapshot and infer radiation level.',
              check: 'Would obvious seasons remain if Earth had no axial tilt?',
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
