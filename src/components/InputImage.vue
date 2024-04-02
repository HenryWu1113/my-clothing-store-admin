<template>
  <input :id="id" type="file" accept="image/*" :multiple="multiple" @change="loadImgAndShow" />
</template>

<style scoped lang="scss">
input[type='file'] {
  display: none;
}
</style>

<script setup lang="ts">
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  max: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits<{
  (e: 'update-single', obj: { image: File | null; previewImage: string }): void
  (e: 'update-multiple', obj: { images: FileList; previewImages: string[] }): void
}>()

// 壓縮 base64 圖片
const compressBase64Image = (
  base64: string,
  maxSize: number,
  callback?: (compressedBase64: string, ifCompress: '有壓縮' | '無壓縮') => {}
) => {
  return new Promise<string>((res, rej) => {
    let img = new Image()
    img.src = base64
    img.onload = function () {
      if (base64.length / 1024 <= 500) {
        if (callback) callback(base64, '無壓縮')
        res(base64)
        return
      }
      let canvas = document.createElement('canvas')
      let ctx: any = canvas.getContext('2d')
      let width = img.width
      let height = img.height
      let scale = 1

      canvas.width = width * scale
      canvas.height = height * scale

      // drawImage(放 img 元素他會取裡面的 src, 距離左邊 px, 距離上方 px, 要畫的寬度, 要畫的高度)
      ctx.drawImage(img, 0, 0, width * scale, height * scale)
      let compressedBase64 = canvas.toDataURL('image/png', 0.9)
      let i = 1
      console.log('第' + i + '次')
      while (compressedBase64.length > maxSize * 1024) {
        i++
        console.log('第' + i + '次')
        // 這樣好像會快一點
        if (compressedBase64.length / (maxSize * 1024) > 4) {
          scale *= 0.5
        } else if (compressedBase64.length / (maxSize * 1024) > 2) {
          scale *= 0.7
        } else {
          scale *= 0.9
        }
        canvas.width = width * scale
        canvas.height = height * scale
        ctx.drawImage(img, 0, 0, width * scale, height * scale)
        compressedBase64 = canvas.toDataURL('image/png', 0.9)
      }
      res(compressedBase64)
      if (callback) callback(compressedBase64, '有壓縮')
    }
  })
}

/**
 * 處理單一或多照片 並會 emit 事件出去
 * @param files
 * @param isMultiple
 */
async function processImage(files: FileList, isMultiple: boolean) {
  // 單選
  if (!isMultiple) {
    const reader = new FileReader()

    reader.readAsDataURL(files[0])

    reader.onload = async function (e: any) {
      const data = await compressBase64Image(e.target.result, 500)
      return emit('update-single', {
        image: files[0],
        previewImage: data
      })
    }
  } else {
    // 多選

    const base64Arr: string[] = []

    for (const file of files) {
      const reader = new FileReader()

      reader.readAsDataURL(file)

      await new Promise<void>((res, rej) => {
        reader.onload = async function (e: any) {
          const data = await compressBase64Image(e.target.result, 500)
          base64Arr.push(data)
          res()
        }
      })
    }

    return emit('update-multiple', {
      images: files,
      previewImages: base64Arr
    })
  }
}

/**
 * 預覽圖片和更新物件值事件
 * @param e change 事件
 */
function loadImgAndShow(e: Event) {
  // console.log(e)

  const inputElement = e.target as HTMLInputElement

  const files: FileList | null = inputElement.files ?? null
  if (files === null) throw new Error('沒有 files 欄位')
  // console.log(files)

  if (inputElement.multiple) {
    console.log('多選')
    if (files.length === 0) {
      return emit('update-multiple', {
        images: files,
        previewImages: []
      })
    }
    if (files.length > props.max) {
      return message.warning(`超過上傳上限數量，最多 ${props.max} 張!`)
    }

    for (let file of files) {
      if (file.size > 1024 * 1024) {
        return message.warning('有圖片超過 1M')
      }
    }
  } else {
    console.log('單選')
    if (files.length === 0) {
      return emit('update-single', {
        image: null,
        previewImage: ''
      })
    }
    // console.log(files[0])
    if (files[0].size > 1024 * 1024) {
      return message.warning('圖片過大')
    }
  }

  // 處理文件
  processImage(files, inputElement.multiple)
}
</script>
