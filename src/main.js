import './assets/main.css'
import '@fontsource-variable/inter'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/main'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from '@infrastructure/api/queryClient'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { 
  faUsersRays, 
  faUserPlus, 
  faEnvelopeOpenText, 
  faCalendarCheck, 
  faCommentDots,
  faRotate,
  faMagnifyingGlass,
  faPhone,
  faEnvelope,
  faClock,
  faEye,
  faEllipsisVertical,
  faChartLine,
  faCar,
  faGift
} from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(
  faUsersRays, 
  faUserPlus, 
  faEnvelopeOpenText, 
  faCalendarCheck, 
  faCommentDots,
  faRotate,
  faMagnifyingGlass,
  faPhone,
  faEnvelope,
  faClock,
  faEye,
  faEllipsisVertical,
  faChartLine,
  faCar,
  faGift
)

const app = createApp(App)

// Register FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon)

const piniaInstance = createPinia()
app.use(piniaInstance)
app.use(router)

const toastOptions = {
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

app.use(Toast, toastOptions)
app.use(VueQueryPlugin, { queryClient })
app.mount('#app')
