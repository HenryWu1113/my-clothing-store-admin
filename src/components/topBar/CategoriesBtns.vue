<template>
  <div class="category-btns-wrap">
    <div
      class="btn"
      v-for="menu in filterMunu"
      :key="menu.key"
      @click="$router.push(`/${menu.route}`)"
    >
      {{ menu.text }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import '@/styles/styles';

.category-btns-wrap {
  display: flex;
  align-items: center;
  margin-left: 1.5rem;
  gap: 1rem;
  margin-right: auto;
  .btn {
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    color: $text-color;
    &:hover {
      border-bottom: 2px solid $text-color;
    }
  }
}
</style>
<script setup lang="ts">
import { computed } from 'vue'
import { menuSelection } from '@/composables/settings/settings'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'

const { role } = storeToRefs(useAdminStore())

const filterMunu = computed(() => {
  if (role.value === 'manager') {
    return menuSelection
  } else {
    return menuSelection.filter((item) => item.key !== 'overview')
  }
})
</script>
