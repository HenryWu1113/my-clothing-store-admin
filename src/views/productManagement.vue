<template>
  <div class="product-management container">
    <TitleBar pageTitle="商品管理" />
    <n-data-table ref="dataTableInst" :columns="columns" :data="data" :pagination="pagination" />
  </div>
</template>

<style scoped></style>
<script setup lang="ts">
import { ref, h } from 'vue'
import { NButton } from 'naive-ui'

import TitleBar from '@/components/TitleBar.vue'

const pagination = ref({ pageSize: 5 })

const columns = [
  {
    title: '商品',
    key: 'name'
  },
  {
    title: '售價',
    key: 'price',
    sorter: (a, b) => a.price - b.price
  },
  {
    title: '上架狀態',
    key: 'sell',
    render(row) {
      return row.sell ? '上架中' : '未上架'
    },
    sorter: {
      compare: (a, b) => a.sell - b.sell,
      multiple: 3
    }
  },
  {
    title: '編輯',
    key: 'edit',
    render(row) {
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

function onOpen(name: string) {
  console.log(name)
}
</script>
