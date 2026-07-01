function isDynamicRouteMatch(targetPath, routePath) {
  if (!routePath.includes(":")) return false;
  const regexPattern = routePath
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        const isOptional = segment.endsWith("?");
        return isOptional ? "([^/]*)" : "([^/]+)";
      }
      return segment;
    })
    .join("/");
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(targetPath);
}

function matchRoute(targetPath, routes) {
  if (!Array.isArray(routes) || routes.length === 0) return false;

  for (const route of routes) {
    if (!route.path) continue;

    const routePath = route.path.startsWith("/")
      ? route.path
      : `/${route.path}`;

    if (
      routePath === targetPath ||
      isDynamicRouteMatch(targetPath, routePath) ||
      targetPath.startsWith(`${routePath}/`)
    ) {
      return true;
    }

    if (
      route.children &&
      route.children.length > 0 &&
      matchRoute(targetPath, route.children)
    ) {
      return true;
    }
  }
  return false;
}

// Simulate the menu list that DOES NOT contain Warehouse
const menuList = [
  { path: "/admin/dashboard", children: [] },
  { path: "/Order", children: [{ path: "/Order/management" }] },
  // What if CustomerManagementHome has path ""?
  // Our normalizeMenuPaths builds it as "".
  { path: "", children: [] },
  // What if there is a catch-all route or something?
];

console.log(
  "Is Warehouse allowed?",
  matchRoute("/Warehouse/product/list", menuList),
);
console.log(
  "Is logistics allowed?",
  matchRoute("/logistics/dashboard", menuList),
);

// Let's add a route with path "/"
const menuListWithRoot = [{ path: "/" }, { path: "/Order" }];
console.log(
  "Is Warehouse allowed if menu has '/'?",
  matchRoute("/Warehouse/product/list", menuListWithRoot),
);

// Let's add CustomerManagementHome path ""
const menuListWithEmpty = [{ path: "" }, { path: "/Order" }];
console.log(
  "Is Warehouse allowed if menu has ''?",
  matchRoute("/Warehouse/product/list", menuListWithEmpty),
);
