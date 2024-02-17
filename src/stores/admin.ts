import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { useMessage } from 'naive-ui'
import { api } from '@/plugins/axios'
import router from '@/router'

export const useAdminStore = defineStore(
  'admin',
  () => {
    // state
    const token: Ref<string> = ref('')
    const email: Ref<string> = ref('')
    const address: Ref<string> = ref('')
    const cellphone: Ref<string> = ref('')
    const name: Ref<string> = ref('')
    const sex: Ref<string> = ref('')
    const birthday: Ref<string> = ref('')
    const avatar: Ref<string> = ref('')
    const backgroundImg: Ref<string> = ref('')
    const theme: Ref<string> = ref('')
    // getters
    /** 是否登入中 */
    const isLogin: ComputedRef<boolean> = computed(() => {
      return token.value.length !== 0
    })
    // actions
    async function login(form: { account: string; password: string }) {
      const { data } = await api().post('/admins/login', form)
      console.log(data)
      router.push('/overview')
      token.value = data.result.token
      getAdmin()
    }

    async function getAdmin() {
      if (token.value.length === 0) return
      try {
        const { data } = await api('auth').get('/admins')
        console.log(data)
        email.value = data.result.email
        address.value = data.result.address ?? ''
        cellphone.value = data.result.cellphone ?? ''
        name.value = data.result.name ?? ''
        sex.value = data.result.sex ?? ''
        birthday.value = data.result.birthday ?? ''
        avatar.value = data.result.avatar ?? ''
        backgroundImg.value = data.result.backgroundImg ?? ''
        // theme.value = ''
      } catch (error) {
        logout()
      }
    }

    async function logout() {
      await api('auth').delete('/admins/logout')
      resetPiniaVal()
      return new Promise<void>((res) => {
        setTimeout(() => {
          token.value = ''
          router.push('/login')
          res()
        }, 100)
      })
    }

    /** 初始 useUserStore 值 */
    const resetPiniaVal = () => {
      token.value = ''
      email.value = ''
      address.value = ''
      cellphone.value = ''
      name.value = ''
      sex.value = ''
      birthday.value = ''
      avatar.value = ''
      backgroundImg.value = ''
      // theme.value = ''
    }

    return {
      token,
      email,
      address,
      cellphone,
      name,
      sex,
      birthday,
      avatar,
      backgroundImg,
      theme,
      isLogin,
      login,
      getAdmin,
      logout
    }
  },
  {
    persist: {
      key: 'clothing-store',
      paths: ['token']
    }
  }
)
