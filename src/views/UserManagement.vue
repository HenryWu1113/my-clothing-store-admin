<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'user-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增使用者帳號</n-button
        >
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue()"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="staff-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="暱稱" path="name">
          <n-input v-model:value="formValue.name" placeholder="請輸入暱稱" clearable />
        </n-form-item>
        <n-form-item label="信箱(使用者帳號)" path="email">
          <n-input
            v-model:value="formValue.email"
            :disabled="formValue._id !== ''"
            placeholder="請輸入信箱"
            clearable
          />
        </n-form-item>
        <n-form-item v-if="formValue._id === ''" label="密碼" path="password">
          <n-input v-model:value="formValue.password" placeholder="請輸入密碼" clearable />
        </n-form-item>
        <n-form-item label="地址" path="address">
          <n-input v-model:value="formValue.address" placeholder="請輸入地址" clearable />
        </n-form-item>
        <n-form-item label="生日" path="birthday">
          <n-date-picker
            v-model:formatted-value="formValue.birthday"
            value-format="yyyy-MM-dd"
            type="date"
            clearable
          />
        </n-form-item>
        <n-form-item label="電話" path="cellphone">
          <n-input v-model:value="formValue.cellphone" placeholder="請輸入電話" clearable />
        </n-form-item>
        <n-form-item label="帳號禁用" path="disabled">
          <n-switch v-model:value="formValue.disabled" />
        </n-form-item>
        <n-form-item label="性別" path="sex">
          <n-radio-group v-model:value="formValue.sex" name="sex">
            <n-space>
              <n-radio value="男" label="男" />
              <n-radio value="女" label="女" />
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item>
          <n-button
            strong
            type="tertiary"
            attr-type="submit"
            :loading="formValue.loading"
            @click="handleValidateClick"
            >確認</n-button
          >
        </n-form-item>
      </n-form>
    </div>
    <MydataTable
      v-if="currentPage === Page.overview"
      :tableData="users"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td4="{ value }">
        <div>
          <n-tag size="large" v-if="value" type="error"> 禁用 </n-tag>
          <n-tag size="large" v-else type="success"> 正常 </n-tag>
        </div>
      </template>
      <template #td5="{ value }">
        <div>{{ formatTime(value) }}</div>
      </template>
      <template #td6="{ value }">
        <div class="edit-wrap">
          <n-button type="warning" ghost @click="goDetail(value)">檢視</n-button>
          <n-button type="info" ghost @click="editUser(value)"> 編輯 </n-button>
        </div>
      </template>
    </MydataTable>
    <UserModal :isOpen="isOpen" :onClose="onClose(resetUserDetail)" :user="userDetail" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.user-management-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .n-icon {
    font-size: 2rem;
    cursor: pointer;
    color: $text-color;
  }

  // table ----------
  :deep(.n-carousel) {
    --n-arrow-color: gray !important;

    .n-carousel__arrow {
      background-color: rgba(255, 255, 255, 0.8);
    }

    img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
  }

  .edit-wrap {
    gap: 5px;
  }

  // 設定 ----------
  .staff-setting-wrap {
    border: 1px solid $border-color;
    padding: 1rem;
    .n-form-item {
      --n-label-font-size: 1rem !important;
      .n-input-number {
        width: 100%;
      }

      &.images-wrap {
        :deep(.n-form-item-blank) {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: flex-start;
          align-items: flex-start;

          input[type='file'] {
            display: none;
          }

          .n-image {
            width: 100px;
            height: 100px;
          }
        }
      }
    }

    :deep(.ql-container) {
      height: 300px !important;
    }
  }
}
</style>

<script setup lang="ts">
import { ref, h, computed, onMounted, watch, nextTick, type Ref } from 'vue'
import { NButton } from 'naive-ui'
import { ArrowUndoOutline } from '@vicons/ionicons5'
import { PictureTwotone } from '@vicons/antd'
import { useMessage, useDialog } from 'naive-ui'
import { api } from '@/plugins/axios'
import type { IUser, IStore } from '@/types'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'
import { useUserModalStore } from '@/stores/useUserModalStore'
import moment from 'moment'

import '@vueup/vue-quill/dist/vue-quill.snow.css'

import TitleBar from '@/components/TitleBar.vue'
import MydataTable from '@/components/dataTable/dataTable.vue'
import UserModal from '@/components/modals/UserModal.vue'

const { onOpen, onClose } = useUserModalStore()
const { isOpen } = storeToRefs(useUserModalStore())

const message = useMessage()
const dialog = useDialog()

enum Page {
  overview = '1',
  edit = '2'
}

const currentPage: Ref<'1' | '2'> = ref(Page.overview)

/** 生成圖表框架的設定 */
const tableSetting: Ref<{
  isLoading: boolean
  tableMinWidth: number
  tableColumnWidth: number[]
  tableSetting: { order: number; key: string; title: string; sortable: boolean }[]
}> = ref({
  isLoading: false,
  tableMinWidth: 800,
  tableColumnWidth: [],
  tableSetting: [
    {
      order: 1,
      key: '_id',
      title: '_id',
      sortable: true
    },
    {
      order: 2,
      key: 'name',
      title: '名稱',
      sortable: true
    },
    {
      order: 3,
      key: 'email',
      title: '信箱',
      sortable: true
    },
    {
      order: 4,
      key: 'disabled',
      title: '帳號狀態',
      sortable: true
    },
    {
      order: 5,
      key: 'createdAt',
      title: '創建時間',
      sortable: true
    },
    {
      order: 6,
      key: '_id',
      title: '',
      sortable: false
    }
  ]
})

/** 所有使用者 */
const users: Ref<IUser[]> = ref([])

/** 取所有使用者 */
async function getAllUser() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api('auth').get('/users/all')
    console.log(data)
    users.value = data.result
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllUser()

// 表單 --------------------

const formRef = ref<any>(null)

/** 使用者詳細資訊 */
const userDetail = ref<IUser>({
  _id: '',
  disabled: false,
  email: '',
  updatedAt: '',
  createdAt: ''
})

/** 編輯使用者的資訊 */
const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  name: '',
  account: '',
  password: '',
  address: '',
  birthday: null,
  cellphone: '',
  disabled: false,
  email: '',
  sex: '',
  loading: false
})

const rules = {
  // name: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('商品名稱必填')
  //     }
  //     return true
  //   }
  // },
  // colors: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('至少需要一種顏色')
  //     }
  //     return true
  //   }
  // },
  // sizes: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('至少需要一種尺寸')
  //     }
  //     return true
  //   }
  // },
  // tags: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('至少需要一個標籤')
  //     }
  //     return true
  //   }
  // },
  // sell: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value && formValue.value.stockQuantity == 0) {
  //       return new Error('沒有庫存禁止上架')
  //     }
  //     return true
  //   }
  // }
  // description: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('商品描述必填')
  //     }
  //     return true
  //   }
  // }
}

/**
 * 編輯員工資訊
 * @param _id 使用者 _id
 */
function editUser(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = users.value.findIndex((item: any) => item._id === _id)

  const selectedStaff = users.value[idx]

  console.log(selectedStaff)

  for (const key in formValue.value) {
    // @ts-ignore
    if (selectedStaff[key] !== null || selectedStaff[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = selectedStaff[key]
    }
  }

  console.log(formValue.value)
}

/** 重製 formValue */
function resetFormValue() {
  formValue.value = {
    _id: '',
    name: '',
    account: '',
    password: '',
    address: '',
    birthday: null,
    cellphone: '',
    disabled: false,
    email: '',
    height: 0,
    weight: 0,
    introduce: '',
    role: 'clerk',
    sex: '',
    store: '',
    loading: false
  }
}

/** 重製 userDetail */
function resetUserDetail() {
  userDetail.value = {
    _id: '',
    disabled: false,
    email: '',
    updatedAt: '',
    createdAt: ''
  }
}

/** 新增編輯使用者送 api */
async function submitForm() {
  formValue.value.loading = true
  const formObj: any = {}
  for (const key in formValue.value) {
    if (['_id', 'loading'].includes(key)) continue
    else if (formValue.value[key] !== undefined && formValue.value[key] !== '') {
      formObj[key] = formValue.value[key]
    }
  }

  try {
    if (formValue.value._id.length === 0) {
      await api('auth').post('/users', formObj)

      message.success('新增使用者成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/users/manager/${formValue.value._id}`, formObj)
      message.success('更新使用者資訊成功')
    }
    getAllUser()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯使用者資訊時的格式確認
 * @param e 點擊事件
 */
const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      console.log(formValue.value)
      submitForm()
    } else {
      message.error('不符合驗證')
    }
  })
}

/**
 * 檢視使用者資訊
 * @param _id 使用者 _id
 */
async function goDetail(_id: string) {
  const idx = users.value.findIndex((item) => item._id === _id)
  if (idx === -1) return
  userDetail.value = users.value[idx]
  onOpen()
  console.log(userDetail.value)
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '使用者管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯使用者資訊'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增使用者資訊'
  else return '錯誤頁'
})
</script>
