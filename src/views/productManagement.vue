<template>
  <div class="product-management myContainer">
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增商品</n-button
        >
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="currentPage = Page.overview"
        ></n-icon>
      </template>
    </TitleBar>
    <n-data-table
      v-if="currentPage === Page.overview"
      ref="dataTableInst"
      :columns="columns"
      :data="data"
      :pagination="pagination"
    />
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
        <!-- <n-form-item label="打折" path="discount">
          <n-input-number
            v-model:value="formValue.discount"
            placeholder="請輸入打折"
            :min="0"
            :max="10"
          >
            <template #prefix> $ </template>
          </n-input-number>
        </n-form-item> -->
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
          <input id="inputImagesRef" type="file" accept="image/*" multiple />
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
        <n-form-item label="商品描述" path="description">
          <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="請輸入商品描述"
            clearable
          />
        </n-form-item>
        <n-form-item>
          <n-button strong type="tertiary" attr-type="submit" @click="handleValidateClick"
            >確認</n-button
          >
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.product-management {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .n-icon {
    font-size: 2rem;
    cursor: pointer;
  }

  .product-setting-wrap {
    border: 1px solid $light1;
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
  }
}
</style>

<script setup lang="ts">
import { ref, h, computed, onMounted, type Ref } from 'vue'
import { NButton } from 'naive-ui'
import { ArrowUndoOutline } from '@vicons/ionicons5'
import { PictureTwotone } from '@vicons/antd'
import { useMessage } from 'naive-ui'

import TitleBar from '@/components/TitleBar.vue'
import { transform } from 'typescript'

const message = useMessage()

const pagination = ref({ pageSize: 5 })

enum Page {
  overview = '1',
  edit = '2'
}

const currentPage: Ref<'1' | '2'> = ref(Page.edit)

const columns = [
  {
    title: '商品',
    key: 'name'
  },
  {
    title: '售價',
    key: 'price',
    sorter: (a: any, b: any) => a.price - b.price
  },
  {
    title: '上架狀態',
    key: 'sell',
    render(row: any) {
      return row.sell ? '上架中' : '未上架'
    },
    sorter: {
      compare: (a: any, b: any) => a.sell - b.sell,
      multiple: 3
    }
  },
  {
    title: '編輯',
    key: 'edit',
    render(row: any) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => onOpen(row.name)
        },
        '編輯'
      )
    }
  }
]

const data = [
  {
    name: 'product1',
    price: 1200,
    sell: true
  },
  {
    name: 'product2',
    price: 800,
    sell: false
  },
  {
    name: 'product3',
    price: 1800,
    sell: true
  },
  {
    name: 'product4',
    price: 400,
    sell: true
  },
  {
    name: 'product5',
    price: 900,
    sell: true
  },
  {
    name: 'product6',
    price: 100,
    sell: false
  }
]

// 表單 --------------------

const formRef = ref<any>(null)

const formValue = ref({
  name: '',
  price: 0,
  stockQuantity: 0,
  clothingGender: 'male',
  clothingPart: 'shirts',
  colors: [],
  sizes: [],
  tags: [],
  images: [] as any[],
  previewImages: [] as string[],
  sell: true,
  description: ''
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
  },
  description: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('商品描述必填')
      }
      return true
    }
  }
}

const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      console.log(formValue.value)
    } else {
      message.error('不符合驗證')
    }
  })
}

function onOpen(name: string) {
  console.log(name)
}

function processImage(files: FileList, index: number) {
  if (index >= files.length) {
    console.log('All images processed')
    return
  }

  const reader = new FileReader()
  const file = files[index]

  formValue.value.images.push(file)

  reader.readAsDataURL(file)

  reader.onload = (e: any) => {
    // console.log(e.target.result) // base64 字符串
    formValue.value.previewImages.push(e.target.result)

    // 繼續處理下一個文件
    processImage(files, index + 1)
  }
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '商品管理'
  else if (currentPage.value === Page.edit) return '編輯商品'
  else return '錯誤頁'
})

onMounted(async () => {
  const inputImagesRef: HTMLInputElement = document.querySelector('#inputImagesRef')!

  console.log(inputImagesRef)
  inputImagesRef.onchange = function () {
    formValue.value.images = []
    formValue.value.previewImages = []

    const files: FileList | null = inputImagesRef.files
    console.log(files)

    if (!files || files.length === 0) return

    // 開始處理第一個文件
    processImage(files, 0)
  }
})
</script>
