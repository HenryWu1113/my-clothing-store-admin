<template>
  <div :class="['self-overview-page', 'myContainer']">
    <div class="profile-wrap">
      <div class="avatar-wrap">
        <n-image width="200" v-if="avatar.length" :src="avatar" object-fit="cover" />
      </div>
      <div class="welcome">歡迎回來~ {{ name }}</div>
      <n-button ghost @click="$router.push('/profile')">前往個人資訊</n-button>
    </div>
    <n-calendar v-model:value="value"></n-calendar>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/styles';

.self-overview-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .profile-wrap {
    border-bottom: 1px solid $border-color;
    padding-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    .welcome {
      color: $text-color2;
      font-size: 1.5rem;
    }
    .avatar-wrap {
      width: 50px;
      height: 50px;
      position: relative;
      // border: 2px solid $border-color;
      border-radius: 10px;
      > .n-image {
        width: 100%;
        height: 100%;
        border-radius: 10px;
      }
    }

    .n-button {
      margin-left: auto;
    }
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import moment from 'moment'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
const {
  avatar,
  name,
  sex,
  birthday,
  address,
  email,
  cellphone,
  account,
  height,
  weight,
  introduce,
  store
} = storeToRefs(useAdminStore())

const value = ref(moment().valueOf())
</script>
