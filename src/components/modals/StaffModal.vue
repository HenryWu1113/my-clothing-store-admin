<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-mask">
        <div class="modal">
          <div class="modal-title">
            <p>{{ staff._id }}</p>
            <n-icon :component="Times" @click="onClose(), addCloseClass()"></n-icon>
          </div>
          <div class="modal-body"></div>
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
      .n-button {
        --n-width: 100% !important;
      }
    }

    .modal-footer {
      color: $text-color;
      border-top: 1px solid $border-color;
      padding: 10px;
      .quick-login {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        .n-icon {
          font-size: 2rem;
          cursor: pointer;
        }
      }

      .goto-login {
        display: flex;
        justify-content: flex-end;
        > p {
          font-size: 1rem;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { LogoGoogle, LogoFacebook, LogoGithub } from '@vicons/ionicons5'
import { Times } from '@vicons/fa'
import type { IAdmin, IStore } from '@/types'
import { useMessage } from 'naive-ui'
import { isEmail, isMobilePhone } from 'validator'
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
  staff: {
    type: Object as () => IAdmin,
    required: true
  }
})

/** 跳窗加 class 變更動畫 */
function addCloseClass() {
  const modal: HTMLElement = document.querySelector('.modal')!
  if (!modal) return
  modal.classList.add('close')
}
</script>
