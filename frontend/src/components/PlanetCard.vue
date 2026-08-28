<template>
  <article class="planet-card" :style="{ '--card-accent': module.accent }">
    <div class="planet-card__media">
      <img :src="module.preview_image" :alt="module.title" />
    </div>
    <div class="planet-card__content">
      <h3>{{ module.title }}</h3>
      <RouterLink class="planet-card__link" :to="module.route">进入模块</RouterLink>
    </div>
  </article>
</template>

<script setup>
defineProps({
  module: {
    type: Object,
    required: true,
  },
})
</script>