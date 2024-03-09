<template>
  <n-config-provider
    :locale="locale"
    :date-locale="dateLocale"
    :theme="isLight ? void 0 : darkTheme"
  >
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-back-top class="backTop" :right="20" :bottom="20" />
          <RouterView />
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
import { ref, reactive, shallowRef, h } from 'vue'
import { RouterView } from 'vue-router'
import { darkTheme } from 'naive-ui'
import type { NLocale, NDateLocale } from 'naive-ui'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import useTheme from '@/composables/useTheme'

const { isLight } = useTheme()

const router = useRouter()
const { getAdmin } = useAdminStore()
const { isLogin } = storeToRefs(useAdminStore())

const locale = ref(null as NLocale | null)
const dateLocale = ref(null as NDateLocale | null)

if (!isLogin.value) {
  router.push('/login')
}

getAdmin()
</script>
