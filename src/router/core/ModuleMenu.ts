import type { AppRouteRecord } from '@/types/router';

const isNavigableRoute = (item: AppRouteRecord): boolean => {
  return !!(
    !item.meta?.isHide &&
    ((item.path && item.path.trim()) || item.meta?.link || item.meta?.isIframe === true) &&
    (item.component || item.meta?.link || item.meta?.isIframe === true)
  );
};

const hasNavigableMenu = (items: AppRouteRecord[] = []): boolean => {
  return items.some((item) =>
    item.children?.length
      ? hasNavigableMenu(item.children) || isNavigableRoute(item)
      : isNavigableRoute(item)
  );
};

export const getModuleMenu = (
  moduleRoutes: AppRouteRecord[],
  menuList: AppRouteRecord[]
): AppRouteRecord[] => {
  const allowedPaths = moduleRoutes.map((m) => m.path);
  const workspaceMenus = menuList.filter((m) => allowedPaths.includes(m.path));

  if (workspaceMenus.length === 1 && workspaceMenus[0].children?.length) {
    return workspaceMenus[0].children;
  }
  return workspaceMenus;
};

export const moduleHasAccess = (
  moduleRoutes: AppRouteRecord[],
  menuList: AppRouteRecord[]
): boolean => hasNavigableMenu(getModuleMenu(moduleRoutes, menuList));
