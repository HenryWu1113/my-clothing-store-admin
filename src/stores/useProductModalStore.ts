import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useProductModalStore = defineStore('ProductModal', () => {
  // state
  const isOpen: Ref<boolean> = ref(false)
  // getters

  // actions
  function onOpen(callback?: () => void) {
    if (typeof callback === 'function') {
      callback()
    }
    isOpen.value = true
  }

  // function onClose(callback: () => void) {
  //   return function () {
  //     isOpen.value = false
  //     if (typeof callback === 'function') {
  //       callback()
  //     }
  //   }
  // }

  function onClose() {
    isOpen.value = false
  }

  return {
    isOpen,
    onOpen,
    onClose
  }
})
