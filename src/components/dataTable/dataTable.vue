<template>
  <div class="dataWrap">
    <div class="tableWrap" ref="tableWrap">
      <table :style="tableMinWidth ? { minWidth: `${tableMinWidth}px !important` } : {}">
        <thead>
          <tr>
            <th
              v-for="(column, idx) in tableSetting"
              :key="column.order"
              :class="[column.sortable ? 'sortable' : '']"
              :style="setWidth(idx)"
              @click="doSort(column.key, column.sortable)"
            >
              <slot :name="`th${idx}`" :value="column">
                <div>
                  <p :title="column.title">
                    {{ column.title }}
                  </p>
                  <div class="sortBtn" v-if="column.sortable">
                    <n-icon
                      :component="TriangleSharp"
                      :class="
                        (currentSortColumn?.key === column.key &&
                          currentSortColumn?.sortDirection) === 'asc'
                          ? 'active'
                          : ''
                      "
                    ></n-icon>
                    <n-icon
                      :component="TriangleSharp"
                      :class="
                        (currentSortColumn?.key === column.key &&
                          currentSortColumn?.sortDirection) === 'desc'
                          ? 'active'
                          : ''
                      "
                    ></n-icon>
                  </div>
                </div>
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="device in filterData"
            :key="device.deviceCode"
            :class="device._id === selectedRow ? 'selected' : ''"
          >
            <td v-for="(val, idx) in tableSetting" :title="String(device[val.key])" :key="val.key">
              <slot :name="'td' + (idx + 1)" :value="device[val.key]">
                <p>
                  {{ device[val.key] ?? '--' }}
                </p>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
      <transition name="loadingMask">
        <div class="loadingMask" v-if="loading">
          <div class="loader"></div>
        </div>
      </transition>
    </div>
    <div class="paginationWrap">
      <n-pagination
        v-model:page="paginationPage"
        :page-count="
          isNaN(Math.ceil(tableData.length / pageSizes))
            ? 0
            : Math.ceil(tableData.length / pageSizes)
        "
        size="large"
        :page-slot="7"
        :page-sizes="[pageSizes]"
      />
      <div class="dataTableInfo">當前第 {{ currentInfo }} 筆 共計 {{ tableData.length }} 筆</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.dataWrap {
  --td-height: 60px;
  height: 100%;

  // @include xxl {
  //   height: calc(100vh - 78px);
  // }

  .tableWrap {
    overflow-y: auto;
    height: calc(100% - 50px);

    // border-radius: 10px;
    border: 1px solid $border-color;
    position: relative;

    table {
      table-layout: fixed;
      border-collapse: collapse;
      width: 100% !important;
      overflow: hidden;

      tbody {
        // tr {
        //   &:nth-child(odd) {
        //     background: #f6f6f61a;
        //   }
        // }
        td {
          padding: 0 9px;
          height: var(--td-height);
        }
      }

      tr {
        &.selected {
          > td {
            color: yellow;
          }
        }

        &:hover {
          opacity: 0.9;
        }
      }

      th,
      td {
        // text-align: center;
        vertical-align: middle;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        :deep(> p) {
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }

      th {
        height: 60px;
        position: sticky;
        top: 0;
        left: 0;
        font-size: 18px;
        color: $text-color;
        background: $bg-color;
        z-index: 1;

        // &:first-child {
        //   border-radius: 10px 0 0 0;
        // }

        // &:last-child {
        //   border-radius: 0 10px 0 0;
        // }

        &.sortable {
          cursor: pointer;
        }

        > div {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 0.5rem;

          > .sortBtn {
            margin-left: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;

            > .n-icon {
              color: $border-color;
              font-size: 12px;

              &.active {
                color: #96bbff;
              }

              &:last-child {
                transform: rotate(180deg);
              }
            }
          }
        }
      }

      td {
        font-size: 1rem;
        color: $text-color;

        > .n-icon {
          cursor: pointer;
          font-size: 26px;
        }

        > :deep(div) {
          height: 100%;
          display: flex;
          align-items: center;
        }
      }
    }

    .loadingMask {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      // background: rgba(0, 0, 0, 0.1);
      background: $loading-bg-color;
      .loader {
        width: 20px;
        height: 20px;
        aspect-ratio: 1;
        animation: l13-0 2s linear infinite;
      }
      .loader::before,
      .loader::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: $loading-ball-color;
        animation: l13-1 0.5s cubic-bezier(0.5, -500, 0.5, 500) infinite;
      }
      .loader::after {
        animation-delay: -0.15s;
      }
      @keyframes l13-0 {
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes l13-1 {
        100% {
          transform: translate(0.5px);
        }
      }
    }
  }

  .paginationWrap {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: right;
    position: relative;
    // border-top: 1px solid #c1c1c1;

    > .n-pagination {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .dataTableInfo {
      font-size: 1rem;
      color: $text-color;
      padding-right: 5px;
    }
  }
}
</style>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  type Ref,
  type ComputedRef
} from 'vue'
import { storeToRefs } from 'pinia'

// import { useI18n } from 'vue-i18n';
// import { useDeviceStore } from "@/stores/deviceStore";
// import { useUserStore } from '@/stores/user'
// import { Triangle12Filled } from '@vicons/fluent'
import { TriangleSharp } from '@vicons/ionicons5'
// import { useDraggableStore } from '@/stores/draggableStore';

import _ from 'lodash'

// const { devices, deviceLoadState } = storeToRefs(useDeviceStore())
// const { currentLanguage } = storeToRefs(useUserStore())
// const { t } = useI18n();
// const { nowDraggableStore } = storeToRefs(useDraggableStore());
// const { updateValue } = useDraggableStore()

const tableWrap = ref(null as any)
/** 目前第幾頁 */
const paginationPage = ref(1)
/** 一頁顯示幾筆 */
const pageSizes = ref(10 as number)

const props = defineProps({
  /** 表格最小寬度 */
  tableMinWidth: {
    type: Number,
    default: 0
  },
  /** 是否出現 loading 狀態畫面 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 生成表格結構設定 */
  tableSetting: {
    type: Array as () => { order: number; key: string; title: string; sortable: boolean }[],
    default: () => [],
    required: true
  },
  /** 表格資料 */
  tableData: {
    type: Array as () => any[],
    default: () => []
  },
  /** 表格各欄位寬度設定 */
  tableColumnWidth: {
    type: Array as () => number[],
    default: () => []
  },
  /** td 自定義高度 */
  tdHeight: {
    type: Number,
    default: 60
  },
  selectedRow: {
    type: String,
    default: ''
  }
})

/**
 * 目前選中的排序欄位資訊
 * @property {string} key 篩選欄位的key
 * @property {'asc' | 'desc'} sortDirection 排列順序
 */
const currentSortColumn: Ref<null | { key: string; sortDirection: 'asc' | 'desc' }> = ref(null)

console.log(props.tableMinWidth)
console.log(props.tableColumnWidth)

// 自定義寬度(百分比)
const setWidth = computed(() => (idx: number) => {
  // console.log(props.tableColumnWidth.reduce((a, b) => a + b));
  if (props.tableColumnWidth.length === 0) return {}
  else if (props.tableSetting.length !== props.tableColumnWidth.length) return {}
  else if (props.tableColumnWidth.reduce((acc: number, curr: number) => acc + curr, 0) !== 100)
    return {}
  else return { width: `calc(${props.tableColumnWidth[idx]}%)` }
})

/** 依照目前所在的分頁秀指定第幾比到第幾筆的資料 */
const filterData: ComputedRef<{ [key: string]: any }[]> = computed(() => {
  // 把 sort 過後的資料再做分頁切割
  return sortData.value.slice(
    (paginationPage.value - 1) * pageSizes.value,
    paginationPage.value * pageSizes.value
  )
})

/** 右下角目前分頁資訊 (當前第 X - XX 筆) */
const currentInfo: ComputedRef<string> = computed(() => {
  /** 資料總長度 */
  const dataLength = props.tableData.length
  if (dataLength === 0) return '0'
  /** 這頁第一筆資料是第幾筆 */
  const startDataIdx = (paginationPage.value - 1) * pageSizes.value + 1
  /** 這頁最後一筆資料是第幾筆 */
  const endDataIdx = paginationPage.value * pageSizes.value
  // console.log(props.tableData.length);
  if (endDataIdx < props.tableData.length) {
    // if (currentLanguage.value === 'en_ww') return `${startDataIdx} to ${endDataIdx}`
    return `${startDataIdx} - ${endDataIdx}`
  }
  // if (currentLanguage.value === 'en_ww') return `${startDataIdx} to ${dataLength}`
  return `${startDataIdx} - ${dataLength}`
})

/** 計算目前空間一頁可以顯示多少資料(不會出現 scrollbar) */
const calWindowHeight = () => {
  pageSizes.value = Math.floor((tableWrap.value.clientHeight - 65) / props.tdHeight) || 1
  // 如果在 resize 中目前頁面大於總共分頁數則跳到第一頁
  if (paginationPage.value > Math.ceil(props.tableData.length / pageSizes.value))
    paginationPage.value = 1
}
/** 指定 td 預設高度 */
const assignTdHeight = () => {
  const dataWrap: HTMLElement = document.querySelector('.dataWrap')!
  if (!dataWrap) return
  dataWrap.style.setProperty('--td-height', `${props.tdHeight}px`)
}

/** 排序
 * @param key 要對哪個欄位篩選的
 */
const doSort = (key: string, sortable: boolean) => {
  if (!sortable) return
  // console.log(key);
  if (!currentSortColumn.value) {
    currentSortColumn.value = {
      key,
      sortDirection: 'asc'
    }
  } else {
    if (currentSortColumn.value.key === key) {
      if (currentSortColumn.value.sortDirection === 'asc') {
        currentSortColumn.value = {
          key,
          sortDirection: 'desc'
        }
      } else {
        currentSortColumn.value = null
      }
    } else {
      currentSortColumn.value = {
        key,
        sortDirection: 'asc'
      }
    }
  }
}

/** 排序 tableData */
const sortData: ComputedRef<{ [key: string]: string | number }[]> = computed(() => {
  // 沒有選擇排序的欄位回傳原陣列
  if (!currentSortColumn.value) return props.tableData

  // 解構賦值
  const { key: sortKey, sortDirection } = currentSortColumn.value

  // 由小到大
  if (sortDirection === 'asc') {
    return (
      _.chain(props.tableData)
        .cloneDeep()
        // 這樣寫可以把 null undefined 永遠排序在最後
        .orderBy(
          [
            (obj) => (obj[sortKey] === null || obj[sortKey] === undefined ? Infinity : obj[sortKey])
          ],
          ['asc']
        )
        .value()
    )
  }
  // 由大到小
  else {
    return (
      _.chain(props.tableData)
        .cloneDeep()
        // 這樣寫可以把 null undefined 永遠排序在最後
        .orderBy(
          [
            (obj) =>
              obj[sortKey] === null || obj[sortKey] === undefined ? -Infinity : obj[sortKey]
          ],
          'desc'
        )
        .value()
    )
  }
})

// 監聽資料長度 如果在篩選資料時所在分頁超出篩選後最後一頁分頁數字就跳回第一頁
// 可以再判斷精確一點
watch(
  () => props.tableData,
  () => {
    if (props.tableData.length / pageSizes.value < paginationPage.value) paginationPage.value = 1
  },
  { deep: true }
)

// 計算高度並給 resize 事件持續偵測
onMounted(() => {
  calWindowHeight()
  assignTdHeight()
  window.addEventListener('resize', calWindowHeight)
})

// 離開頁面移除監聽事件
onBeforeUnmount(() => {
  window.removeEventListener('resize', calWindowHeight)
})
</script>
