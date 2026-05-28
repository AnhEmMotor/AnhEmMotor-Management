import App from './App.vue'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { initStore } from './store'                 
import { initRouter } from './router'               
import i18n from './i18n'                    
import '@styles/core/tailwind.css'                  
import '@styles/index.scss'                         
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

app.use(VueQueryPlugin)
app.use(i18n)
app.mount('#app')