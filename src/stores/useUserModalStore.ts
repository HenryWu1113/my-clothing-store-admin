import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserModalStore = defineStore('UserModal', () => {
  // state
  const isOpen: Ref<boolean> = ref(false)
  // getters

  // actions
  function onOpen() {
    isOpen.value = true
  }

  function onClose(callback: () => void) {
    return function () {
      isOpen.value = false
      if (typeof callback === 'function') {
        callback()
      }
    }
  }

  return {
    isOpen,
    onOpen,
    onClose
  }
})
