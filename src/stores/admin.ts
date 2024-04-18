import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { useMessage } from 'naive-ui'
import { api } from '@/plugins/axios'
import router from '@/router'

export const useAdminStore = defineStore(
  'admin',
  () => {
    // state
    const adminId: Ref<string> = ref('')
    const account: Ref<string> = ref('')
    const address: Ref<string> = ref('')
    const avatar: Ref<string> = ref('')
    const birthday: Ref<string> = ref('')
    const cellphone: Ref<string> = ref('')
    const disabled: Ref<boolean> = ref(false)
    const email: Ref<string> = ref('')
    const height: Ref<string> = ref('')
    const weight: Ref<string> = ref('')
    const introduce: Ref<string> = ref('')
    const name: Ref<string> = ref('')
    const role: Ref<string> = ref('')
    const sex: Ref<string> = ref('')
    const store: Ref<string> = ref('')
    const backgroundImg: Ref<string> = ref('')
    const token: Ref<string> = ref('')
    // getters
    /** 是否登入中 */
    const isLogin: ComputedRef<boolean> = computed(() => {
      return token.value.length !== 0
    })
    // actions
    async function login(form: { account: string; password: string }) {
      const { data } = await api().post('/admins/login', form)
      console.log(data)
      router.push('/outfit')
      token.value = data.result.token
      getAdmin()
    }

    async function getAdmin() {
      if (token.value.length === 0) return
      try {
        const { data } = await api('auth').get('/admins')
        console.log(data)
        adminId.value = data.result._id
        account.value = data.result.account
        email.value = data.result.email
        disabled.value = data.result.disabled
        address.value = data.result.address ?? ''
        cellphone.value = data.result.cellphone ?? ''
        name.value = data.result.name ?? ''
        sex.value = data.result.sex ?? ''
        birthday.value = data.result.birthday ?? ''
        height.value = data.result.height ?? ''
        weight.value = data.result.weight ?? ''
        introduce.value = data.result.introduce ?? ''
        store.value = data.result.store.name ?? ''
        role.value = data.result.role ?? ''
        avatar.value =
          data.result.avatar ?? `https://source.boringavatars.com/beam/160/${adminId.value}`
        backgroundImg.value = data.result.backgroundImg ?? ''
        // theme.value = ''
      } catch (error) {
        logout()
      }
    }

    async function editAdmin(adminInfo: {
      name?: string
      sex?: string
      birthday?: string
      height?: string
      weight?: string
      address?: string
      cellphone?: string
      email?: string
      introduce?: string
    }) {
      const { data } = await api('auth').patch('admins', adminInfo)
      name.value = data.result.name ?? ''
      sex.value = data.result.sex ?? ''
      birthday.value = data.result.birthday ?? ''
      height.value = data.result.height ?? ''
      weight.value = data.result.weight ?? ''
      cellphone.value = data.result.cellphone ?? ''
      address.value = data.result.address ?? ''
      email.value = data.result.email ?? ''
      introduce.value = data.result.introduce ?? ''
    }

    async function editAdminImage(image: File, type: 'avatar' | 'backgroundImg') {
      const fd = new FormData()
      fd.append(type, image)
      if (type === 'avatar') {
        const { data } = await api('auth').patch('admins/avatar', fd)
        avatar.value = data.result.avatar ?? ''
      } else if (type === 'backgroundImg') {
        const { data } = await api('auth').patch('admins/backgroundImg', fd)
        backgroundImg.value = data.result.backgroundImg ?? ''
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
      adminId.value = ''
      account.value = ''
      address.value = ''
      avatar.value = ''
      birthday.value = ''
      cellphone.value = ''
      disabled.value = false
      email.value = ''
      height.value = ''
      weight.value = ''
      introduce.value = ''
      name.value = ''
      sex.value = ''
      store.value = ''
      backgroundImg.value = ''
      role.value = ''
      token.value = ''
    }

    return {
      adminId,
      account,
      token,
      email,
      address,
      cellphone,
      disabled,
      name,
      sex,
      birthday,
      avatar,
      height,
      weight,
      introduce,
      backgroundImg,
      store,
      role,
      isLogin,
      login,
      getAdmin,
      editAdmin,
      editAdminImage,
      logout
    }
  },
  {
    persist: {
      key: 'clothing-store',
      paths: ['token', 'role']
    }
  }
)
