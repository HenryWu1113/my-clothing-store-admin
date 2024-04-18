<template>
  <div class="outfit-card" :style="amimationDelay">
    <img :src="outfit.images[0]" />
    <div class="bottom">
      <p :title="outfit.outfitName">{{ stringEllipsis(outfit.outfitName, 6) }}</p>
      <n-icon :component="Pencil" @click="editOutfit(outfit._id)"></n-icon>
      <n-icon class="delete" :component="TrashOutline" @click="clickDelete()"></n-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.outfit-card {
  border: 1px solid $border-color;
  overflow: hidden;
  position: relative;
  @extend %AshowEffect;
  &:hover {
    > img {
      transform: scale(1.1);
    }
    .bottom {
      bottom: 0;
    }
  }
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: 0.3s;
  }
  .bottom {
    position: absolute;
    bottom: -10%;
    left: 0;
    width: 100%;
    height: 10%;
    background: rgba(0, 0, 0, 0.5);
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 1rem;
    gap: 0.8rem;
    > p {
      color: white;
      font-size: 1.2rem;
      margin-right: auto;
    }
    .n-icon {
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      &.delete {
        color: red;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { IOutfit } from '@/types'
import { formatTime, stringEllipsis } from '@/composables'
import { useRouter } from 'vue-router'
import { Pencil, TrashOutline } from '@vicons/ionicons5'
import { useDialog, useMessage } from 'naive-ui'
import { api } from '@/plugins/axios'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()

const props = defineProps({
  outfit: {
    type: Object as () => IOutfit,
    required: true
  },
  idx: {
    type: Number,
    required: true
  },
  editOutfit: {
    type: Function,
    required: true
  },
  getClerkOutfits: {
    type: Function,
    required: true
  }
})

/** 刪除穿搭 */
async function deleteOutfit() {
  try {
    await api('auth').delete(`/outfits/${props.outfit._id}`)
    props.getClerkOutfits()
    message.success('刪除成功')
  } catch (error) {
    message.error('刪除失敗')
  }
}

/**
 * 點擊 dropdown
 * @param key
 */
function clickDelete() {
  const d = dialog.warning({
    title: '警告',
    content: '確認刪除穿搭?',
    positiveText: '確認',
    negativeText: '取消',
    onPositiveClick: () => {
      d.loading = true
      return deleteOutfit()
    }
  })
}

const amimationDelay = computed(() => {
  return { animationDelay: `${props.idx * 0.1}s` }
})
</script>
