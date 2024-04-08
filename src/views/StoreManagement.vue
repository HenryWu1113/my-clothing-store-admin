<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'store-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增店鋪</n-button
        >
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue()"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="store-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="店名" path="name">
          <n-input v-model:value="formValue.name" placeholder="請輸入店名" clearable />
        </n-form-item>
        <n-form-item label="電話" path="phone">
          <n-input v-model:value="formValue.phone" placeholder="請輸入電話" clearable />
        </n-form-item>
        <n-form-item label="地址" path="address">
          <n-input v-model:value="formValue.address" placeholder="請輸入地址" clearable />
        </n-form-item>
        <n-form-item label="地區" path="position">
          <n-select v-model:value="formValue.position" :options="positionOptions" />
        </n-form-item>
        <n-form-item label="Google Map 地址" path="googleMapAddress">
          <n-input
            v-model:value="formValue.googleMapAddress"
            placeholder="請輸入 Google Map 地址"
            clearable
          />
        </n-form-item>
        <n-form-item label="營業時間" path="openingTime">
          <n-input
            type="textarea"
            v-model:value="formValue.openingTime"
            placeholder="請輸入營業時間"
            clearable
          />
        </n-form-item>
        <n-form-item label="販售系列" path="sellSeries">
          <n-checkbox-group v-model:value="formValue.sellSeries">
            <n-space item-style="display: flex;">
              <n-checkbox
                v-for="series in sellSeriesOptions"
                :value="series.value"
                :label="series.label"
                :key="series.value"
              />
            </n-space>
          </n-checkbox-group>
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
      :tableData="stores"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td6="{ value }">
        <div :title="value.map((item: any) => item.name).join('、')">
          {{ value.map((item: any) => item.name).join('、') }}
        </div>
      </template>
      <template #td7="{ value }">
        <div class="edit-wrap">
          <n-button type="info" ghost @click="editUser(value)"> 編輯 </n-button>
        </div>
      </template>
    </MydataTable>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.store-management-page {
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
  .store-setting-wrap {
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
import type { IStore } from '@/types'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'
import { useUserModalStore } from '@/stores/useUserModalStore'
import moment from 'moment'

import '@vueup/vue-quill/dist/vue-quill.snow.css'

import TitleBar from '@/components/TitleBar.vue'
import MydataTable from '@/components/dataTable/dataTable.vue'

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
      key: 'name',
      title: '店名',
      sortable: true
    },
    {
      order: 2,
      key: 'position',
      title: '地區',
      sortable: true
    },
    {
      order: 3,
      key: 'phone',
      title: '電話',
      sortable: false
    },
    {
      order: 4,
      key: 'address',
      title: '地址',
      sortable: true
    },
    {
      order: 5,
      key: 'openingTime',
      title: '營業時間',
      sortable: true
    },
    {
      order: 6,
      key: 'sellSeries',
      title: '販售系列',
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

/** 所有店鋪 */
const stores: Ref<IStore[]> = ref([])
/** 地區選項 */
const positionOptions = [
  { value: '北', label: '北' },
  { value: '中', label: '中' },
  { value: '南', label: '南' },
  { value: '東', label: '東' }
]
/** 所有販售系列選項 */
const sellSeriesOptions = ref<{ value: string; label: string }[]>([])

/** 取所有店鋪 */
async function getAllStore() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api().get('/stores')
    console.log(data)
    stores.value = data.result
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllStore()

/** 取所有販售系列 */
async function getSellSeries() {
  try {
    const { data } = await api().get('/categories')
    console.log(data)
    sellSeriesOptions.value = data.result
      .filter((item: any) => item.categoryType === 'clothingPart')
      .map((item: any) => ({
        value: item._id,
        label: item.name
      }))
    console.log(sellSeriesOptions.value)
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
}

getSellSeries()
// 表單 --------------------

const formRef = ref<any>(null)

/** 編輯店鋪的資訊 */
const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  name: '',
  phone: '',
  address: '',
  position: '北',
  googleMapAddress: '',
  openingTime: '',
  sellSeries: [],
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
 * 編輯店鋪資訊
 * @param _id 店鋪 _id
 */
function editUser(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = stores.value.findIndex((item: any) => item._id === _id)

  const selectedStore = stores.value[idx]

  console.log(selectedStore)

  for (const key in formValue.value) {
    if (key === 'sellSeries') {
      formValue.value[key] = selectedStore[key].map((item) => item._id)
    }
    // @ts-ignore
    else if (selectedStore[key] !== null || selectedStore[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = selectedStore[key]
    }
  }

  console.log(formValue.value)
}

/** 重製 formValue */
function resetFormValue() {
  formValue.value = {
    _id: '',
    name: '',
    phone: '',
    address: '',
    position: '北',
    googleMapAddress: '',
    openingTime: '',
    sellSeries: [],
    loading: false
  }
}

/** 新增編輯店鋪送 api */
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
      await api('auth').post('/stores', formObj)

      message.success('新增店鋪成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/stores/${formValue.value._id}`, formObj)
      message.success('更新店鋪資訊成功')
    }
    getAllStore()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯店鋪資訊時的格式確認
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

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '店鋪管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯店鋪資訊'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增店鋪資訊'
  else return '錯誤頁'
})
</script>
