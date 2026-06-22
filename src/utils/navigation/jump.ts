import { AppRouteRecord } from "@/types/router";
import { router } from "@/router";
import { isNavigableMenuItem } from "./route";

export const openExternalLink = (link: string) => {
  window.open(link, "_blank");
};

export const handleMenuJump = (
  item: AppRouteRecord,
  jumpToFirst: boolean = false,
) => {
  const { link, isIframe } = item.meta;
  if (link && !isIframe) {
    return openExternalLink(link);
  }

  if (!jumpToFirst || !item.children?.length) {
    const targetPath = item.path.startsWith("/")
      ? item.path
      : `/reporting/${item.path}`;
    return router.push(targetPath);
  }

  const findFirstLeafMenu = (
    items: AppRouteRecord[],
  ): AppRouteRecord | undefined => {
    for (const child of items) {
      if (isNavigableMenuItem(child)) {
        return child.children?.length
          ? findFirstLeafMenu(child.children) || child
          : child;
      }
    }
    return undefined;
  };

  const firstChild = findFirstLeafMenu(item.children);

  if (!firstChild) {
    return router.push(item.path);
  }

  if (firstChild.meta?.link) {
    return openExternalLink(firstChild.meta.link);
  }

  const targetFirstPath = firstChild.path.startsWith("/")
    ? firstChild.path
    : `/reporting/${firstChild.path}`;
  router.push(targetFirstPath);
};
