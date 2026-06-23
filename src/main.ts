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

document.addEventListener("touchstart", function () {}, { passive: false });

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
initRouter(app);
setupGlobDirectives(app);
setupErrorHandle(app);

app.use(VueQueryPlugin);
app.use(i18n);
app.mount("#app");
