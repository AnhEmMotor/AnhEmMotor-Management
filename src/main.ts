import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import i18n from './i18n'                    // quốctếhóa
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // Kiểu dáng
import '@utils/sys/console.ts'                      // BangDieuKhiennhậpraNoiDung
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)
initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(i18n)
app.mount('#app')