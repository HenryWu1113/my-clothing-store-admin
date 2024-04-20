<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'staff-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增員工帳號</n-button
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
        <n-form-item label="名稱" path="name">
          <n-input v-model:value="formValue.name" placeholder="請輸入名稱" clearable />
        </n-form-item>
        <n-form-item label="帳號" path="account">
          <n-input v-model:value="formValue.account" placeholder="請輸入帳號" clearable />
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
        <n-form-item label="信箱" path="email">
          <n-input v-model:value="formValue.email" placeholder="請輸入信箱" clearable />
        </n-form-item>
        <n-form-item label="身高" path="height">
          <n-input-number v-model:value="formValue.height" placeholder="請輸入身高" :min="0">
          </n-input-number>
        </n-form-item>
        <n-form-item label="體重" path="weight">
          <n-input-number v-model:value="formValue.weight" placeholder="請輸入身高" :min="0">
          </n-input-number>
        </n-form-item>
        <n-form-item label="性別" path="sex">
          <n-radio-group v-model:value="formValue.sex" name="sex">
            <n-space>
              <n-radio value="男" label="男" />
              <n-radio value="女" label="女" />
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="自我介紹" path="introduce">
          <n-input
            v-model:value="formValue.introduce"
            type="textarea"
            placeholder="請輸入自我介紹"
            clearable
          />
        </n-form-item>
        <n-form-item label="店鋪" path="store">
          <n-select v-model:value="formValue.store" :options="storesOption" />
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
      :tableData="staffs"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td5="{ value }">
        <div>
          <n-tag size="large" v-if="value" type="error"> 禁用 </n-tag>
          <n-tag size="large" v-else type="success"> 正常 </n-tag>
        </div>
      </template>
      <template #td6="{ value }">
        <div>{{ formatTime(value) }}</div>
      </template>
      <template #td7="{ value }">
        <div class="edit-wrap">
          <n-button type="warning" ghost @click="goDetail(value)">檢視</n-button>
          <n-button type="info" ghost @click="editStaff(value)"> 編輯 </n-button>
        </div>
      </template>
    </MydataTable>
    <StaffModal :isOpen="isOpen" :onClose="onClose(resetStaffDetail)" :staff="staffDetail" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.staff-management-page {
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
import type { IAdmin, IStore } from '@/types'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'
import { useStaffModalStore } from '@/stores/useStaffModalStore'
import moment from 'moment'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import TitleBar from '@/components/TitleBar.vue'
import MydataTable from '@/components/dataTable/dataTable.vue'
import StaffModal from '@/components/modals/StaffModal.vue'

const { onOpen, onClose } = useStaffModalStore()
const { isOpen } = storeToRefs(useStaffModalStore())

const message = useMessage()
const dialog = useDialog()

/** 改 IAdmin 的 store 屬性 */
type formatIAdmin = Omit<IAdmin, 'store'> & {
  store: string
}

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
  tableMinWidth: 1000,
  tableColumnWidth: [20, 10, 10, 20, 10, 15, 15],
  tableSetting: [
    {
      order: 1,
      key: '_id',
      title: '_id',
      sortable: true
    },
    {
      order: 2,
      key: 'account',
      title: '帳號',
      sortable: true
    },
    {
      order: 3,
      key: 'name',
      title: '名稱',
      sortable: true
    },
    {
      order: 4,
      key: 'email',
      title: '信箱',
      sortable: true
    },
    {
      order: 5,
      key: 'disabled',
      title: '帳號狀態',
      sortable: true
    },
    {
      order: 6,
      key: 'createdAt',
      title: '創建時間',
      sortable: true
    },
    {
      order: 7,
      key: '_id',
      title: '',
      sortable: false
    }
  ]
})

/** 所有員工 */
const staffs: Ref<IAdmin[]> = ref([])
/** 所有店鋪選項 */
const storesOption = ref<{ value: string; label: string }[]>([])

/** 取所有員工 */
async function getAllStaff() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api('auth').get('/admins/all')
    console.log(data)
    staffs.value = [...data.result]
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllStaff()

/** 取所有店鋪 */
async function getStores() {
  try {
    const { data } = await api().get('/stores')
    console.log(data)
    storesOption.value = data.result.map((item: any) => ({
      value: item._id,
      label: item.name
    }))
    console.log(storesOption.value)
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
}

getStores()
// 表單 --------------------

const formRef = ref<any>(null)

/** 員工詳細資訊 */
const staffDetail = ref<IAdmin>({
  _id: '',
  account: '',
  disabled: false,
  email: '',
  name: '',
  role: 'clerk',
  sex: '男',
  store: {
    _id: '',
    name: '',
    phone: '',
    address: '',
    position: '',
    googleMapAddress: '',
    openingTime: '',
    sellSeries: [],
    updatedAt: '',
    createdAt: ''
  },
  updatedAt: '',
  createdAt: ''
})

/** 編輯員工的資訊 */
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
  height: 0,
  weight: 0,
  introduce: '',
  role: 'clerk',
  sex: '',
  store: '',
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
 * @param _id 員工 _id
 */
function editStaff(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = staffs.value.findIndex((item: any) => item._id === _id)

  const selectedStaff = staffs.value[idx]

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

/** 重製 staffDetail */
function resetStaffDetail() {
  staffDetail.value = {
    _id: '',
    account: '',
    disabled: false,
    email: '',
    name: '',
    role: 'clerk',
    sex: '男',
    store: {
      _id: '',
      name: '',
      phone: '',
      address: '',
      position: '',
      googleMapAddress: '',
      openingTime: '',
      sellSeries: [],
      updatedAt: '',
      createdAt: ''
    },
    updatedAt: '',
    createdAt: ''
  }
}
/** 新增編輯員工送 api */
async function submitForm() {
  formValue.value.loading = true
  const formObj: any = {}
  for (const key in formValue.value) {
    if (['_id', 'loading'].includes(key)) continue
    else if (formValue.value[key] !== undefined && formValue.value[key] !== '') {
      if (['height', 'weight'].includes(key) && formValue.value[key] === 0) continue
      formObj[key] = formValue.value[key]
    }
  }

  try {
    if (formValue.value._id.length === 0) {
      await api('auth').post('/admins', formObj)

      message.success('新增員工成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/admins/manager/${formValue.value._id}`, formObj)
      message.success('更新員工資訊成功')
    }
    getAllStaff()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯員工資訊時的格式確認
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
 * 檢視員工資訊
 * @param _id 員工 _id
 */
async function goDetail(_id: string) {
  try {
    const { data } = await api().get(`/admins/clerk/${_id}`)
    console.log(data)
    staffDetail.value = data.result
    onOpen()
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  console.log(staffDetail.value)
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '員工管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯員工資訊'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增員工資訊'
  else return '錯誤頁'
})
</script>
