<template>
  <div class="category-btns-wrap">
    <div
      class="btn"
      v-for="menu in menuSelection"
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
    // transition: 0.2s;
    &:hover {
      border-bottom: 2px solid $dark;
    }
  }
}
</style>
<script setup lang="ts">
import { menuSelection } from '@/composables/settings/settings'
</script>
