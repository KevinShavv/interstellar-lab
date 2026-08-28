<script setup>
import { useThreeScene } from '@/composables/useThreeScene'

const props = defineProps({
  src: { type: String, required: true },
})

const { containerRef, isLoading, error, isReady } = useThreeScene({
  sceneUrl: props.src,
  autoLoad: true,
})
</script>

<template>
  <div class="embedded-scene-wrapper">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="embedded-scene-loading">
      <div class="loader"></div>
      <p>正在加载场景…</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="embedded-scene-error">
      <p>场景加载失败：{{ error }}</p>
      <button @click="loadScene">重试</button>
    </div>

    <!-- 场景容器 -->
    <div
      v-show="isReady"
      ref="containerRef"
      class="embedded-scene-container"
    />

    <!-- 返回按钮 -->
    <button
      v-if="isReady"
      class="embedded-scene-back"
      @click="$router.back()"
    >
      ← 返回
    </button>
  </div>
</template>

<style scoped>
.embedded-scene-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.embedded-scene-container {
  width: 100%;
  height: 100vh;
}

.embedded-scene-loading,
.embedded-scene-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #0a1016;
  gap: 16px;
  z-index: 100;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(143, 181, 200, 0.2);
  border-top-color: #8fb5c8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.embedded-scene-back {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 9999;
  padding: 8px 16px;
  background: rgba(20, 20, 30, 0.85);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  backdrop-filter: blur(12px);
  transition: background 0.2s;
}

.embedded-scene-back:hover {
  background: rgba(40, 40, 60, 0.9);
}
</style>
