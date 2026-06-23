import type { AppRouteRecord } from "@/types/router";
import { useUserStore } from "@/application/store/user";
import { useAppMode } from "@/common/composables/useAppMode";
import { fetchGetMenuList } from "@/api/system-manage.api";
import { asyncRoutes } from "../routes/asyncRoutes";
import { RoutesAlias } from "../routesAlias";
import { formatMenuTitle } from "@/common/utils";

export class MenuProcessor {
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode();

    let menuList: AppRouteRecord[];
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu();
    } else {
      menuList = await this.processBackendMenu();
    }

    this.validateMenuPaths(menuList);

    return this.normalizeMenuPaths(menuList);
  }

  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore();
    const roles = userStore.info?.roles ?? [];
    const permissions = userStore.info?.buttons ?? [];

    let menuList = [...asyncRoutes];

    menuList = this.filterMenuByPermissionsAndRoles(
      menuList,
      permissions,
      roles,
    );

    return this.filterEmptyMenus(menuList);
  }

  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const list = await fetchGetMenuList();
    return this.filterEmptyMenus(list);
  }

  private filterMenuByPermissionsAndRoles(
    menu: AppRouteRecord[],
    permissions: string[],
    roles: string[],
  ): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles;
      const hasRolePermission =
        roles.length === 0 ||
        !itemRoles ||
        itemRoles.some((role) => roles?.includes(role));

      const itemPermissions = item.meta?.permissions as string[] | undefined;
      const itemPermission = item.meta?.permission as string | undefined;

      let hasGranularPermission = true;
      if (itemPermissions && Array.isArray(itemPermissions)) {
        hasGranularPermission = itemPermissions.some((p) =>
          permissions.includes(p),
        );
      } else if (itemPermission) {
        hasGranularPermission = permissions.includes(itemPermission);
      }

      if (hasRolePermission && hasGranularPermission) {
        const filteredItem = { ...item };

        if (filteredItem.name === "Dashboard") {
          const hasStatsPerm = permissions.includes(
            "Permissions.Statistical.View",
          );
          if (!hasStatsPerm) {
            if (!filteredItem.meta) {
              filteredItem.meta = {} as any;
            }
            filteredItem.meta.title = "menus.dashboard.console";
            if (filteredItem.children) {
              filteredItem.children = filteredItem.children.map((c) => {
                const newChild = { ...c };
                if (!newChild.meta) newChild.meta = {} as any;
                newChild.meta.isHide = true;
                return newChild;
              });
            }
          }
        }

        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByPermissionsAndRoles(
            filteredItem.children,
            permissions,
            roles,
          );
        }
        acc.push(filteredItem);
      }

      return acc;
    }, []);
  }

  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children);
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return item;
      })
      .filter((item) => {
        if ("children" in item) {
          return true;
        }

        if (item.meta?.isIframe === true || item.meta?.link) {
          return true;
        }

        if (
          item.component &&
          item.component !== "" &&
          item.component !== RoutesAlias.Layout
        ) {
          return true;
        }

        return false;
      });
  }

  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0;
  }

  private normalizeMenuPaths(
    menuList: AppRouteRecord[],
    parentPath = "",
  ): AppRouteRecord[] {
    return menuList.map((item) => {
      const fullPath = this.buildFullPath(item.path || "", parentPath);

      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children;

      const redirect = item.redirect || this.resolveDefaultRedirect(children);

      return {
        ...item,
        path: fullPath,
        redirect,
        children,
      };
    });
  }

  private resolveDefaultRedirect(
    children?: AppRouteRecord[],
  ): string | undefined {
    if (!children?.length) {
      return undefined;
    }

    for (const child of children) {
      if (this.isNavigableRoute(child)) {
        return child.path;
      }

      const nestedRedirect = this.resolveDefaultRedirect(child.children);
      if (nestedRedirect) {
        return nestedRedirect;
      }
    }

    return undefined;
  }

  private isNavigableRoute(route: AppRouteRecord): boolean {
    return Boolean(
      route.path &&
      route.path !== "/" &&
      !route.meta?.link &&
      route.meta?.isIframe !== true &&
      route.component &&
      route.component !== "",
    );
  }

  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    menuList.forEach((route) => {
      if (!route.children?.length) return;

      const parentName = String(route.name || route.path || "ChưabáoRouting");

      route.children.forEach((child) => {
        const childPath = child.path || "";

        if (this.isValidAbsolutePath(childPath)) return;

        if (childPath.startsWith("/")) {
          this.logPathError(child, childPath, parentName, level);
        }
      });

      this.validateMenuPaths(route.children, level + 1);
    });
  }

  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("/outside/iframe/")
    );
  }

  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number,
  ): void {
    const routeName = String(route.name || path || "ChưabáoRouting");
    const menuTitle = route.meta?.title || routeName;
    const suggestedPath = path.split("/").pop() || path.slice(1);

    console.error(
      `[RoutingCauHinhLỗi] Menu "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) CauHinhLỗi\n` +
        `  ViTri: ${parentName} > ${routeName}\n` +
        `  hỏiđề: ${level + 1}cấpMenucủa path Khôngnănglấy / mởđầu\n` +
        `  khitrướcCauHinh: path: '${path}'\n` +
        `  ứngnênsửavì: path: '${suggestedPath}'`,
    );
  }

  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    if (path.startsWith("/")) {
      return path;
    }

    if (parentPath) {
      const cleanParent = parentPath.replace(/\/$/, "");
      const cleanChild = path.replace(/^\//, "");
      return `${cleanParent}/${cleanChild}`;
    }

    return `/${path}`;
  }
}
