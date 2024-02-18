<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-mask">
      <div class="modal">
        <div class="modal-title">
          <p>登入</p>
          <n-icon :component="Times" @click="onClose"></n-icon>
        </div>
        <div class="modal-body">
          <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
            <n-form-item label="電子郵件信箱" path="email">
              <n-input v-model:value="formValue.email" placeholder="請輸入電子郵件信箱" />
            </n-form-item>
            <n-form-item label="密碼" path="password">
              <n-input
                type="password"
                v-model:value="formValue.password"
                placeholder="請輸入密碼"
                show-password-on="click"
              />
            </n-form-item>
            <n-form-item>
              <n-button strong type="tertiary" attr-type="submit" @click="handleValidateClick"
                >登入</n-button
              >
            </n-form-item>
          </n-form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@import '@/styles/styles';
.modal-mask {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: $light;
    border-radius: 10px;
    width: 40%;
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
      font-size: 18px;
      font-weight: bold;
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
      border-top: 1px solid $light1;
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
import { useMessage } from 'naive-ui'
import { isEmail, isMobilePhone } from 'validator'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { api } from '@/plugins/axios'

const message = useMessage()
const user = useAdminStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function as () => any,
    require: true
  }
})

const formRef = ref<any>(null)

const formValue = ref({
  email: '',
  password: ''
})

const rules = {
  email: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('電子郵件信箱必填')
      } else if (!isEmail(value)) {
        return new Error('電子郵件信箱格式錯誤')
      }
      return true
    }
  },
  password: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('密碼必填')
      } else if (value.length < 6) {
        return new Error('密碼請大於六碼')
      } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
        return new Error('密碼格式錯誤')
      }
      return true
    }
  }
}

const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      // user
      //   .login(formValue.value)
      //   .then(() => {
      //     message.success('登入成功')
      //     props.onClose()
      //   })
      //   .catch((error: any) => {
      //     console.log(error)
      //     message.error(
      //       error.isAxiosError && error?.response?.data ? error.response.data.message : '發生錯誤'
      //     )
      //   })
    } else {
      message.error('不符合驗證')
    }
  })
}
</script>
