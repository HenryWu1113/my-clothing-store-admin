<template>
  <header class="flex flex-row h-[72px] border-b-[1px] border-black-500 px-4">
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
  border-bottom: 1px solid $light1;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: $light;
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
