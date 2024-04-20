<template>
  <div class="login-page">
    <div class="login-wrap">
      <div class="modal-title">
        <p>後台登入</p>
      </div>
      <div class="modal-body">
        <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
          <n-form-item label="帳號" path="account">
            <n-input v-model:value="formValue.account" placeholder="請輸入帳號" />
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
</template>

<style scoped lang="scss">
@import '@/styles/styles.scss';
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgb(223, 223, 223);
  .login-wrap {
    width: 500px;
    border: 1px solid gray;
    border-radius: 10px;
    background: rgb(117, 117, 117);
    .modal-title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }

    .modal-body {
      padding: 10px;
      .n-button {
        --n-width: 100% !important;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Times } from '@vicons/fa'
import { useMessage } from 'naive-ui'
import { isEmail } from 'validator'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { api } from '@/plugins/axios'

const message = useMessage()
const admin = useAdminStore()

const formRef = ref<any>(null)

const formValue = ref({
  account: '',
  password: ''
})

const rules = {
  account: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('帳號必填')
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
      admin
        .login(formValue.value)
        .then(() => {
          message.success('登入成功')
        })
        .catch((error: any) => {
          console.log(error)
          message.error(
            error.isAxiosError && error?.response?.data ? error.response.data.message : '發生錯誤'
          )
        })
    } else {
      message.error('不符合驗證')
    }
  })
}
</script>
