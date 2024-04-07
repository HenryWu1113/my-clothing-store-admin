<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-mask">
        <div class="modal">
          <div class="modal-title">
            <p>使用者資訊</p>
            <n-icon :component="Times" @click="onClose(), addCloseClass()"></n-icon>
          </div>
          <div class="modal-body">
            <div class="avatar-wrap">
              <n-image object-fit="cover" width="120" v-if="user.avatar" :src="user.avatar" />
              <n-image
                object-fit="cover"
                width="120"
                v-else
                :src="`https://source.boringavatars.com/beam/160/${user._id}`"
              />
            </div>
            <div class="info" v-for="info in infoArr" :key="info.key">
              <div>{{ info.title }}</div>
              <div :class="isEmptyString(user[info.key]) === '未填寫' ? 'no-info' : ''">
                {{ isEmptyString(user[info.key]) }}
              </div>
            </div>
            <div class="info">
              <div>創建時間</div>
              <div>{{ formatTime(user.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@import '@/styles/styles';
.modal-mask {
  width: 100vw;
  height: 100vh;
  background: $modal-bg-color;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10000;
  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: $bg-color;
    border-radius: 10px;
    width: 40%;
    animation: onOpen 0.5s ease forwards;
    max-height: 700px;
    overflow: auto;
    &.close {
      animation: onClose 0.5s ease forwards;
    }
    @keyframes onOpen {
      0% {
        top: 70%;
        opacity: 0;
      }
    }
    @keyframes onClose {
      100% {
        top: 70%;
        opacity: 0;
      }
    }
    @include lg {
      width: 50%;
    }
    @include md {
      width: 60%;
    }
    @include sm {
      width: 100%;
      height: 100%;
    }
    .modal-title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem;
      font-size: 20px;
      font-weight: bold;
      color: $text-color;
      > p {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      > .n-icon {
        cursor: pointer;
      }
    }

    .modal-body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      .avatar-wrap {
        height: 120px;
        display: flex;
        justify-content: center;
        .n-image {
          height: 100%;
          border-radius: 50%;
        }
      }
      .info {
        display: flex;
        align-items: center;
        padding: 10px 0;
        > div {
          font-size: 1rem;
          color: $text-color;
          &:first-child {
            font-weight: bold;
            width: 120px;
          }

          &:last-child.no-info {
            color: $text-color2;
          }
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Times } from '@vicons/fa'
import type { IUser, IStore } from '@/types'
import { useMessage } from 'naive-ui'
import { isEmptyString, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'

const message = useMessage()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function as () => any,
    require: true
  },
  user: {
    type: Object as () => IUser | any,
    required: true
  }
})

const infoArr = [
  {
    key: '_id',
    title: '員工 ID'
  },
  {
    key: 'name',
    title: '名稱'
  },
  {
    key: 'account',
    title: '帳號'
  },
  {
    key: 'email',
    title: '信箱'
  },
  {
    key: 'cellphone',
    title: '手機號碼'
  },
  {
    key: 'address',
    title: '地址'
  },
  {
    key: 'disabled',
    title: '帳號狀態'
  },
  {
    key: 'sex',
    title: '性別'
  },
  {
    key: 'birthday',
    title: '生日'
  }
]

/** 跳窗加 class 變更動畫 */
function addCloseClass() {
  const modal: HTMLElement = document.querySelector('.modal')!
  if (!modal) return
  modal.classList.add('close')
}
</script>
