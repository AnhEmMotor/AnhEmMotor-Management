import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { staticRoutes } from './routes/staticRoutes'
import { configureNProgress } from '@/utils/router'
import { setupBeforeEachGuard } from './guards/beforeEach'
import { setupAfterEachGuard } from './guards/afterEach'

// xâyRoutingthựcví dụ
export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes // tĩnhtháiRouting
})

// ban đầuđầuhóaRouting
export function initRouter(app: App<Element>): void {
  configureNProgress() // Phía trênThanh tiến trình
  setupBeforeEachGuard(router) // Routingtrướcđặtgiữvệ
  setupAfterEachGuard(router) // Routingsauđặtgiữvệ
  app.use(router)
}

// chủtrangđường，MacDinhkhiếndùngMenuthứmộtchiếccóhiệuđường，CauHinhsaukhiếndùngnàyđường
export const HOME_PAGE_PATH = ''
