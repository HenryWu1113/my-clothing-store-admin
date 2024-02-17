<template>
  <header class="flex flex-row h-[72px] border border-b-black-500 px-4">
    <!-- <div class="flex flex-row cursor-pointer items-center" @click="$router.push('/overview')">
      <img class="h-4/5" src="/src/assets/images/logo_dark.png" />
      <n-gradient-text class="text-2xl ml-2 font-bold" type="info">STORE</n-gradient-text>
    </div> -->
    <CategoriesBtns />
    <MunuBtns />
    <n-drawer class="management" v-model:show="isOpen" :width="350" placement="left">
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
<style lang="scss" scoped></style>
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
