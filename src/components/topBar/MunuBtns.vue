<template>
  <div class="page-menu-btns-wrap">
    <div class="btn" v-for="menu in filterMenuArr" :key="menu.key" @click="menu.onClick">
      <n-icon :component="menu.icon"></n-icon>
    </div>
    <n-dropdown trigger="click" :options="currentOptions" @select="handleSelect" size="huge">
      <div class="admin-btn">
        <n-icon :component="MenuOutlined"></n-icon>
        <div class="admin-icon-wrap">
          <n-icon :component="UserOutlined"></n-icon>
        </div>
      </div>
    </n-dropdown>
  </div>
</template>
<style lang="scss" scoped>
@import '@/styles/styles';

.page-menu-btns-wrap {
  display: flex;
  align-items: center;
  margin-left: 1.5rem;
  gap: 0.5rem;
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 50%;
    font-size: 1.6rem;
    color: $text-color;
    cursor: pointer;
    &:hover {
      background: $border-color;
    }
    .n-icon {
      color: $text-color;
    }
  }

  .admin-btn {
    padding: 0.25rem 0.5rem;
    transition: 0.15s;
    border-radius: 9999px;
    border: 1px solid $border-color;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.2rem;
    > .n-icon {
      color: $text-color;
    }
    &:hover {
      box-shadow: 0 5px 10px $border-color;
    }
    .admin-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      background: $border-color;
      border-radius: 50%;
      padding: 0.3rem;
      font-size: 1.5rem;
      color: white;
      font-weight: bold;
    }
  }
}
</style>
<script setup lang="ts">
import { ref, reactive, shallowRef, h, computed, type Ref } from 'vue'
import {
  SunnyOutline,
  PersonCircleOutline as UserIcon,
  ReaderSharp as OrderIcon,
  LogOutOutline as LogoutIcon,
  LogInOutline as LoginIcon,
  Add as singupIcon,
  BuildOutline
} from '@vicons/ionicons5'
import { MenuOutlined, UserOutlined } from '@vicons/antd'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { useDrawerStore } from '@/stores/drawer'
import useTheme from '@/composables/useTheme'

const { theme } = useTheme()

const router = useRouter()
const message = useMessage()

const { onOpen } = useDrawerStore()
const admin = useAdminStore()
const { isLogin, role } = storeToRefs(admin)

/** 登入、註冊彈出的 Modal 控制實例 */
const modalControll = ref({
  isLoginOpen: false,
  isRegisterOpen: false
})

/** 右上 menu (愛心、購物車、畫面主題) */
const menuArr = shallowRef([
  {
    key: 'management',
    icon: BuildOutline,
    onClick: () => {
      onOpen()
    }
  },
  {
    key: 'theme',
    icon: SunnyOutline,
    onClick: changeTheme
  }
])

function changeTheme() {
  const reverseObj = {
    light: 'dark',
    dark: 'light'
  }
  theme.value = reverseObj[theme.value] as 'light' | 'dark'
}

// ------------------------

const renderIcon = (icon: Component) => {
  return () => {
    return h(
      NIcon,
      { size: '24' },
      {
        default: () => h(icon)
      }
    )
  }
}

/** 個人選單選項 */
const options: IoptionsType[] = reactive([
  {
    label: '登入',
    key: 'login',
    icon: renderIcon(LoginIcon),
    login: false,
    goPage: false
  },
  {
    label: '註冊',
    key: 'register',
    icon: renderIcon(singupIcon),
    login: false,
    goPage: false
  },
  {
    label: '個人資訊',
    key: 'profile',
    icon: renderIcon(UserIcon),
    login: true,
    goPage: true
  },
  {
    label: '登出',
    key: 'logout',
    icon: renderIcon(LogoutIcon),
    login: true,
    goPage: false
  }
])

/** 切換登入 */
const switchLogin = () => {
  modalControll.value.isLoginOpen = true
  modalControll.value.isRegisterOpen = false
}

/** 切換註冊 */
const switchRegister = () => {
  modalControll.value.isRegisterOpen = true
  modalControll.value.isLoginOpen = false
}

/** 點擊個人選單選項 */
const handleSelect = async (key: string | number, option: IoptionsType) => {
  console.log(option)
  if (option.goPage) {
    router.push(`/${key}`)
  }

  if (option.key === 'logout') {
    try {
      await admin.logout()
      message.success('登出成功')
    } catch (error) {
      message.error('登出失敗')
    }
  }

  if (option.key === 'login') {
    switchLogin()
  } else if (option.key === 'register') {
    switchRegister()
  }
}

/** 登入、未登入選單 */
const currentOptions = computed(() => {
  return options.filter((item) => isLogin.value === item.login)
})

/** 是否有權限(管理者、員工) */
const filterMenuArr = computed(() => {
  console.log(role.value)
  if (role.value === 'manager') return menuArr.value
  return menuArr.value.filter((item) => item.key !== 'management')
})
// ----------

/** 個人選單選項 interface */
interface IoptionsType {
  label: string
  key: string
  icon: any
  login: boolean
  goPage: boolean
}
</script>
