<template>
  <div class="brand-page myContainer min-h-screen">
    <div class="title">
      <p>商城資訊</p>
    </div>
    <div class="brand-wrap">
      <template v-if="page === PAGE.overview">
        <div class="info-wrap">
          <p>商城名稱</p>
          <p>{{ myBrand.name }}</p>
        </div>
        <div class="info-wrap">
          <p>免運金額</p>
          <p>NT. {{ myBrand.freeDeliveryFee }}</p>
        </div>
        <div class="info-wrap">
          <p>運費</p>
          <p>NT. {{ myBrand.deliveryFee }}</p>
        </div>
        <n-button ghost type="info" @click="editBrand()">編輯商城資訊</n-button>
      </template>
      <template v-if="page === PAGE.edit">
        <n-form
          ref="brandFormRef"
          :label-width="80"
          :model="formValue"
          :rules="rules"
          size="medium"
        >
          <div class="card-info-wrap">
            <n-form-item label="商城名稱" path="name">
              <n-input v-model:value="formValue.name" placeholder="請輸入商城名稱"></n-input>
            </n-form-item>
            <n-form-item label="免運金額" path="freeDeliveryFee">
              <n-input-number
                v-model:value="formValue.freeDeliveryFee"
                placeholder="請輸入免運金額"
              ></n-input-number>
            </n-form-item>
            <n-form-item label="運費" path="deliveryFee">
              <n-input-number
                v-model:value="formValue.deliveryFee"
                placeholder="請輸入運費"
              ></n-input-number>
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

.brand-page {
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

  .brand-wrap {
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
import type { IBrand } from '@/types'
import { useMessage, useLoadingBar } from 'naive-ui'
import { Pencil } from '@vicons/ionicons5'
import { api } from '@/plugins/axios'

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
const message = useMessage()

enum PAGE {
  overview = 1,
  edit = 2
}

const brandFormRef = ref<any>(null)

const page = ref(PAGE.overview)
const loading = ref(false)

const myBrand = ref<IBrand>({
  _id: '65e31315dad64d136881ca89',
  name: '',
  deliveryFee: 0,
  freeDeliveryFee: 0,
  updatedAt: '',
  createdAt: ''
})

/** 編輯商城的資訊 */
const formValue = ref({
  _id: '',
  name: '',
  deliveryFee: 0,
  freeDeliveryFee: 0,
  loading: false
})

const rules = {}

function resetForm() {
  page.value = PAGE.overview
  formValue.value = {
    _id: '',
    name: '',
    deliveryFee: 0,
    freeDeliveryFee: 0,
    loading: false
  }
}

/** 取所有訂單 */
async function getMyBrand() {
  try {
    loading.value = true
    const { data } = await api('auth').get('/brands/65e31315dad64d136881ca89')
    myBrand.value = data.result
    console.log(myBrand.value)
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  loading.value = false
}
getMyBrand()

/**
 * 編輯訂單資訊
 * @param _id 訂單 _id
 */
function editBrand() {
  page.value = PAGE.edit

  for (const key in formValue.value) {
    // @ts-ignore
    if (myBrand.value[key] !== null || myBrand.value[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = myBrand.value[key]
    }
  }

  console.log(formValue.value)
}

/** 編輯商城送 api */
async function submitForm() {
  formValue.value.loading = true
  const formObj: any = {}
  for (const key in formValue.value) {
    if (['_id', 'loading'].includes(key)) continue
    // @ts-ignore
    else if (formValue.value[key] !== undefined && formValue.value[key] !== '') {
      // @ts-ignore
      formObj[key] = formValue.value[key]
    }
  }

  try {
    await api('auth').patch(`/brands/${formValue.value._id}`, formObj)
    message.success('更新訂單資訊成功')

    getMyBrand()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

function handleValidateClick(e: MouseEvent) {
  e.preventDefault()
  brandFormRef.value?.validate(async (errors: any) => {
    if (!errors) {
      submitForm()
    } else {
      message.error('不符合驗證')
    }
  })
}
</script>
