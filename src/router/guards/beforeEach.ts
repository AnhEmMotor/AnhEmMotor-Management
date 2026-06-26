import type { Router, RouteLocationNormalized } from "vue-router";
import { nextTick } from "vue";
import NProgress from "nprogress";
import type { NavigationGuardReturn } from "vue-router";
import { useSettingStore } from "@/application/store/setting";
import { useUserStore } from "@/application/store/user";
import { useMenuStore } from "@/application/store/menu";
import { setWorktab } from "@/common/utils/navigation";
import { setPageTitle } from "@/common/utils/router";
import type { AppRouteRecordRaw } from "@/common/utils/router";
import { RoutesAlias } from "../routesAlias";
import { staticRoutes } from "../routes/staticRoutes";
import { loadingService } from "@/common/utils/ui";
import { useCommon } from "@/common/composables/useCommon";
import { useWorktabStore } from "@/application/store/worktab";
import { fetchGetUserInfo } from "@/api/auth";
import { ApiStatus } from "@/common/utils/http/status";
import { isHttpError } from "@/common/utils/http/error";
import {
  RouteRegistry,
  MenuProcessor,
  IframeRouteManager,
  RoutePermissionValidator,
} from "../core";

let routeRegistry: RouteRegistry | null = null;

let menuProcessor: MenuProcessor | null = null;

const getMenuProcessor = (): MenuProcessor => {
  if (!menuProcessor) {
    menuProcessor = new MenuProcessor();
  }
  return menuProcessor;
};

let pendingLoading = false;

let routeInitFailed = false;

let routeInitInProgress = false;

export function getPendingLoading(): boolean {
  return pendingLoading;
}

export function resetPendingLoading(): void {
  pendingLoading = false;
}

export function getRouteInitFailed(): boolean {
  return routeInitFailed;
}

export function resetRouteInitState(): void {
  routeInitFailed = false;
  routeInitInProgress = false;
}

export function setupBeforeEachGuard(router: Router): void {
  routeRegistry = new RouteRegistry(router);

  window.addEventListener("auth:permissions-changed", async () => {
    try {
      const menuList = await getMenuProcessor().getMenuList();
      const menuStore = useMenuStore();
      menuStore.setMenuList(menuList);

      const currentRoute = router.currentRoute.value;
      if (currentRoute.matched.length > 0) {
        if (isStaticRoute(currentRoute.path)) {
          return;
        }
        const hasAccess = RoutePermissionValidator.hasPermission(
          currentRoute.path,
          menuList,
        );
        if (!hasAccess) {
          const { homePath } = useCommon();
          router.push(homePath.value || "/");
        }
      }
    } catch (err) {
      console.error("Failed to regenerate menus on permission change:", err);
    }
  });

  router.beforeEach(
    async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
      try {
        return await handleRouteGuard(to, from, router);
      } catch (error) {
        console.error("[RouteGuard] Routing error:", error);
        closeLoading();
        return { name: "Exception500" };
      }
    },
  );
}

function closeLoading(): void {
  if (pendingLoading) {
    nextTick(() => {
      loadingService.hideLoading();
      pendingLoading = false;
    });
  }
}

async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  router: Router,
): Promise<NavigationGuardReturn> {
  const settingStore = useSettingStore();
  const userStore = useUserStore();

  if (settingStore.showNprogress) {
    NProgress.start();
  }

  const loginRedirect = handleLoginStatus(to, userStore);
  if (loginRedirect) {
    return loginRedirect;
  }

  if (routeInitFailed) {
    if (to.matched.length > 0) {
      return true;
    } else {
      return { name: "Exception500", replace: true };
    }
  }

  if (!routeRegistry?.isRegistered() && userStore.isLogin) {
    if (routeInitInProgress) {
      return false;
    }
    return await handleDynamicRoutes(to, router);
  }

  const rootRedirect = handleRootPathRedirect(to);
  if (rootRedirect) {
    return rootRedirect;
  }

  if (to.matched.length > 0) {
    const fromModule = from.path.split("/")[1];
    const toModule = to.path.split("/")[1];

    if (
      from.path !== "/" &&
      fromModule &&
      toModule &&
      fromModule !== toModule &&
      toModule !== "workspace" &&
      toModule !== "auth"
    ) {
      pendingLoading = true;
      loadingService.showLoading("Đang truy cập hệ thống...");
    }

    setWorktab(to);
    setPageTitle(to);
    return true;
  }

  return { name: "Exception404" };
}

function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
): any {
  // Add a fallback check for isLogin in case pinia hydration is delayed or failed
  if (!userStore.isLogin) {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.isLogin && parsed.accessToken) {
          userStore.setLoginStatus(true);
          userStore.setToken(parsed.accessToken);
        }
      }
    } catch (e) {
      console.warn("Fallback hydration failed:", e);
    }
  }

  if (userStore.isLogin) {
    if (to.path === RoutesAlias.Login || to.path === "/auth/login") {
      return { path: "/workspace", replace: true };
    }
    return null;
  }

  if (
    to.path === RoutesAlias.Login ||
    to.path === "/auth/login" ||
    (isStaticRoute(to.path) &&
      to.path !== "/" &&
      to.path !== "/workspace" &&
      to.path !== "/auth/portal")
  ) {
    return null;
  }

  userStore.logOut();

  if (to.path === "/") {
    return {
      name: "Login",
    };
  }

  let redirectUrl = to.fullPath;
  if (to.query && to.query.redirect) {
    let target = to.query.redirect as string;
    while (target.includes("/login") || target.includes("redirect=")) {
      const match = target.match(/[?&]redirect=([^&]+)/);
      if (match && match[1]) {
        target = decodeURIComponent(match[1]);
      } else {
        target = "/";
        break;
      }
    }
    redirectUrl = target;
  }

  if (
    redirectUrl === "/" ||
    redirectUrl.includes("/login") ||
    redirectUrl.includes(RoutesAlias.Login)
  ) {
    return {
      name: "Login",
    };
  }

  return {
    name: "Login",
    query: { redirect: redirectUrl },
  };
}

function isStaticRoute(path: string): boolean {
  const checkRoute = (
    routes: AppRouteRecordRaw[],
    targetPath: string,
  ): boolean => {
    return routes.some((route) => {
      if (route.name === "Exception404") {
        return true;
      }

      const routePath = route.path;
      const pattern = routePath
        .replace(/:[^/]+/g, "[^/]+")
        .replace(/\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`);

      if (regex.test(targetPath)) {
        return true;
      }
      if ("children" in route && route.children && route.children.length > 0) {
        return checkRoute(route.children as AppRouteRecordRaw[], targetPath);
      }
      return false;
    });
  };

  return checkRoute(staticRoutes, path);
}

async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  router: Router,
): Promise<NavigationGuardReturn> {
  routeInitInProgress = true;

  pendingLoading = true;
  loadingService.showLoading();

  try {
    await fetchUserInfo();
    const processor = getMenuProcessor();
    const menuList = await processor.getMenuList();

    if (!processor.validateMenuList(menuList)) {
      throw new Error("Lấy danh sách menu thất bại, vui lòng đăng nhập lại");
    }

    routeRegistry?.register(menuList);

    const menuStore = useMenuStore();
    menuStore.setMenuList(menuList);
    menuStore.addRemoveRouteFns(routeRegistry?.getRemoveRouteFns() || []);

    IframeRouteManager.getInstance().save();

    useWorktabStore().validateWorktabs(router);

    if (isStaticRoute(to.path)) {
      routeInitInProgress = false;
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      };
    }

    const { homePath } = useCommon();
    const { path: validatedPath, hasPermission } =
      RoutePermissionValidator.validatePath(
        to.path,
        menuList,
        homePath.value || "/",
      );

    routeInitInProgress = false;

    if (!hasPermission) {
      closeLoading();

      console.warn(
        `[RouteGuard] User khong co quyen truy cap duong: ${to.path}, da chuyen den Trang Chu`,
      );

      return {
        path: validatedPath,
        replace: true,
      };
    } else {
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      };
    }
  } catch (error) {
    console.error("[RouteGuard] Có lỗi xảy ra:", error);

    closeLoading();

    if (isUnauthorizedError(error)) {
      routeInitInProgress = false;
      return { name: "Login", query: { redirect: to.fullPath }, replace: true };
    }

    routeInitFailed = true;
    routeInitInProgress = false;

    if (isHttpError(error)) {
      console.error(
        `[RouteGuard] Error code: ${error.code}, Message: ${error.message}`,
      );
    }

    return { name: "Exception500", replace: true };
  }
}

async function fetchUserInfo(): Promise<void> {
  const userStore = useUserStore();
  const data = await fetchGetUserInfo();

  const userInfo: Api.Auth.UserInfo = {
    userId: data.id || "",
    userName: data.fullName || data.nickName || data.userName || "",
    email: data.email || "",
    avatar: data.avatarUrl || "",
    roles: data.roles || [],
    buttons: data.permissions || [],
  };

  userStore.setUserInfo(userInfo);

  userStore.checkAndClearWorktabs();
}

export function resetRouterState(delay: number): void {
  setTimeout(() => {
    routeRegistry?.unregister();
    IframeRouteManager.getInstance().clear();

    const menuStore = useMenuStore();
    menuStore.removeAllDynamicRoutes();
    menuStore.setMenuList([]);

    resetRouteInitState();
  }, delay);
}

function handleRootPathRedirect(to: RouteLocationNormalized): any {
  if (to.path === "/") {
    return { path: "/workspace", replace: true };
  }

  return null;
}

function isUnauthorizedError(error: unknown): boolean {
  return isHttpError(error) && error.code === ApiStatus.unauthorized;
}
