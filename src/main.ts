import App from "./App.vue";
import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { initRouter } from "./router";
import i18n from "./i18n";
import "@styles/core/tailwind.css";
import "@styles/index.scss";
import { setupGlobDirectives } from "./directives";
import { setupErrorHandle } from "@/common/utils/sys/error-handle";
import { StorageKeyManager } from "@/common/utils/storage/storage-key-manager";
import axios from "axios";
import { useUserStore } from "@/application/store/user";

document.addEventListener("touchstart", function () {}, { passive: false });

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  const storageKeyManager = new StorageKeyManager();

  pinia.use(
    createPersistedState({
      key: (storeId: string) => storageKeyManager.getStorageKey(storeId),
      storage: localStorage,
      serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
    }),
  );

  app.use(pinia);

  // Proactively refresh access token before routing
  refreshTokenOnStartup();

  initRouter(app);
  setupGlobDirectives(app);
  setupErrorHandle(app);
  app.use(VueQueryPlugin);
  app.use(i18n);
  app.mount("#app");
}

async function refreshTokenOnStartup() {
  const userData = localStorage.getItem("user");
  if (!userData) return;
  try {
    const data = JSON.parse(userData);
    if (!data.accessToken) return;
  } catch {
    return;
  }

  try {
    const apiBase =
      import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
      "http://localhost:5000";
    const refreshResponse = await axios.post(
      `${apiBase}/api/v1/auth/refresh-token`,
      {},
      { withCredentials: true },
    );
    const newAccessToken =
      refreshResponse.data?.data?.accessToken ||
      refreshResponse.data?.accessToken;
    if (newAccessToken) {
      useUserStore().setToken(newAccessToken);
    }
  } catch {
    // Refresh failed (cookie expired / invalid) — interceptor will
    // handle logout on first real request. Silent fail by design.
  }
}

bootstrap();
