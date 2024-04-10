<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'product-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增商品</n-button
        >
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue(), (quillInstance = null)"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="product-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="商品名稱" path="name">
          <n-input v-model:value="formValue.name" placeholder="請輸入商品名稱" clearable />
        </n-form-item>
        <n-form-item label="售價" path="price">
          <n-input-number v-model:value="formValue.price" placeholder="請輸入售價" :min="0">
            <template #prefix> $ </template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="庫存" path="stockQuantity">
          <n-input-number v-model:value="formValue.stockQuantity" placeholder="請輸入庫存" :min="0">
            <template #prefix> @ </template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="打折" path="discountRate">
          <n-input-number
            v-model:value="formValue.discountRate"
            placeholder="請輸入打折"
            :min="0"
            :max="100"
          >
            <template #prefix> $ </template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="服飾性別分類" path="clothingGender">
          <n-radio-group v-model:value="formValue.clothingGender" name="clothingGender">
            <n-space>
              <n-radio key="male" value="male" label="男裝" />
              <n-radio key="female" value="female" label="女裝" />
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="服飾部分" path="clothingPart">
          <n-radio-group v-model:value="formValue.clothingPart" name="clothingPart">
            <n-space>
              <n-radio key="shirts" value="shirts" label="上衣" />
              <n-radio key="pants" value="pants" label="下裝" />
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="商品顏色" path="colors">
          <n-checkbox-group v-model:value="formValue.colors">
            <n-space item-style="display: flex;">
              <n-checkbox style="--n-color-checked: white" value="white" label="白色" />
              <n-checkbox style="--n-color-checked: black" value="black" label="黑色" />
              <n-checkbox style="--n-color-checked: blue" value="blue" label="藍色" />
              <n-checkbox style="--n-color-checked: red" value="red" label="紅色" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="商品尺寸" path="sizes">
          <n-checkbox-group v-model:value="formValue.sizes">
            <n-space item-style="display: flex;">
              <n-checkbox value="XS" label="XS" />
              <n-checkbox value="S" label="S" />
              <n-checkbox value="M" label="M" />
              <n-checkbox value="L" label="L" />
              <n-checkbox value="XL" label="XL" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="商品標籤" path="tags">
          <n-dynamic-tags v-model:value="formValue.tags" :max="5" />
        </n-form-item>
        <n-form-item class="images-wrap" label="商品圖片(最多三張)" path="images">
          <InputImage id="inputImagesRef" multiple @update-multiple="imageUpdate" />
          <label for="inputImagesRef">
            <n-icon :component="PictureTwotone"></n-icon>
          </label>
          <n-image-group>
            <n-space>
              <n-image
                v-for="imageSrc in formValue.previewImages"
                :key="imageSrc"
                width="100"
                height="100"
                :src="imageSrc"
                object-fit="cover"
                :previewed-img-props="{ style: { border: '8px solid white' } }"
              />
            </n-space>
          </n-image-group>
        </n-form-item>
        <n-form-item label="上架狀態" path="sell">
          <n-switch v-model:value="formValue.sell" />
        </n-form-item>
        <n-form-item v-if="false" label="商品描述" path="description">
          <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="請輸入商品描述"
            clearable
          />
        </n-form-item>
        <QuillEditor
          theme="snow"
          toolbar="full"
          @ready="quillReady"
          @update:content="updateQuill"
        />
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
      :tableData="products"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td1="{ value }">
        <n-carousel show-arrow>
          <img :src="String(srcString)" v-for="srcString in value" :key="srcString" />
        </n-carousel>
      </template>
      <template #td3="{ value }">
        <div>{{ value }}% OFF</div>
      </template>
      <template #td5="{ value }">
        <div>
          <n-tag :type="value ? 'success' : 'info'">{{ value ? '上架中' : '未上架' }}</n-tag>
        </div>
      </template>
      <template #td6="{ value }">
        <div class="edit-wrap">
          <n-button type="info" ghost @click="editProduct(value)"> 編輯 </n-button>
          <n-button type="error" ghost @click="handleConfirm">刪除</n-button>
        </div>
      </template>
    </MydataTable>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.product-management-page {
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
  .product-setting-wrap {
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
import type { IProduct } from '@/types'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import TitleBar from '@/components/TitleBar.vue'
import MydataTable from '@/components/dataTable/dataTable.vue'
import InputImage from '@/components/InputImage.vue'

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
      key: 'images',
      title: '圖片',
      sortable: true
    },
    {
      order: 2,
      key: 'price',
      title: '價格',
      sortable: true
    },
    {
      order: 3,
      key: 'discountRate',
      title: '打折',
      sortable: true
    },
    {
      order: 4,
      key: 'name',
      title: '產品',
      sortable: true
    },
    {
      order: 5,
      key: 'sell',
      title: '上架狀態',
      sortable: true
    },
    {
      order: 6,
      key: '_id',
      title: '編輯',
      sortable: false
    }
  ]
})

const products: Ref<IProduct[]> = ref([])

async function getAllProducts() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api('auth').get('/products/all')
    console.log(data)
    products.value = [...data.result]
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllProducts()
// 表單 --------------------

const formRef = ref<any>(null)

const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  name: '',
  price: 0,
  stockQuantity: 0,
  discountRate: 0,
  clothingGender: 'male',
  clothingPart: 'shirts',
  colors: [],
  sizes: [],
  tags: [],
  images: [] as any[],
  previewImages: [] as string[],
  sell: true,
  description: '',
  loading: false
})

const rules = {
  name: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('商品名稱必填')
      }
      return true
    }
  },
  colors: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('至少需要一種顏色')
      }
      return true
    }
  },
  sizes: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('至少需要一種尺寸')
      }
      return true
    }
  },
  tags: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('至少需要一個標籤')
      }
      return true
    }
  },
  sell: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value && formValue.value.stockQuantity == 0) {
        return new Error('沒有庫存禁止上架')
      }
      return true
    }
  }
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
 * 編輯商品
 * @param _id 商品 _id
 */
function editProduct(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = products.value.findIndex((item) => item._id === _id)

  const selectedProduct = products.value[idx]

  console.log(selectedProduct)

  for (const key in formValue.value) {
    if (key === 'images') {
      continue
    } else if (key === 'previewImages') {
      formValue.value[key] = selectedProduct.images
      // @ts-ignore
    } else if (selectedProduct[key] !== null || selectedProduct[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = selectedProduct[key]
    }
  }

  console.log(formValue.value)
}

/** 重製 formValue */
function resetFormValue() {
  formValue.value = {
    _id: '',
    name: '',
    price: 0,
    stockQuantity: 0,
    discountRate: 0,
    clothingGender: 'male',
    clothingPart: 'shirts',
    colors: [],
    sizes: [],
    tags: [],
    images: [] as any[],
    previewImages: [] as string[],
    sell: true,
    description: '',
    loading: false
  }
}

/** 新增編輯商品送 api */
async function submitForm() {
  formValue.value.loading = true
  const fd = new FormData()
  for (const key in formValue.value) {
    if (['_id', 'previewImages', 'loading'].includes(key)) continue
    else if (['colors', 'sizes', 'tags', 'images'].includes(key)) {
      for (const val of formValue.value[key]) {
        fd.append(key, val)
      }
    } else {
      fd.append(key, formValue.value[key])
    }
  }

  try {
    if (formValue.value._id.length === 0) {
      await api('auth').post('/products', fd)

      message.success('新增成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/products/${formValue.value._id}`, fd)
      message.success('更新成功')
      // 把 images 先變空才不會重複上傳
      formValue.value.images = []
    }
    getAllProducts()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯商品時的格式確認
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

/** 刪除商品 */
const handleConfirm = () => {
  dialog.warning({
    title: '刪除商品',
    content: '確認刪除',
    positiveText: '刪除',
    onPositiveClick: async () => {
      message.success('刪除')
    }
  })
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '商品管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯商品'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增商品'
  else return '錯誤頁'
})

function imageUpdate(obj: { images: FileList; previewImages: string[] }) {
  console.log(obj)
  formValue.value.images = obj.images
  formValue.value.previewImages = obj.previewImages
}

/** vue-quill實例 */
const quillInstance = ref<any>(null)

/**
 * 元件準備好觸發 ready 賦予實例
 * @param quill 元件傳出來的實例
 */
const quillReady = (quill: any) => {
  quillInstance.value = quill
  quillInstance.value.root.innerHTML = formValue.value.description
  console.log(quill)
}

/** 有變化就賦值給 formValue.description */
const updateQuill = (_: any) => {
  console.log(quillInstance.value.root.innerHTML)
  formValue.value.description = quillInstance.value.root.innerHTML
}
</script>
