import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const app = createApp(App)
app.use(router)
app.mount('#app')
