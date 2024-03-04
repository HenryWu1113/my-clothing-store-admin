<template>
  <div class="title-bar">
    <p>{{ pageTitle }}</p>
    <slot name="End"></slot>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';
.title-bar {
  width: 100%;
  height: 80px;
  // border-radius: 10px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
  > p {
    color: $text-color;
    font-size: 2rem;
    font-weight: bold;
  }
}
</style>
<script setup lang="ts">
import { useDrawerStore } from '@/stores/drawer'

const props = defineProps({
  pageTitle: {
    type: String,
    required: true
  }
})
</script>
