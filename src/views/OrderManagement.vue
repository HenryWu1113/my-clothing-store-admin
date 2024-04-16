<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'order-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <div v-if="currentPage === Page.overview" class="selection-wrap">
          <div>
            <p>訂單狀態</p>
            <n-select
              v-model:value="orderQuery.orderStatus"
              :options="[{ value: 'All', label: '全部' }, ...orderStatusOptions]"
            />
          </div>
          <div>
            <p>付款狀態</p>
            <n-select
              v-model:value="orderQuery.payStatus"
              :options="[{ value: 'All', label: '全部' }, ...payStatusOptions]"
            />
          </div>
          <div>
            <p>配送狀態</p>
            <n-select
              v-model:value="orderQuery.sendStatus"
              :options="[{ value: 'All', label: '全部' }, ...sendStatusOptions]"
            />
          </div>
        </div>
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue()"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="order-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="使用者(訂購者)編號" path="user">
          <n-input
            :disabled="true"
            v-model:value="formValue.user"
            placeholder="請輸入使用者(訂購者)編號"
            clearable
          />
        </n-form-item>
        <n-form-item label="收貨人" path="recipientName">
          <n-input v-model:value="formValue.recipientName" placeholder="請輸入收貨人" clearable />
        </n-form-item>
        <n-form-item label="收貨人電話" path="recipientPhone">
          <n-input
            v-model:value="formValue.recipientPhone"
            placeholder="請輸入收貨人電話"
            clearable
          />
        </n-form-item>
        <n-form-item label="收貨人信箱" path="recipientEmail">
          <n-input
            v-model:value="formValue.recipientEmail"
            placeholder="請輸入收貨人信箱"
            clearable
          />
        </n-form-item>
        <n-form-item label="收貨人地址" path="recipientAddress">
          <n-input
            v-model:value="formValue.recipientAddress"
            placeholder="請輸入收貨人地址"
            clearable
          />
        </n-form-item>
        <n-form-item label="付款方式" path="payMethod">
          <n-input
            :disabled="true"
            v-model:value="formValue.payMethod"
            placeholder="請輸入付款方式"
            clearable
          />
        </n-form-item>
        <n-form-item label="取貨方式" path="deliveryMethod">
          <n-input
            :disabled="true"
            v-model:value="formValue.deliveryMethod"
            placeholder="請輸入取貨方式"
            clearable
          />
        </n-form-item>
        <n-form-item label="訂單狀態" path="orderStatus">
          <n-select v-model:value="formValue.orderStatus" :options="orderStatusOptions" />
        </n-form-item>
        <n-form-item label="付款狀態" path="payStatus">
          <n-select v-model:value="formValue.payStatus" :options="payStatusOptions" />
        </n-form-item>
        <n-form-item label="配送狀態" path="sendStatus">
          <n-select v-model:value="formValue.sendStatus" :options="sendStatusOptions" />
        </n-form-item>
        <div class="products-wrap">
          <div v-for="product in formValue.products" :key="product._id">
            <div class="img-wrap">
              <img :src="product.product.images[0]" />
            </div>
            <div class="info-wrap">
              <div class="product-color">
                <div class="title">
                  <p>顏色 : {{ exchangeVal(product._id, product.color._id, 'colors').name }}</p>
                  <div
                    class="color-ball"
                    :style="{
                      background: exchangeVal(product._id, product.color._id, 'colors').key
                    }"
                  ></div>
                </div>
                <n-radio-group size="large" v-model:value="product.color._id" name="color">
                  <n-radio
                    v-for="color in product.product.colors"
                    :key="color._id"
                    :value="color._id"
                    :label="color.name"
                  />
                </n-radio-group>
              </div>
              <div class="product-size">
                <div class="title">
                  尺寸 : {{ exchangeVal(product._id, product.size._id, 'sizes').name }}
                </div>
                <n-radio-group size="large" v-model:value="product.size._id" name="size">
                  <n-radio
                    v-for="size in filterSizeSort(product.product.sizes)"
                    :key="size._id"
                    :value="size._id"
                    :label="size.name"
                  />
                </n-radio-group>
              </div>
              <div class="product-quantity">
                <n-select
                  :disabled="true"
                  v-model:value="product.quantity"
                  :options="quantityArr"
                />
                <p>NT. {{ product.price }}</p>
              </div>
            </div>
          </div>
        </div>
        <n-form-item label="運費" path="deliveryFee">
          <n-input-number
            :disabled="true"
            v-model:value="formValue.deliveryFee"
            placeholder="請輸入運費"
            :min="0"
          >
            <template #prefix> $ </template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="總金額" path="totalAmount">
          <n-input-number
            :disabled="true"
            v-model:value="formValue.totalAmount"
            placeholder="請輸入總金額"
            :min="0"
          >
            <template #prefix> $ </template>
          </n-input-number>
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
      :tableData="filterOrders"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td3="{ value }">
        <div>NT. {{ value }}</div>
      </template>
      <template #td4="{ value }">
        <div>
          <n-tag v-if="value === '處理中'" type="warning">{{ value }}</n-tag>
          <n-tag v-if="value === '已確認'" type="info">{{ value }}</n-tag>
          <n-tag v-if="value === '已完成'" type="success">{{ value }}</n-tag>
          <n-tag v-if="value === '已取消'" type="error">{{ value }}</n-tag>
        </div>
      </template>
      <template #td5="{ value }">
        <div>
          <n-tag v-if="value === '未付款'" type="error">{{ value }}</n-tag>
          <n-tag v-if="value === '已退款'" type="warning">{{ value }}</n-tag>
          <n-tag v-if="value === '已付款'" type="success">{{ value }}</n-tag>
        </div>
      </template>
      <template #td6="{ value }">
        <div>
          <n-tag v-if="value === '備貨中'">{{ value }}</n-tag>
          <n-tag v-if="value === '發貨中'" type="warning">{{ value }}</n-tag>
          <n-tag v-if="value === '已到達'" type="info">{{ value }}</n-tag>
          <n-tag v-if="value === '已取貨'" type="success">{{ value }}</n-tag>
          <n-tag
            v-if="value === '退貨中'"
            :color="{ textColor: '#E25BEE', borderColor: '#E25BEE' }"
            >{{ value }}</n-tag
          >
          <n-tag
            v-if="value === '已退貨'"
            :color="{ textColor: '#11BCBC', borderColor: '#11BCBC' }"
            >{{ value }}</n-tag
          >
        </div>
      </template>
      <template #td7="{ value }">
        <div>
          {{ formatTime(value) }}
        </div>
      </template>
      <template #td8="{ value }">
        <div class="edit-wrap">
          <n-button type="info" ghost @click="editOrder(value)"> 編輯 </n-button>
        </div>
      </template>
    </MydataTable>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.order-management-page {
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
    > div {
      display: flex;
      flex-direction: column;
      // align-items: center;
      > p {
        color: $text-color;
        font-size: 14px;
      }
      > .n-select {
        width: 150px;
      }
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

  // 設定 ----------
  .order-setting-wrap {
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

    .products-wrap {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
      > div {
        display: flex;
        height: 200px;
        padding: 1rem 0;
        border-bottom: 1px solid $border-color;
        .img-wrap {
          height: 100%;
          aspect-ratio: 1/1;
          > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .info-wrap {
          width: 100%;
          padding-left: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          > div {
            font-size: 1rem;
            color: $text-color;
            .title {
              display: flex;
              align-items: center;
              .color-ball {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                margin-left: 10px;
              }
            }
            &.product-quantity {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 10px;
              .n-select {
                max-width: 100px !important;
                margin-right: auto;
              }
              > p {
                font-size: 1.2rem;
              }
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
import { ref, h, computed, onMounted, watch, nextTick, type Ref } from 'vue'
import { NButton } from 'naive-ui'
import { ArrowUndoOutline } from '@vicons/ionicons5'
import { PictureTwotone } from '@vicons/antd'
import { useMessage, useDialog } from 'naive-ui'
import { api } from '@/plugins/axios'
import type { IOrder, IBrand } from '@/types'
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
  tableMinWidth: 1200,
  tableColumnWidth: [22, 13, 10, 10, 10, 10, 15, 10],
  tableSetting: [
    {
      order: 1,
      key: '_id',
      title: '訂單編號',
      sortable: true
    },
    {
      order: 2,
      key: 'recipientName',
      title: '收貨人',
      sortable: true
    },
    {
      order: 3,
      key: 'totalAmount',
      title: '訂單金額',
      sortable: true
    },
    {
      order: 4,
      key: 'orderStatus',
      title: '訂單狀態',
      sortable: true
    },
    {
      order: 5,
      key: 'payStatus',
      title: '付款狀態',
      sortable: true
    },
    {
      order: 6,
      key: 'sendStatus',
      title: '配送狀態',
      sortable: true
    },
    {
      order: 7,
      key: 'createdAt',
      title: '訂單日期',
      sortable: true
    },
    {
      order: 8,
      key: '_id',
      title: '',
      sortable: false
    }
  ]
})

/** 所有訂單 */
const orders: Ref<IOrder[]> = ref([])

const orderQuery = ref({
  orderStatus: 'All',
  payStatus: 'All',
  sendStatus: 'All'
})

/** 訂單狀態選項 */
const orderStatusOptions = [
  { value: '處理中', label: '處理中' },
  { value: '已確認', label: '已確認' },
  { value: '已完成', label: '已完成' },
  { value: '已取消', label: '已取消' }
]

/** 付款狀態選項 */
const payStatusOptions = [
  { value: '未付款', label: '未付款' },
  { value: '已退款', label: '已退款' },
  { value: '已付款', label: '已付款' }
]

/** 配送狀態選項 */
const sendStatusOptions = [
  { value: '備貨中', label: '備貨中' },
  { value: '發貨中', label: '發貨中' },
  { value: '已到達', label: '已到達' },
  { value: '已取貨', label: '已取貨' },
  { value: '退貨中', label: '退貨中' },
  { value: '已退貨', label: '已退貨' }
]

/** 商品可選擇的數量 */
const quantityArr = Array.from({ length: 10 }, (value: any, idx: number) => ({
  label: String(idx + 1),
  value: idx + 1
}))

/** 取所有訂單 */
async function getAllOrders() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api('auth').get('/orders/all')
    console.log(data)
    orders.value = data.result
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllOrders()

// 表單 --------------------

const formRef = ref<any>(null)

/** 編輯訂單的資訊 */
const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  user: '',
  recipientName: '',
  recipientPhone: '',
  recipientEmail: '',
  recipientAddress: '',
  payMethod: '',
  deliveryMethod: '',
  orderStatus: '',
  payStatus: '',
  sendStatus: '',
  deliveryFee: 0,
  totalAmount: 0,
  products: [],
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
 * 編輯訂單資訊
 * @param _id 訂單 _id
 */
function editOrder(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = orders.value.findIndex((item: any) => item._id === _id)

  const selectedStore = orders.value[idx]

  console.log(selectedStore)

  for (const key in formValue.value) {
    // if (key === 'products') {
    //   formValue.value[key] = selectedStore[key].map((item) => {
    //     return {
    //       ...item,
    //       product: item.product._id,
    //       quantity: item.quantity,
    //       color: item.color._id,
    //       size: item.size._id
    //     }
    //   })
    // @ts-ignore
    if (selectedStore[key] !== null || selectedStore[key] !== void 0) {
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
    user: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    payMethod: '',
    deliveryMethod: '',
    orderStatus: '',
    payStatus: '',
    sendStatus: '',
    deliveryFee: 0,
    totalAmount: 0,
    products: [],
    loading: false
  }
}

/** 新增編輯訂單送 api */
async function submitForm() {
  formValue.value.loading = true
  const formObj: any = {}
  for (const key in formValue.value) {
    if (['_id', 'loading'].includes(key)) continue
    else if (key === 'products') {
      formObj[key] = formValue.value[key].map((item: any) => {
        return {
          ...item,
          color: item.color._id,
          size: item.size._id,
          product: item.product._id
        }
      })
    } else if (formValue.value[key] !== undefined && formValue.value[key] !== '') {
      formObj[key] = formValue.value[key]
    }
  }

  console.log(formObj)

  try {
    if (formValue.value._id.length === 0) {
      await api('auth').post('/orders', formObj)

      message.success('新增訂單成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/orders/${formValue.value._id}`, formObj)
      message.success('更新訂單資訊成功')
    }
    getAllOrders()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯訂單資訊時的格式確認
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
 * 用 _id 換值 (這特殊的資料結構讓我可以這樣寫)
 * @param productListId 該訂單該商品清單的 id
 * @param id 選項的 id(顏色、尺寸)
 * @param type 查找類型(顏色、尺寸)
 */
const exchangeVal = (productListId: string, id: string, type: 'colors' | 'sizes') => {
  const idxOfProduct = formValue.value.products.findIndex((item: any) => item._id === productListId)
  if (idxOfProduct === -1) {
    return {
      key: '',
      name: ''
    }
  }

  const product = formValue.value.products[idxOfProduct].product

  const idxOfCatOption = product[type].findIndex((item: any) => item._id === id)

  if (idxOfCatOption === -1) {
    return {
      key: '',
      name: ''
    }
  }

  return {
    key: product[type][idxOfCatOption].key ?? '',
    name: product[type][idxOfCatOption].name ?? ''
  }
}

/** 避免 sizes 當初勾選的順序不一 */
const filterSizeSort = (sizes: any) => {
  return sizes.sort((a: any, b: any) => {
    const sortArr = ['XS', 'S', 'M', 'L', 'XL']
    if (sortArr.indexOf(a.key) > sortArr.indexOf(b.key)) return 1
    else return -1
  })
}

/** 標題名切換 */
const pageTitle = computed(() => {
  if (currentPage.value === Page.overview) return '訂單管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯訂單資訊'
  else return '錯誤頁'
})

/** 篩選後的訂單 */
const filterOrders = computed(() => {
  return orders.value.filter((item) => {
    if (
      orderQuery.value.orderStatus !== 'All' &&
      orderQuery.value.orderStatus !== item.orderStatus
    ) {
      return false
    }
    if (orderQuery.value.payStatus !== 'All' && orderQuery.value.payStatus !== item.payStatus) {
      return false
    }
    if (orderQuery.value.sendStatus !== 'All' && orderQuery.value.sendStatus !== item.sendStatus) {
      return false
    }
    return true
  })
})
</script>
