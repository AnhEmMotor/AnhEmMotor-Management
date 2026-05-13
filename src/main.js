import './assets/main.css'
import '@fontsource-variable/inter'
import { createApp } from 'vue'
import App from './App.vue'
import router from '@router/main'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from '@infrastructure/api/queryClient'
import { registerAuthFailureCallback } from '@infrastructure/api/axios'
import { useAuthStore } from '@stores/auth.store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import vi from 'element-plus/es/locale/lang/vi'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import brands icons */
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons'

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
  faCalendar,
  faClock,
  faEye,
  faEllipsisVertical,
  faChartLine,
  faCar,
  faGift,
  faPen,
  faTrash,
  faAddressCard,
  faRobot,
  faPencil,
  faCircleInfo,
  faPlus,
  faGears,
  faCheckDouble,
  faCircleCheck,
  faMotorcycle,
  faPenToSquare,
  faRotateLeft,
  faBoxArchive,
  faShop,
  faGlobe,
  faIdCard,
  faFileInvoice,
  faHistory,
  faUserCircle,
  faPaperPlane,
  faFileLines,
  faPenRuler,
  faCheckCircle,
  faChartSimple,
  faTrashCan,
  faArrowLeft,
  faImage,
  faLink,
  faExpand,
  faCloudArrowUp,
  faNewspaper,
  faCircleXmark,
  faCompress,
  faChevronUp,
  faChevronDown,
  faAlignLeft,
  faHeading,
  faXmark,
  faVideo,
  faPlay,
  faBolt,
  faCheck,
  faImages,
  faMapMarkerAlt,
  faCalendarAlt,
  faTrashAlt,
  faPause,
  faPlusCircle,
  faEyeSlash,
  faTimes,
  faDesktop,
  faMobile,
  faMousePointer,
  faInfoCircle,
  faSliders,
  faSave,
  faEdit,
  faSearchMinus,
  faSearchPlus,
  faPauseCircle,
  faPlayCircle,
  faCrop,
  faSquare,
  faArrowRight,
  faTablet,
  faRotateRight,
  faArrowsLeftRight,
  faArrowsUpDown,
  faMinus,
  faCircleNotch,
  faSort,
  faUserTie,
  faVial,
  faPenNib,
  faClockRotateLeft
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
  faGift,
  faPen,
  faTrash,
  faAddressCard,
  faRobot,
  faPencil,
  faCircleInfo,
  faPlus,
  faGears,
  faCheckDouble,
  faCircleCheck,
  faMotorcycle,
  faPenToSquare,
  faRotateLeft,
  faBoxArchive,
  faShop,
  faGlobe,
  faIdCard,
  faFileInvoice,
  faHistory,
  faUserCircle,
  faPaperPlane,
  faCalendar,
  faFileLines,
  faPenRuler,
  faCheckCircle,
  faChartSimple,
  faTrashCan,
  faArrowLeft,
  faImage,
  faLink,
  faExpand,
  faCloudArrowUp,
  faNewspaper,
  faCircleXmark,
  faCompress,
  faChevronUp,
  faChevronDown,
  faAlignLeft,
  faHeading,
  faXmark,
  faVideo,
  faPlay,
  faBolt,
  faCheck,
  faGoogle,
  faFacebook,
  faImages,
  faMapMarkerAlt,
  faCalendarAlt,
  faTrashAlt,
  faPause,
  faPlusCircle,
  faEyeSlash,
  faTimes,
  faDesktop,
  faMobile,
  faMousePointer,
  faInfoCircle,
  faSliders,
  faSave,
  faEdit,
  faSearchMinus,
  faSearchPlus,
  faPauseCircle,
  faPlayCircle,
  faCrop,
  faSquare,
  faArrowRight,
  faTablet,
  faRotateRight,
  faArrowsLeftRight,
  faArrowsUpDown,
  faMinus,
  faCircleNotch,
  faSort,
  faUserTie,
  faVial,
  faPenNib,
  faClockRotateLeft
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
app.use(ElementPlus, { locale: vi })

// Handle global authentication failures
const authStore = useAuthStore()
registerAuthFailureCallback(() => {
  authStore.performLogout(true)
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})

app.mount('#app')
