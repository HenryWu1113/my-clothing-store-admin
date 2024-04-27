<template>
  <div class="clerk-outfit-page myContainer">
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <div v-if="currentPage === Page.overview" class="selection-wrap">
          <n-button @click="currentPage = Page.edit">新增穿搭</n-button>
        </div>
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue(), getClerkOutfits()"
        ></n-icon>
      </template>
    </TitleBar>
    <template v-if="currentPage === Page.overview">
      <div class="clerk-info-wrap">
        <div class="img-wrap">
          <img v-if="avatar" :src="avatar" />
          <img v-else :src="`https://source.boringavatars.com/beam/160/${adminId}`" />
        </div>
        <div class="clerk-info">
          <div class="name">{{ name }} | {{ height ?? '??' }}cm | {{ weight ?? '??' }}kg</div>
          <div class="store">{{ '<' }} {{ store }} ></div>
          <div class="introduce">{{ introduce ?? '這個店員自我介紹什麼都沒寫唷!!' }}</div>
        </div>
      </div>
      <div class="outfits-wrap">
        <template v-if="loading">
          <n-skeleton
            v-for="item in Array.from({ length: 20 }, (_, idx) => idx)"
            :key="item"
            :sharp="false"
            size="medium"
          />
        </template>
        <OutfitCard
          v-for="(outfit, idx) in clerkOutfits"
          :outfit="outfit"
          :idx="idx"
          :key="outfit._id"
          :editOutfit="editOutfit"
          :getClerkOutfits="getClerkOutfits"
        />
      </div>
    </template>

    <div v-if="currentPage === Page.edit" class="product-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="穿搭名稱" path="outfitName">
          <n-input v-model:value="formValue.outfitName" placeholder="請輸入穿搭名稱" clearable />
        </n-form-item>
        <n-form-item label="穿搭描述" path="description">
          <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="請輸入穿搭描述"
            clearable
          />
        </n-form-item>
        <n-form-item class="images-wrap" label="商品圖片(最多三張)" path="images">
          <InputImage id="inputImagesRef" multiple @update-multiple="imageUpdate" />
          <label for="inputImagesRef">
            <n-icon :component="PictureTwotone"></n-icon>
          </label>
          <n-image-group>
            <n-space>
              <n-image
                v-for="(imageSrc, idx) in formValue.previewImages"
                :class="`img_${idx}`"
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
        <n-form-item label="公開狀態" path="show">
          <n-switch v-model:value="formValue.show" />
        </n-form-item>
        <div class="outfit-products-wrap">
          <div class="title">
            <p>穿搭單品</p>
            <n-button
              @click="
                onOpen(() => {
                  productProps = undefined
                })
              "
              >加入商品</n-button
            >
          </div>
          <div class="products">
            <div class="product-list" v-for="product in formValue.products" :key="product._id">
              <div class="img-wrap">
                <img :src="firstProductImg(product.product)" />
              </div>
              <div class="product-info">
                <div class="name">
                  <p>{{ productInfo(product.product, 'name') }}</p>
                  <n-icon :component="Pencil" @click="editfitProduct(product.product._id)"></n-icon>
                  <n-icon
                    class="delete"
                    :component="TrashOutline"
                    @click="deleteOutfitProduct(product.product._id)"
                  ></n-icon>
                </div>
                <div class="size">尺寸 : {{ product.size.name }}</div>
                <div class="color">顏色 : {{ product.color.name }}</div>
                <div class="color-ball" :style="{ background: product.color.key }"></div>
                <div class="price">
                  <p v-if="productInfo(product.product, 'discountRate') !== 0">
                    <del>NT$ {{ numberToCommaString(productInfo(product.product, 'price')) }}</del>
                  </p>
                  <p>
                    NT$
                    {{
                      numberToCommaString(
                        productInfo(product.product, 'price') *
                          ((100 - productInfo(product.product, 'discountRate')) / 100)
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    <ProductModal
      :isOpen="isOpen"
      :onClose="onClose"
      :product-props="productProps"
      @update="updateOutfitProduct"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';
.clerk-outfit-page {
  .n-icon {
    font-size: 2rem;
    cursor: pointer;
    color: $text-color;
  }

  :deep(.title-bar) {
    border-bottom: none !important;
    margin-bottom: 2rem;
  }

  .clerk-info-wrap {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid $border-color;
    .img-wrap {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .clerk-info {
      display: flex;
      flex-direction: column;
      font-size: 1rem;
      font-weight: bold;
      .name {
        color: $text-color;
        font-size: 1.2rem;
      }
      .store {
        color: $text-color;
        transition: 0.2s;
        cursor: pointer;
        // &:hover {
        //   border-bottom: 1px solid $text-color;
        // }
      }
      .introduce {
        border-top: 1px solid $border-color;
        color: $text-color2;
        padding-top: 10px;
        margin-top: 10px;
      }
    }
  }

  .outfits-wrap {
    padding: 2rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    > div {
      width: calc((100% - 4rem) / 5);
      aspect-ratio: 2/3 !important;

      @include xxxxl {
        width: calc((100% - 3rem) / 4);
      }

      @include xxxl {
        width: calc((100% - 2rem) / 3);
      }

      @include md {
        width: calc((100% - 1rem) / 2);
      }

      @include sm {
        width: 100%;
      }

      &.n-skeleton {
        height: auto !important;
      }
    }
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

            &.img_0 {
              border: 2px solid red;
            }
          }
        }
      }
    }

    .outfit-products-wrap {
      display: flex;
      flex-direction: column;
      > .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid $border-color;
        padding-bottom: 1rem;
        > p {
          font-size: 1.5rem;
          color: $text-color;
        }
      }
      > .products {
        display: flex;
        flex-direction: column;
        .product-list {
          display: flex;
          padding: 1rem 0;

          gap: 1rem;
          @extend %AshowEffect;
          &:not(:first-child) {
            border-top: 1px solid $border-color;
          }
          .img-wrap {
            width: 180px;
            height: 180px;
            > img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          .product-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            width: calc(100% - 180px - 1rem);
            .name {
              font-size: 1.2rem;
              font-weight: bold;
              color: $text-color;
              display: flex;
              align-items: center;
              gap: 0.8rem;
              > p {
                margin-right: auto;
              }
              .n-icon {
                font-size: 1.2rem;
                cursor: pointer;
                &.delete {
                  color: red;
                }
              }
            }
            .size,
            .color {
              font-size: 1rem;
              font-weight: bold;
              color: $text-color2;
            }
            .color-ball {
              width: 20px;
              height: 20px;
              border-radius: 50%;
            }
            .price {
              margin-top: auto;
              font-size: 1.5rem;
              font-weight: bold;
              color: $text-color;
            }
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
import { ref, shallowRef, computed, toRaw, type Ref } from 'vue'
import { useMessage, useLoadingBar } from 'naive-ui'
import { api } from '@/plugins/axios'
import type { ICategory, IProduct, IOutfit } from '@/types'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { ArrowUndoOutline, Pencil, TrashOutline } from '@vicons/ionicons5'
import { PictureTwotone } from '@vicons/antd'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'
import { useProductModalStore } from '@/stores/useProductModalStore'

import OutfitCard from '@/components/cards/OutfitCard.vue'
import TitleBar from '@/components/TitleBar.vue'
import InputImage from '@/components/InputImage.vue'
import ProductModal from '@/components/modals/ProductModal.vue'

const { onOpen, onClose } = useProductModalStore()
const { isOpen } = storeToRefs(useProductModalStore())

enum Page {
  overview = '1',
  edit = '2'
}

const currentPage: Ref<'1' | '2'> = ref(Page.overview)

const message = useMessage()
const loadingBar = useLoadingBar()
const route = useRoute()
const router = useRouter()

const loading = ref(false)

const {
  adminId,
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

type simplifyProductType = Omit<IProduct, 'colors' | 'sizes'> & {
  colors: string[]
  sizes: string[]
}

const clerkOutfits = ref<IOutfit[]>([])

/**
 * 傳進選單品的彈窗的資訊
 * @property {string} productId 商品 id
 * @property {string} color 顏色 id
 * @property {string} size 尺寸 id
 */
const productProps = ref<undefined | { productId: string; color: string; size: string }>(undefined)

const rules = {
  outfitName: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('穿搭名稱必填')
      }
      return true
    }
  },
  description: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0) {
        return new Error('穿搭描述必填')
      }
      return true
    }
  },
  images: {
    required: true,
    trigger: ['input', 'blur'],
    validator(rule: any, value: string) {
      if (value.length === 0 && formValue.value.previewImages.length === 0) {
        return new Error('至少需要一張穿搭照')
      }
      return true
    }
  }
}

// 表單 --------------------

const formRef = ref<any>(null)
/** 編輯分類的資訊 */
const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  outfitName: '',
  description: '',
  images: [] as File[],
  previewImages: [] as string[],
  products: [],
  show: true,
  loading: false
})

/** 取所有穿搭 */
async function getClerkOutfits() {
  if (adminId.value === '') {
    setTimeout(() => {
      getClerkOutfits()
    }, 100)
    return
  }
  try {
    loading.value = true
    const { data } = await api().get(`/outfits/clerk/${adminId.value}`)
    clerkOutfits.value = data.result
    console.log(data)
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  loading.value = false
}

getClerkOutfits()

/**
 * 編輯穿搭
 * @param _id 穿搭 _id
 */
function editOutfit(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = clerkOutfits.value.findIndex((item) => item._id === _id)

  const selectedProduct = clerkOutfits.value[idx]

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
    outfitName: '',
    description: '',
    images: [] as File[],
    previewImages: [] as string[],
    products: [],
    show: true,
    loading: false
  }
}

/** 新增編輯商品送 api */
async function submitForm() {
  const fd = new FormData()

  for (const key in formValue.value) {
    if (['_id', 'previewImages', 'loading'].includes(key)) continue
    else if (key === 'images') {
      for (const val of formValue.value[key]) {
        fd.append(key, val)
      }
    } else if (key === 'products') {
      if (formValue.value[key].length === 0) return message.warning('至少選擇一件穿搭商品')
      for (const product of formValue.value[key]) {
        // @ts-ignore
        fd.append(
          key,
          JSON.stringify({
            product: product.product._id,
            color: product.color._id,
            size: product.size._id
          })
        )
      }
    } else {
      fd.append(key, formValue.value[key])
    }
  }

  formValue.value.loading = true

  try {
    if (formValue.value._id.length === 0) {
      fd.append('clerk', adminId.value)
      await api('auth').post('/outfits', fd)

      message.success('新增成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/outfits/${formValue.value._id}`, fd)
      message.success('更新成功')
      // 把 images 先變空才不會重複上傳
      formValue.value.images = []
    }
    getClerkOutfits()
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

/** 回傳商品第一張圖(不知為什麼定義好 type 還找不到型別...) */
function firstProductImg(product: any) {
  return product.images[0]
}

/** 回傳商品資訊(不知為什麼定義好 type 還找不到型別...) */
function productInfo(product: any, key: string) {
  return product[key]
}

/**
 * 更新穿搭單品 (emit function)
 * @param outfitProduct
 */
function updateOutfitProduct(outfitProduct: {
  color: ICategory
  size: ICategory
  product: simplifyProductType
}) {
  console.log(outfitProduct)

  const idx = formValue.value.products.findIndex(
    (product: any) => product.product._id === outfitProduct.product._id
  )
  if (idx === -1) {
    formValue.value.products.push(outfitProduct)
    message.info('新增穿搭商品')
  } else {
    formValue.value.products[idx] = outfitProduct
    message.info('更新穿搭商品屬性')
  }
}

/**
 * 編輯穿搭單品
 * @param id 商品 id
 */
function editfitProduct(id: string) {
  const idx = formValue.value.products.findIndex((item: any) => item.product._id)
  if (idx === -1) return

  productProps.value = {
    productId: id,
    color: formValue.value.products[idx].color._id,
    size: formValue.value.products[idx].size._id
  }

  onOpen()
}

/**
 * 刪除穿搭單品
 * @param id 商品 id
 */
function deleteOutfitProduct(id: string) {
  console.log(id)
  formValue.value = {
    ...toRaw(formValue.value),
    products: formValue.value.products.filter((item: any) => item.product._id !== id)
  }
  console.log(formValue.value)
}

/** input 圖片更新觸發 */
function imageUpdate(obj: { images: FileList; previewImages: string[] }) {
  console.log(obj)
  formValue.value.images = obj.images
  formValue.value.previewImages = obj.previewImages
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '我的穿搭'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯我的穿搭'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增我的穿搭'
  else return '錯誤頁'
})
</script>
