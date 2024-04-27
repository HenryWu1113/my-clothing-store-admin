<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-mask">
        <div id="p-modal" class="modal">
          <div class="modal-title">
            <p>商品選擇</p>
            <n-icon :component="Times" @click="onClose(), addCloseClass()"></n-icon>
          </div>
          <div class="modal-body">
            <div class="selected-wrap">
              <div>
                <div class="title">
                  <p>商品 : {{ selectedProduct.name }}</p>
                </div>
                <n-image :src="selectedProduct.images[0]" />
              </div>
              <div>
                <div class="title">
                  <p>顏色 :</p>
                  <div class="color-ball" :style="{ background: currentColor.key }"></div>
                </div>
                <n-radio-group v-model:value="selectedProperty.color" name="color">
                  <n-radio
                    v-for="color in selectedProduct.colors"
                    :key="color._id"
                    :value="color._id"
                    :label="color.name"
                  />
                </n-radio-group>
              </div>
              <div>
                <div class="title">
                  <p>尺寸 : {{ currentSize.name }}</p>
                </div>
                <n-radio-group v-model:value="selectedProperty.size" name="size">
                  <n-radio
                    v-for="size in selectedProduct.sizes"
                    :key="size._id"
                    :value="size._id"
                    :label="size.name"
                  />
                </n-radio-group>
              </div>
              <n-button strong type="tertiary" attr-type="submit" @click="confirm()">確認</n-button>
            </div>
            <div class="filter-wrap">
              <n-input
                v-model:value="query"
                type="text"
                clearable
                placeholder="請輸入商品名"
              ></n-input>
            </div>
            <div class="product-wrap" v-if="!productProps">
              <img
                @click="selectProduct(product._id)"
                v-for="product in filterProduct"
                :key="product._id"
                :src="product.images[0]"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@import '@/styles/styles';
.modal-mask {
  width: 100vw;
  height: 100vh;
  background: $modal-bg-color;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10000;
  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: $bg-color;
    border-radius: 10px;
    width: 60%;
    animation: onOpen 0.5s ease forwards;
    max-height: 850px;
    overflow: auto;
    &.close {
      animation: onClose 0.5s ease forwards;
    }
    @keyframes onOpen {
      0% {
        top: 70%;
        opacity: 0;
      }
    }
    @keyframes onClose {
      100% {
        top: 70%;
        opacity: 0;
      }
    }
    @include lg {
      width: 50%;
    }
    @include md {
      width: 60%;
    }
    @include sm {
      width: 100%;
      height: 100%;
    }
    .modal-title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem;
      font-size: 20px;
      font-weight: bold;
      color: $text-color;
      > p {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      > .n-icon {
        cursor: pointer;
      }
    }

    .modal-body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 1rem;
      color: $text-color2;
      .selected-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        > div {
          .title {
            display: flex;
            align-items: center;
            .color-ball {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              margin-left: 5px;
            }
          }

          .n-image {
            width: 120px;
            height: 120px;
          }
        }
      }
      .product-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        > img {
          width: calc(20% - 40px / 4);
          aspect-ratio: 1/1;
          cursor: pointer;
          object-fit: cover;
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { Otter, Times } from '@vicons/fa'
import type { IProduct, ICategory } from '@/types'
import { api } from '@/plugins/axios'
import { useMessage } from 'naive-ui'
import { isEmptyString, formatTime } from '@/composables'
import { storeToRefs } from 'pinia'

const message = useMessage()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function as () => any,
    require: true
  },
  productProps: {
    type: Object as () => { productId: string; color: string; size: string }
  }
})

type simplifyProductType = Omit<IProduct, 'colors' | 'sizes'> & {
  colors: string[]
  sizes: string[]
}

const emit = defineEmits<{
  (
    e: 'update',
    outfitProduct: { color: ICategory; size: ICategory; product: simplifyProductType }
  ): void
}>()

const products = ref<IProduct[]>([])
const query = ref('')

const loading = ref(false)

const selectedProduct = ref<IProduct>({
  clothingGender: '男',
  clothingPart: '',
  colors: [],
  createdAt: '',
  description: '',
  discountRate: 0,
  images: [],
  name: '',
  price: 0,
  ratings: [],
  sell: true,
  sizes: [],
  soldQuantity: 0,
  stockQuantity: 0,
  tags: [],
  updatedAt: '',
  _id: ''
})

const selectedProperty = ref({
  color: '',
  size: ''
})

/** 跳窗加 class 變更動畫 */
function addCloseClass() {
  const modal: HTMLElement = document.querySelector('.modal')!
  if (!modal) return
  modal.classList.add('close')
}

/**
 * 取商品
 * @param queryObj
 */
async function getProducts() {
  const str = ''
  console.log('query string', str)
  loading.value = true
  try {
    const { data } = await api().get(`/products?${str}`)
    console.log(data)
    products.value = [...data.result]
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  loading.value = false
}

/** 偵測是否有 productProps 有就綁定 */
function bindProductProps() {
  if (!props.productProps) return resetAll()
  const idxOfProduct = products.value.findIndex(
    (item) => item._id === props.productProps?.productId
  )
  selectedProduct.value = products.value[idxOfProduct]

  selectedProperty.value = {
    color: props.productProps.color,
    size: props.productProps.size
  }
}

/**
 * 點擊選擇商品
 * @param id 商品 id
 */
function selectProduct(id: String) {
  const idx = products.value.findIndex((item) => item._id === id)
  if (idx === -1) return
  selectedProduct.value = products.value[idx]

  const wrap: HTMLElement = document.querySelector('#p-modal')!
  if (!wrap) return
  wrap.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetAll() {
  selectedProduct.value = {
    clothingGender: '男',
    clothingPart: '',
    colors: [],
    createdAt: '',
    description: '',
    discountRate: 0,
    images: [],
    name: '',
    price: 0,
    ratings: [],
    sell: true,
    sizes: [],
    soldQuantity: 0,
    stockQuantity: 0,
    tags: [],
    updatedAt: '',
    _id: ''
  }
  selectedProperty.value = {
    color: '',
    size: ''
  }
}

/** 確認商品顏色尺寸 新增穿搭的單品 */
function confirm() {
  const color = toRaw(currentColor.value)
  const size = toRaw(currentSize.value)

  if (color._id === '' || size._id === '') return message.warning('缺少商品顏色或尺寸')

  emit('update', {
    product: toRaw({
      ...selectedProduct.value,
      colors: selectedProduct.value.colors.map((item) => item._id),
      sizes: selectedProduct.value.sizes.map((item) => item._id)
    }),
    color,
    size
  })
  props.onClose()
  resetAll()
}

const currentColor = computed(() => {
  const idx = selectedProduct.value.colors.findIndex(
    (item) => item._id === selectedProperty.value.color
  )
  if (idx === -1)
    return {
      _id: '',
      categoryType: '',
      gender: '',
      key: '',
      name: '',
      createdAt: '',
      updatedAt: ''
    }
  return selectedProduct.value.colors[idx]
})

const currentSize = computed(() => {
  const idx = selectedProduct.value.sizes.findIndex(
    (item) => item._id === selectedProperty.value.size
  )
  if (idx === -1)
    return {
      _id: '',
      categoryType: '',
      gender: '',
      key: '',
      name: '',
      createdAt: '',
      updatedAt: ''
    }
  return selectedProduct.value.sizes[idx]
})

const filterProduct = computed(() => {
  console.log(query.value)
  if (query.value === '') return products.value
  return products.value.filter((item) => item.name.includes(query.value))
})

// 開啟彈窗取所有服飾
watch(
  () => props.isOpen,
  async (newVal: boolean) => {
    if (newVal) {
      await getProducts()
      bindProductProps()
    }
  }
)

// 切換商品重置顏色尺寸綁定
watch(
  selectedProduct,
  () => {
    if (props.productProps) return
    selectedProperty.value = {
      color: '',
      size: ''
    }
  },
  { deep: true }
)
</script>
