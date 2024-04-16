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
        <div v-if="currentPage === Page.overview" class="selection-wrap">
          <n-select v-model:value="selectType" :options="categoryTypeOptions" />
          <n-button @click="currentPage = Page.edit">新增分類</n-button>
        </div>
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue()"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="store-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="Key" path="key">
          <n-color-picker
            v-if="formValue.categoryType === 'color'"
            :default-value="formValue.key"
            :modes="['hex']"
            @update:value="updateColor"
          />
          <n-input v-else v-model:value="formValue.key" placeholder="請輸入 key" clearable />
        </n-form-item>
        <n-form-item label="名稱" path="name">
          <n-input v-model:value="formValue.name" placeholder="請輸入名稱" clearable />
        </n-form-item>
        <n-form-item label="適用性別" path="gender">
          <n-select v-model:value="formValue.gender" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="類別" path="categoryType">
          <n-select
            :disabled="formValue._id !== ''"
            v-model:value="formValue.categoryType"
            :options="categoryTypeOptions"
          />
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
      :tableData="filterCategories"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template v-if="selectType === 'color'" #td2="{ value }">
        <div class="color-wrap">
          <div :style="{ background: value }"></div>
        </div>
      </template>
      <template #td4="{ value }">
        <div>
          {{ categoryName(value) }}
        </div>
      </template>
      <template #td5="{ value }">
        <div class="edit-wrap">
          <n-button type="info" ghost @click="editCategory(value)"> 編輯 </n-button>
          <n-button type="error" ghost @click="handleConfirm(value)"> 刪除 </n-button>
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

  .selection-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    > .n-select {
      width: 120px;
    }
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

  .color-wrap {
    > div {
      width: 50px;
      height: 20px;
      border-radius: 3px;
      border: 1px solid $border-color;
    }
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
import type { ICategory } from '@/types'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'
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
  tableMinWidth: 1000,
  tableColumnWidth: [25, 20, 20, 20, 15],
  tableSetting: [
    {
      order: 1,
      key: 'name',
      title: '名稱',
      sortable: true
    },
    {
      order: 2,
      key: 'key',
      title: 'Key',
      sortable: true
    },
    {
      order: 3,
      key: 'gender',
      title: '適用性別',
      sortable: true
    },
    {
      order: 4,
      key: 'categoryType',
      title: '類別',
      sortable: true
    },
    {
      order: 5,
      key: '_id',
      title: '',
      sortable: false
    }
  ]
})

/** 所有分類 */
const categories: Ref<ICategory[]> = ref([])

const selectType = ref<'color' | 'size' | 'clothingPart'>('color')

/** 分類選項 */
const categoryTypeOptions = [
  { value: 'color', label: '顏色' },
  { value: 'size', label: '尺寸' },
  { value: 'clothingPart', label: '服裝分類' }
]

/** 分類選項 */
const genderOptions = [
  { value: '全部', label: '全部' },
  { value: '男', label: '男' },
  { value: '女', label: '女' }
]

/** 取所有分類 */
async function getAllCategories() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api().get('/categories')
    console.log(data)
    categories.value = data.result
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllCategories()
// 表單 --------------------

const formRef = ref<any>(null)

/** 編輯分類的資訊 */
const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  key: '',
  name: '',
  categoryType: 'color',
  gender: '全部',
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
 * 編輯分類資訊
 * @param _id 分類 _id
 */
function editCategory(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = categories.value.findIndex((item: any) => item._id === _id)

  const selectedCategory = categories.value[idx]

  console.log(selectedCategory)

  for (const key in formValue.value) {
    // @ts-ignore
    if (selectedCategory[key] !== null || selectedCategory[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = selectedCategory[key]
    }
  }

  console.log(formValue.value)
}

/** 重製 formValue */
function resetFormValue() {
  formValue.value = {
    _id: '',
    key: '',
    name: '',
    categoryType: 'color',
    gender: '全部',
    loading: false
  }
}

/** 新增編輯分類送 api */
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
      await api('auth').post('/categories', formObj)

      message.success('新增分類成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/categories/${formValue.value._id}`, formObj)
      message.success('更新分類資訊成功')
    }
    getAllCategories()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯分類資訊時的格式確認
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
 * 選顏色觸發事件，指定給 fromValue
 * @param value hex 字串
 */
const updateColor = (value: string) => {
  console.log(value)
  formValue.value.key = value
}

/** 刪除分類 */
async function deleteCategory(id: string) {
  try {
    await api('auth').delete(`categories/${id}`)
    await getAllCategories()
    message.success('刪除')
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
}

/**
 * 點擊刪除
 * @param id
 */
const handleConfirm = (id: string) => {
  const idx = categories.value.findIndex((item) => item._id === id)
  if (idx === -1) return
  const category = categories.value[idx]

  const d = dialog.warning({
    title: '刪除分類',
    content: `確認刪除 ( ${category.name} ) 嗎?`,
    positiveText: '刪除',
    onPositiveClick: () => {
      d.loading = true
      return deleteCategory(id)
    }
  })
}

/** 判斷分類 */
const categoryName = (key: string) => {
  if (key === 'color') return '顏色'
  else if (key === 'size') return '尺寸'
  else if (key === 'clothingPart') return '服裝分類'
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '分類管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯分類資訊'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增分類資訊'
  else return '錯誤頁'
})

/** 篩選後的分類 */
const filterCategories = computed(() => {
  return categories.value.filter((item) => item.categoryType === selectType.value)
})
</script>
