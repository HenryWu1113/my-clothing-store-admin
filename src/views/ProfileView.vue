<template>
  <div class="profile-page myContainer min-h-screen">
    <div class="title">
      <p>個人資訊</p>
    </div>
    <div class="profile-wrap">
      <template v-if="page === PAGE.overview">
        <div class="avatar-wrap">
          <n-image width="200" v-if="avatar.length" :src="avatar" object-fit="cover" />
          <label for="userAvatar" class="btn">
            <n-icon :component="Pencil"></n-icon>
          </label>
          <InputImage id="userAvatar" @update-single="imageUpdate" />
        </div>
        <div class="info-wrap">
          <p>帳號</p>
          <p :class="account.length === 0 ? 'empty' : ''">{{ isEmptyString(account) }}</p>
        </div>
        <div class="info-wrap">
          <p>稱謂</p>
          <p :class="name.length === 0 ? 'empty' : ''">{{ isEmptyString(name) }}</p>
        </div>
        <div class="info-wrap">
          <p>性別</p>
          <p :class="sex.length === 0 ? 'empty' : ''">{{ isEmptyString(sex) }}</p>
        </div>
        <div class="info-wrap">
          <p>生日</p>
          <p :class="birthday.length === 0 ? 'empty' : ''">{{ isEmptyString(birthday) }}</p>
        </div>
        <div class="info-wrap">
          <p>身高</p>
          <p :class="height.length === 0 ? 'empty' : ''">{{ isEmptyString(height) }} cm</p>
        </div>
        <div class="info-wrap">
          <p>體重</p>
          <p :class="weight.length === 0 ? 'empty' : ''">{{ isEmptyString(weight) }} kg</p>
        </div>
        <div class="info-wrap">
          <p>地址</p>
          <p :class="address.length === 0 ? 'empty' : ''">{{ isEmptyString(address) }}</p>
        </div>
        <div class="info-wrap">
          <p>電話</p>
          <p :class="cellphone.length === 0 ? 'empty' : ''">{{ isEmptyString(cellphone) }}</p>
        </div>
        <div class="info-wrap">
          <p>店鋪</p>
          <p :class="store.length === 0 ? 'empty' : ''">{{ isEmptyString(store) }}</p>
        </div>
        <div class="info-wrap">
          <p>信箱</p>
          <p :class="email.length === 0 ? 'empty' : ''">{{ isEmptyString(email) }}</p>
        </div>
        <div class="info-wrap">
          <p>自我介紹</p>
          <p :class="introduce.length === 0 ? 'empty' : ''">{{ isEmptyString(introduce) }}</p>
        </div>
        <n-button ghost type="info" @click="page = PAGE.edit">編輯個人資訊</n-button>
      </template>
      <template v-if="page === PAGE.edit">
        <n-form ref="userFormRef" :label-width="80" :model="userForm" :rules="rules" size="medium">
          <div class="card-info-wrap">
            <n-form-item label="暱稱" path="name">
              <n-input v-model:value="userForm.name" placeholder="請輸入暱稱"></n-input>
            </n-form-item>
            <n-form-item label="性別" path="sex">
              <n-radio-group v-model:value="userForm.sex" name="sexGroup">
                <n-space>
                  <n-radio value="男" label="男" />
                  <n-radio value="女" label="女" />
                </n-space>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="生日" path="birthday">
              <n-date-picker
                v-model:formatted-value="userForm.birthday"
                value-format="yyyy-MM-dd"
                type="date"
              />
            </n-form-item>
            <n-form-item label="身高" path="height">
              <n-input-number v-model:value="userForm.height" placeholder="請輸入身高" />
            </n-form-item>
            <n-form-item label="體重" path="weight">
              <n-input-number v-model:value="userForm.weight" placeholder="請輸入體重" />
            </n-form-item>
            <n-form-item label="地址" path="address">
              <n-input v-model:value="userForm.address" placeholder="請輸入地址"></n-input>
            </n-form-item>
            <n-form-item label="電話" path="cellphone">
              <n-input v-model:value="userForm.cellphone" placeholder="請輸入電話"></n-input>
            </n-form-item>
            <n-form-item label="信箱" path="email">
              <n-input v-model:value="userForm.email" placeholder="請輸入信箱"></n-input>
            </n-form-item>
            <n-form-item label="自我介紹" path="introduce">
              <n-input
                type="textarea"
                v-model:value="userForm.introduce"
                placeholder="請輸入自我介紹"
              ></n-input>
            </n-form-item>
          </div>
        </n-form>
        <n-space>
          <n-button :loading="loading" ghost @click="resetForm()">取消編輯</n-button>
          <n-button :loading="loading" ghost type="info" @click="handleValidateClick"
            >儲存</n-button
          >
        </n-space>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .title {
    font-size: 2rem;
    font-weight: bold;
    color: $text-color;
    border-bottom: 1px solid $border-color;
    padding: 2rem 0 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profile-wrap {
    border: 1px solid $border-color;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: $text-color;

    .avatar-wrap {
      width: 200px;
      height: 200px;
      position: relative;
      > .n-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }

      > label {
        position: absolute;
        right: 0;
        bottom: 0;
        .n-icon {
          color: $text-color;
          font-size: 1.2rem;
          cursor: pointer;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }

    .info-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 1rem;
      > p {
        &:first-child {
          font-weight: bold;
        }
        &:last-child.empty {
          color: $text-color2;
        }
      }
    }

    .n-form {
      .n-form-item {
        --n-label-font-size: 1rem !important;
        .n-input,
        .n-input-number,
        .n-date-picker {
          --n-font-size: 1rem !important;
          width: 250px;
        }
      }
    }

    .n-button {
      width: 200px;
    }
  }
}
</style>
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { isEmptyString } from '@/composables'
import { useMessage, useLoadingBar } from 'naive-ui'
import { Pencil } from '@vicons/ionicons5'
import { api } from '@/plugins/axios'

import InputImage from '@/components/InputImage.vue'

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
const { editAdmin, editAdminImage } = useAdminStore()
const message = useMessage()
const loadingBar = useLoadingBar()

enum PAGE {
  overview = 1,
  edit = 2
}

const userFormRef = ref<any>(null)

const page = ref(PAGE.overview)
const loading = ref(false)

const userForm = ref({
  name: name.value,
  sex: sex.value,
  birthday: birthday.value.length === 0 ? null : birthday.value,
  height: height.value,
  weight: weight.value,
  address: address.value,
  cellphone: cellphone.value,
  email: email.value,
  introduce: introduce.value
})

const rules = {}

function resetForm() {
  page.value = PAGE.overview
  userForm.value = {
    name: name.value,
    sex: sex.value,
    birthday: birthday.value.length === 0 ? null : birthday.value,
    height: height.value,
    weight: weight.value,
    address: address.value,
    cellphone: cellphone.value,
    email: email.value,
    introduce: introduce.value
  }
}

function handleValidateClick(e: MouseEvent) {
  e.preventDefault()
  userFormRef.value?.validate(async (errors: any) => {
    if (!errors) {
      try {
        loading.value = true
        const data: { [key: string]: string } = {}
        for (const [key, value] of Object.entries(userForm.value)) {
          if (value && value !== '') {
            data[key] = value
          }
        }
        console.log(data)
        await editAdmin(data)
        loading.value = false
        message.success('編輯成功')
        page.value = PAGE.overview
      } catch (error: any) {
        error.isAxiosError && error?.response?.data
          ? message.error(error?.response?.data?.message)
          : message.error('編輯失敗')
        loading.value = false
      }
    }
  })
}

async function imageUpdate(obj: { image: File | null; previewImage: string }) {
  console.log(obj)
  if (obj.image === null) return
  try {
    loadingBar.start()
    await editAdminImage(obj.image, 'avatar')
    loadingBar.finish()
    message.success('編輯成功')
  } catch (error: any) {
    error.isAxiosError && error?.response?.data
      ? message.error(error?.response?.data?.message)
      : message.error('編輯失敗')
    loadingBar.error()
  }
}
</script>
