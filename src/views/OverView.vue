<template>
  <component :is="currentComponent" />
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'

import SelfOverview from '@/components/SelfOverview.vue'
import StoreOverview from '@/components/StoreOverview.vue'

const { role } = storeToRefs(useAdminStore())

const currentComponent = computed(() => {
  if (role.value === 'manager') {
    return StoreOverview
  } else {
    return SelfOverview
  }
})
</script>
