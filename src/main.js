import './assets/main.css'
import '@fontsource-variable/inter'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/main'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

app.use(router)

const options = {
  position: 'bottom-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
}

app.use(Toast, options)

app.use(createPinia())
app.use(VueQueryPlugin)

app.mount('#app')
