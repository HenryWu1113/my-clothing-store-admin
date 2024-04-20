<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div
    :class="[
      'news-management-page',
      'myContainer',
      currentPage === Page.overview ? 'h-screen' : ''
    ]"
  >
    <TitleBar :pageTitle="pageTitle">
      <template #End>
        <n-button v-if="currentPage === Page.overview" @click="currentPage = Page.edit"
          >新增消息</n-button
        >
        <n-icon
          v-if="currentPage === Page.edit"
          :component="ArrowUndoOutline"
          @click="(currentPage = Page.overview), resetFormValue(), (quillInstance = null)"
        ></n-icon>
      </template>
    </TitleBar>

    <div v-if="currentPage === Page.edit" class="news-setting-wrap">
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large">
        <n-form-item label="消息標題" path="title">
          <n-input v-model:value="formValue.title" placeholder="請輸入消息標題" clearable />
        </n-form-item>
        <n-form-item class="images-wrap" label="圖片" path="image">
          <InputImage id="inputImageRef" @update-single="imageUpdate" />
          <label for="inputImageRef">
            <n-icon :component="PictureTwotone"></n-icon>
          </label>
          <n-image
            v-if="formValue.previewImage && formValue.previewImage.length"
            width="100"
            height="100"
            :src="formValue.previewImage"
            object-fit="cover"
            :previewed-img-props="{ style: { border: '8px solid white' } }"
          />
        </n-form-item>
        <n-form-item label="上架狀態" path="show">
          <n-switch v-model:value="formValue.show" />
        </n-form-item>
        <n-form-item v-if="false" label="消息內容" path="content">
          <n-input
            v-model:value="formValue.content"
            type="textarea"
            placeholder="請輸入消息內容"
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
      :tableData="news"
      :tableMinWidth="tableSetting.tableMinWidth"
      :tableSetting="tableSetting.tableSetting"
      :tableColumnWidth="tableSetting.tableColumnWidth"
      :loading="tableSetting.isLoading"
      :tdHeight="150"
    >
      <template #td2="{ value }">
        <div>
          {{ formatTime(value) }}
        </div>
      </template>
      <template #td3="{ value }">
        <div>
          <n-tag :type="value ? 'success' : 'info'">{{ value ? '上架中' : '未上架' }}</n-tag>
        </div>
      </template>
      <template #td4="{ value }">
        <div class="edit-wrap">
          <n-button type="info" ghost @click="editNews(value)"> 編輯 </n-button>
        </div>
      </template>
    </MydataTable>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/styles';

.news-management-page {
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
  .news-setting-wrap {
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
import type { INews } from '@/types'
import { numberToCommaString, compareObjects, formatTime } from '@/composables'

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
  tableColumnWidth: [40, 30, 20, 10],
  tableSetting: [
    {
      order: 1,
      key: 'title',
      title: '標題',
      sortable: true
    },
    {
      order: 2,
      key: 'updatedAt',
      title: '發文時間',
      sortable: true
    },
    {
      order: 3,
      key: 'show',
      title: '上架狀態',
      sortable: true
    },
    {
      order: 4,
      key: '_id',
      title: '',
      sortable: false
    }
  ]
})

const news: Ref<INews[]> = ref([])

async function getAllNews() {
  try {
    tableSetting.value.isLoading = true
    const { data } = await api('auth').get('/news/all')
    console.log(data)
    news.value = data.result
  } catch (error: any) {
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  tableSetting.value.isLoading = false
}
getAllNews()
// 表單 --------------------

const formRef = ref<any>(null)

const formValue: Ref<{ [key: string]: any }> = ref({
  _id: '',
  title: '',
  content: '',
  image: null,
  previewImage: '',
  show: true,
  loading: false
})

const rules = {
  // name: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('消息名稱必填')
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
  // show: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value && formValue.value.stockQuantity == 0) {
  //       return new Error('沒有庫存禁止上架')
  //     }
  //     return true
  //   }
  // }
  // content: {
  //   required: true,
  //   trigger: ['input', 'blur'],
  //   validator(rule: any, value: string) {
  //     if (value.length === 0) {
  //       return new Error('消息描述必填')
  //     }
  //     return true
  //   }
  // }
}

/**
 * 編輯消息
 * @param _id 消息 _id
 */
function editNews(_id: string) {
  console.log(_id)
  currentPage.value = Page.edit
  const idx = news.value.findIndex((item) => item._id === _id)

  const selectedNews = news.value[idx]

  console.log(selectedNews)

  for (const key in formValue.value) {
    if (key === 'image') {
      continue
    } else if (key === 'previewImage') {
      formValue.value[key] = selectedNews.image
      // @ts-ignore
    } else if (selectedNews[key] !== null || selectedNews[key] !== void 0) {
      // @ts-ignore
      formValue.value[key] = selectedNews[key]
    }
  }

  console.log(formValue.value)
}

/** 重製 formValue */
function resetFormValue() {
  formValue.value = {
    _id: '',
    title: '',
    content: '',
    image: null,
    previewImage: '',
    show: true,
    loading: false
  }
}

/** 新增編輯消息送 api */
async function submitForm() {
  formValue.value.loading = true
  const fd = new FormData()
  for (const key in formValue.value) {
    if (['_id', 'previewImage', 'loading'].includes(key)) continue
    else {
      if (key === 'image'! && !formValue.value[key]) continue
      fd.append(key, formValue.value[key])
    }
  }

  try {
    if (formValue.value._id.length === 0) {
      await api('auth').post('/news', fd)

      message.success('新增成功')
      currentPage.value = Page.overview
      resetFormValue()
    } else {
      await api('auth').patch(`/news/${formValue.value._id}`, fd)
      message.success('更新成功')
      // 把 image 先變空才不會重複上傳
      formValue.value.image = null
    }
    getAllNews()
  } catch (error: any) {
    console.log(error)
    message.error(error.isAxiosError ? error.response.data.message : error.message)
  }
  formValue.value.loading = false
}

/**
 * 新增編輯消息時的格式確認
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
  if (currentPage.value === Page.overview) return '消息管理'
  else if (currentPage.value === Page.edit && formValue.value._id.length) return '編輯消息'
  else if (currentPage.value === Page.edit && !formValue.value._id.length) return '新增消息'
  else return '錯誤頁'
})

function imageUpdate(obj: { image: File | null; previewImage: string }) {
  console.log(obj)
  formValue.value.image = obj.image || ''
  formValue.value.previewImage = obj.previewImage
}

/** vue-quill實例 */
const quillInstance = ref<any>(null)

/**
 * 元件準備好觸發 ready 賦予實例
 * @param quill 元件傳出來的實例
 */
const quillReady = (quill: any) => {
  quillInstance.value = quill
  quillInstance.value.root.innerHTML = formValue.value.content
  console.log(quill)
}

/** 有變化就賦值給 formValue.content */
const updateQuill = (_: any) => {
  console.log(quillInstance.value.root.innerHTML)
  formValue.value.content = quillInstance.value.root.innerHTML
}
</script>
