import type { AppRouteRecord } from "@/types/router";

export class RoutePermissionValidator {
  static hasPermission(
    targetPath: string,
    menuList: AppRouteRecord[],
  ): boolean {
    const normalizedTarget = this.normalizePath(targetPath);
    if (normalizedTarget === "/" || normalizedTarget === "") {
      return true;
    }

    return this.matchRoute(normalizedTarget, menuList);
  }

  static buildMenuPathSet(
    menuList: AppRouteRecord[],
    pathSet: Set<string> = new Set(),
  ): Set<string> {
    if (!Array.isArray(menuList) || menuList.length === 0) {
      return pathSet;
    }

    for (const menuItem of menuList) {
      if (!menuItem.path) {
        continue;
      }

      pathSet.add(this.normalizePath(menuItem.path));

      if (menuItem.children?.length) {
        this.buildMenuPathSet(menuItem.children, pathSet);
      }
    }

    return pathSet;
  }

  static checkPathPrefix(targetPath: string, pathSet: Set<string>): boolean {
    const normalizedTarget = this.normalizePath(targetPath);
    for (const menuPath of pathSet) {
      if (normalizedTarget.startsWith(`${menuPath}/`)) {
        return true;
      }
    }
    return false;
  }

  static matchRoute(targetPath: string, routes: AppRouteRecord[]): boolean {
    if (!Array.isArray(routes) || routes.length === 0) {
      return false;
    }

    const normalizedTarget = this.normalizePath(targetPath);

    for (const route of routes) {
      if (!route.path) {
        continue;
      }

      const routePath = this.normalizePath(route.path);

      if (
        routePath === normalizedTarget ||
        this.isDynamicRouteMatch(normalizedTarget, routePath) ||
        normalizedTarget.startsWith(`${routePath}/`)
      ) {
        return true;
      }

      if (
        route.children?.length &&
        this.matchRoute(normalizedTarget, route.children)
      ) {
        return true;
      }
    }

    return false;
  }

  static isDynamicRouteMatch(targetPath: string, routePath: string): boolean {
    const normalizedTarget = this.normalizePath(targetPath);
    const normalizedRoute = this.normalizePath(routePath);

    if (!normalizedRoute.includes(":")) {
      return false;
    }

    const pattern = normalizedRoute
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/:([^/]+)/g, "[^/]+")
      .replace(/\\\*/g, ".*");

    return new RegExp(`^${pattern}$`).test(normalizedTarget);
  }

  static validatePath(
    targetPath: string,
    menuList: AppRouteRecord[],
    homePath: string = "/",
  ): { path: string; hasPermission: boolean } {
    const hasPermission = this.hasPermission(targetPath, menuList);

    if (hasPermission) {
      return { path: targetPath, hasPermission: true };
    }

    return { path: homePath, hasPermission: false };
  }

  private static normalizePath(path: string): string {
    if (!path) return "";
    let normalized = path.trim().toLowerCase();
    if (!normalized.startsWith("/")) {
      normalized = "/" + normalized;
    }
    if (normalized.endsWith("/") && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }
}
