<template>
  <div class="clerk-outfit-page myContainer">
    <div class="title">
      <p>我的穿搭</p>
      <n-button>新增穿搭</n-button>
    </div>
    <div class="clerk-info-wrap">
      <div class="img-wrap">
        <img v-if="avatar" :src="avatar" />
        <img v-else :src="`https://source.boringavatars.com/beam/160/${adminId}`" />
      </div>
      <div class="clerk-info">
        <div class="name">{{ name }} | {{ height ?? '??' }}cm | {{ weight ?? '??' }}kg</div>
        <div class="store">{{ store }} ></div>
        <div class="introduce">{{ introduce ?? '這個店員自我介紹什麼都沒寫唷!!' }}</div>
      </div>
    </div>
    <div class="outfits-wrap">
      <template v-if="loading">
        <n-skeleton
          v-for="item in Array.from({ length: 20 }, (_, idx) => idx)"
          :key="item"
          :sharp="false"
          size="medium"
        />
      </template>
      <OutfitCard
        v-for="(outfit, idx) in clerkOutfits"
        :outfit="outfit"
        :idx="idx"
        :key="outfit._id"
        :change-edit="(id: string) => {}"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';
.clerk-outfit-page {
  .title {
    font-size: 2rem;
    font-weight: bold;
    color: $text-color;

    padding: 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .n-icon {
      cursor: pointer;
    }
  }
  .clerk-info-wrap {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid $border-color;
    .img-wrap {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .clerk-info {
      display: flex;
      flex-direction: column;
      font-size: 1rem;
      font-weight: bold;
      .name {
        color: $text-color;
        font-size: 1.2rem;
      }
      .store {
        color: $text-color;
        transition: 0.2s;
        cursor: pointer;
        // &:hover {
        //   border-bottom: 1px solid $text-color;
        // }
      }
      .introduce {
        border-top: 1px solid $border-color;
        color: $text-color2;
        padding-top: 10px;
        margin-top: 10px;
      }
    }
  }

  .outfits-wrap {
    padding: 2rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    > div {
      width: calc((100% - 4rem) / 5);
      aspect-ratio: 2/3 !important;

      @include xxxxl {
        width: calc((100% - 3rem) / 4);
      }

      @include xxxl {
        width: calc((100% - 2rem) / 3);
      }

      @include md {
        width: calc((100% - 1rem) / 2);
      }

      @include sm {
        width: 100%;
      }

      &.n-skeleton {
        height: auto !important;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, type Ref } from 'vue'
import { useMessage, useLoadingBar } from 'naive-ui'
import { api } from '@/plugins/axios'
import type { IAdmin, IOutfit } from '@/types'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'

import OutfitCard from '@/components/cards/OutfitCard.vue'

const message = useMessage()
const loadingBar = useLoadingBar()
const route = useRoute()
const router = useRouter()

const loading = ref(false)

const {
  adminId,
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

const clerkOutfits = ref<IOutfit[]>([])

/** 取所有穿搭 */
async function getClerkOutfits() {
  if (adminId.value === '') {
    setTimeout(() => {
      getClerkOutfits()
    }, 100)
    return
  }
  try {
    loading.value = true
    const { data } = await api().get(`/outfits/clerk/${adminId.value}`)
    clerkOutfits.value = data.result
    console.log(data)
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  loading.value = false
}

getClerkOutfits()
</script>
