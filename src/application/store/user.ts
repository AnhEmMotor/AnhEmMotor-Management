import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { LanguageEnum } from "@/common/enums/appEnum";
import { router } from "@/router";
import { useSettingStore } from "./setting";
import { useWorktabStore } from "./worktab";
import { AppRouteRecord } from "@/types/router";
import { setPageTitle } from "@/common/utils/router";
import { resetRouterState } from "@/router/guards/beforeEach";
import { useMenuStore } from "./menu";
import { StorageConfig } from "@/common/utils/storage/storage-config";
import i18n from "@/i18n";

export const useUserStore = defineStore(
  "userStore",
  () => {
    const language = ref(LanguageEnum.VI);

    const isLogin = ref(false);

    const isLock = ref(false);

    const lockPassword = ref("");

    const info = ref<Partial<Api.Auth.UserInfo>>({});

    const searchHistory = ref<AppRouteRecord[]>([]);

    const accessToken = ref("");

    const refreshToken = ref("");

    const getUserInfo = computed(() => info.value);

    const getSettingState = computed(() => useSettingStore().$state);

    const getWorktabState = computed(() => useWorktabStore().$state);

    const setUserInfo = (newInfo: Api.Auth.UserInfo) => {
      info.value = newInfo;
    };

    const setLoginStatus = (status: boolean) => {
      isLogin.value = status;
    };

    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value);
      language.value = lang;
      i18n.global.locale.value = lang;
    };

    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list;
    };

    const setLockStatus = (status: boolean) => {
      isLock.value = status;
    };

    const setLockPassword = (password: string) => {
      lockPassword.value = password;
    };

    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken;
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken;
      }
    };

    const logOut = () => {
      const currentUserId = info.value.userId;
      if (currentUserId) {
        localStorage.setItem(
          StorageConfig.LAST_USER_ID_KEY,
          String(currentUserId),
        );
      }

      info.value = {};

      isLogin.value = false;

      isLock.value = false;

      lockPassword.value = "";

      accessToken.value = "";

      refreshToken.value = "";

      sessionStorage.removeItem("iframeRoutes");

      useMenuStore().setHomePath("");

      resetRouterState(500);

      const currentRoute = router.currentRoute.value;
      const redirect = !currentRoute.path.includes("/login")
        ? currentRoute.fullPath
        : undefined;
      router.push({
        name: "Login",
        query: redirect ? { redirect } : undefined,
      });
    };

    const checkAndClearWorktabs = () => {
      const lastUserId = localStorage.getItem(StorageConfig.LAST_USER_ID_KEY);
      const currentUserId = info.value.userId;

      if (!currentUserId) return;

      if (!lastUserId) {
        return;
      }

      if (String(currentUserId) !== lastUserId) {
        const worktabStore = useWorktabStore();
        worktabStore.opened = [];
        worktabStore.keepAliveExclude = [];
      }

      localStorage.removeItem(StorageConfig.LAST_USER_ID_KEY);
    };

    const mapUserInfo = (data: any): Api.Auth.UserInfo => {
      return {
        userId: data.id || info.value.userId || "",
        userName:
          data.fullName ||
          data.nickName ||
          data.userName ||
          info.value.userName ||
          "",
        email: data.email || info.value.email || "",
        avatar: data.avatarUrl || info.value.avatar || "",
        roles: data.roles || info.value.roles || [],
        buttons: data.permissions || info.value.buttons || [],
      };
    };

    let abortController: AbortController | null = null;
    let retryTimeout: any = null;
    let retryDelay = 1000;
    const sseStatus = ref<
      "disconnected" | "connecting" | "connected" | "error"
    >("disconnected");

    const connectSSE = async (retryCount = 0) => {
      if (abortController || !isLogin.value) return;

      const token = accessToken.value;
      if (!token) return;

      abortController = new AbortController();
      const baseUrl =
        import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
        "http://localhost:5000";
      const sseUrl = `${baseUrl}/api/v1/user/me`;

      sseStatus.value = "connecting";

      try {
        await fetchEventSource(sseUrl, {
          method: "GET",
          signal: abortController.signal,
          openWhenHidden: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          async onopen(response) {
            if (
              response.ok &&
              response.headers
                .get("content-type")
                ?.includes("text/event-stream")
            ) {
              sseStatus.value = "connected";
              retryDelay = 1000;
              return;
            }

            if (response.status === 401) {
              throw new Error("SSE_AUTH_ERROR");
            }

            if (
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              sseStatus.value = "error";
              throw new Error(`Fatal SSE error: ${response.status}`);
            }
            throw new Error(`SSE Connection failed: ${response.status}`);
          },
          onmessage(msg) {
            if (!msg.data || msg.data === "heartbeat") return;
            try {
              const data = JSON.parse(msg.data);
              if (data && (data.userName || data.id)) {
                info.value = mapUserInfo(data);
              }
            } catch (e) {
              console.error("Failed to parse SSE message data:", e);
            }
          },
          onclose() {
            sseStatus.value = "disconnected";
            abortController = null;
            if (isLogin.value) {
              const delay = Math.min(retryDelay, 30000);
              retryDelay = Math.min(delay * 2, 30000);
              retryTimeout = setTimeout(() => connectSSE(), delay);
            }
          },
          onerror(err) {
            sseStatus.value = "error";
            if (err.message === "SSE_AUTH_ERROR") {
              if (abortController) {
                abortController.abort();
                abortController = null;
              }
              if (retryCount < 3) {
                import("@/common/utils/http")
                  .then((module) => {
                    module.default
                      .get("/api/v1/user/me")
                      .then(() => {
                        setTimeout(() => connectSSE(retryCount + 1), 1000);
                      })
                      .catch(() => {
                        logOut();
                      });
                  })
                  .catch(() => logOut());
              } else {
                logOut();
              }
              throw err;
            }

            if (err.message.includes("Fatal")) {
              if (abortController) {
                abortController.abort();
                abortController = null;
              }
              throw err;
            }
          },
        });
      } catch (err: any) {
        if (err.message !== "SSE_AUTH_ERROR") {
          sseStatus.value = "error";
          abortController = null;
          if (isLogin.value && !err.message?.includes("Fatal")) {
            const delay = Math.min(retryDelay, 30000);
            retryDelay = Math.min(delay * 2, 30000);
            retryTimeout = setTimeout(() => connectSSE(), delay);
          }
        }
      }
    };

    const closeSSE = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      if (abortController) {
        abortController.abort();
        abortController = null;
        sseStatus.value = "disconnected";
      }
      retryDelay = 1000;
    };

    const reconnectSSE = () => {
      closeSSE();
      connectSSE();
    };

    watch(
      () => isLogin.value,
      (loggedIn) => {
        if (loggedIn) {
          connectSSE();
        } else {
          closeSSE();
        }
      },
      { immediate: true },
    );

    watch(
      () => [info.value?.buttons, info.value?.roles],
      (newVal, oldVal) => {
        if (!isLogin.value) return;

        if (oldVal && JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

        window.dispatchEvent(new CustomEvent("auth:permissions-changed"));
      },
      { deep: true },
    );

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      refreshToken,
      getUserInfo,
      getSettingState,
      getWorktabState,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut,
      checkAndClearWorktabs,
      sseStatus,
      connectSSE,
      closeSSE,
      reconnectSSE,
    };
  },
  {
    persist: {
      key: "user",
      storage: localStorage,
    },
  },
);
