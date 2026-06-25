import type { App } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { staticRoutes } from "./routes/staticRoutes";
import { configureNProgress } from "@/common/utils/router";
import { setupBeforeEachGuard } from "./guards/beforeEach";
import { setupAfterEachGuard } from "./guards/afterEach";

export const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
});

export function initRouter(app: App<Element>): void {
  configureNProgress();
  setupBeforeEachGuard(router);
  setupAfterEachGuard(router);
  app.use(router);
}

export const HOME_PAGE_PATH = "";
