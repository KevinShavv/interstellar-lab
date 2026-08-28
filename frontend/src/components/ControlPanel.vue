<template>
  <button
    class="control-chip"
    :class="{ active: active }"
    type="button"
    @click="$emit('select', module.slug)"
  >
    <span class="control-chip__title">{{ module.title }}</span>
  </button>
</template>

<script setup>
defineProps({
  module: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>