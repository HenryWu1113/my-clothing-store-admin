import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './styles.css'
import './styles/styles.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)
app.use(router)
app.use(naive)
app.mount('#app')
