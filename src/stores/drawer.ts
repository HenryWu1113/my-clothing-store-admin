import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { useMessage } from 'naive-ui'
import { api } from '@/plugins/axios'
import router from '@/router'

export const useDrawerStore = defineStore('drawer', () => {
  // state
  const isOpen: Ref<boolean> = ref(false)
  // getters

  // actions
  function onOpen() {
    isOpen.value = true
  }

  function onClose() {
    isOpen.value = false
  }

  return {
    isOpen,
    onOpen,
    onClose
  }
})
