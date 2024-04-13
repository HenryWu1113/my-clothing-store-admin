<template>
  <header>
    <div class="logo" @click="$router.push('/overview')">H</div>
    <CategoriesBtns />
    <MunuBtns />
    <n-drawer class="management" v-model:show="isOpen" :width="350" placement="right">
      <div class="drawer-title">管理頁面</div>
      <div class="drawer-body">
        <div
          :class="['page-btn', route.path.includes(page.route) ? 'active' : '']"
          v-for="page in managementPages"
          :key="page.key"
          @click="$router.push(`/${page.route}`)"
        >
          {{ page.text }}
        </div>
      </div>
    </n-drawer>
  </header>
  <RouterView />
</template>
<style lang="scss" scoped>
@import '@/styles/styles';

header {
  height: 72px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: $bg-color;
  .logo {
    cursor: pointer;
    height: 70%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    background: $text-color;
    display: flex;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    color: $bg-color;
  }
}
</style>
<script lang="ts" setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDrawerStore } from '@/stores/drawer'
import { managementPages } from '@/composables/settings/settings'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isOpen } = storeToRefs(useDrawerStore())
const { onClose } = useDrawerStore()

import CategoriesBtns from './CategoriesBtns.vue'
import MunuBtns from './MunuBtns.vue'

watch(
  () => route.path,
  () => {
    onClose()
  }
)
</script>
