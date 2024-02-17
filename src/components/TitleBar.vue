<template>
  <div class="title-bar">
    <n-button type="info" dashed @click="onOpen">切換管理頁面</n-button>
    <p>{{ pageTitle }}</p>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';
.title-bar {
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: 2px solid $light1;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  position: relative;
  > p {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
<script setup lang="ts">
import { useDrawerStore } from '@/stores/drawer'
import { storeToRefs } from 'pinia'

const { onOpen } = useDrawerStore()

const props = defineProps({
  pageTitle: {
    type: String,
    required: true
  }
})
</script>
