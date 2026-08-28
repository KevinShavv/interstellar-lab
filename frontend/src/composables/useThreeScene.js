import { ref, onMounted, onUnmounted, shallowRef } from 'vue'

/**
 * 通用的 Three.js 场景 composable
 * 将 legacy HTML 中的 Three.js 场景嵌入 Vue 组件内
 *
 * 用法:
 *   const { containerRef, isLoading, error } = useThreeScene({
 *     sceneUrl: '/legacy/SolarSystem.html',
 *     extractScripts: true,   // 提取 HTML 中的脚本并执行
 *   })
 */
export function useThreeScene(options = {}) {
  const {
    sceneUrl = '',
    autoLoad = true,
    onReady = null,
    onError = null,
  } = options

  const containerRef = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isReady = ref(false)

  // 保存场景引用，用于清理
  const sceneInstance = shallowRef(null)
  const rendererInstance = shallowRef(null)
  const animationFrameId = ref(0)

  async function loadScene() {
    if (!containerRef.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(sceneUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const html = await response.text()

      // 创建 iframe 沙箱执行脚本（隔离但嵌入到 Vue 容器内）
      const iframe = document.createElement('iframe')
      iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;'
      iframe.sandbox = 'allow-scripts allow-same-origin allow-pointer-lock'
      iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking'

      containerRef.value.innerHTML = ''
      containerRef.value.style.position = 'relative'
      containerRef.value.style.width = '100%'
      containerRef.value.style.height = '100vh'
      containerRef.value.appendChild(iframe)

      iframe.contentDocument.open()
      iframe.contentDocument.write(html)
      iframe.contentDocument.close()

      sceneInstance.value = iframe
      isLoading.value = false
      isReady.value = true

      if (onReady) onReady(iframe)
    } catch (err) {
      error.value = err.message
      isLoading.value = false
      if (onError) onError(err)
    }
  }

  function destroyScene() {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }

    if (sceneInstance.value) {
      sceneInstance.value.remove()
      sceneInstance.value = null
    }

    if (containerRef.value) {
      containerRef.value.innerHTML = ''
    }

    rendererInstance.value = null
    isReady.value = false
  }

  if (autoLoad) {
    onMounted(() => {
      loadScene()
    })
  }

  onUnmounted(() => {
    destroyScene()
  })

  return {
    containerRef,
    isLoading,
    error,
    isReady,
    loadScene,
    destroyScene,
  }
}
