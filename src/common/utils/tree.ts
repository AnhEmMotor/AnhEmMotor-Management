export const buildTree = <
  T extends {
    id: number;
    parentId?: number | null;
    parent_id?: number | null;
    sortOrder?: number;
    children?: T[];
  },
>(
  items: T[],
): T[] => {
  const map: Record<number, T & { children: T[] }> = {};
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  const childIds = new Set<number>();
  items.forEach((item) => {
    const pId = item.parentId ?? item.parent_id;
    if (pId && map[pId] && pId !== item.id) {
      map[pId].children.push(map[item.id] as T);
      childIds.add(item.id);
    }
  });

  const roots: T[] = [];
  const reachedIds = new Set<number>();

  items.forEach((item) => {
    if (!childIds.has(item.id)) {
      roots.push(map[item.id] as T);
      const stack = [map[item.id]];
      while (stack.length > 0) {
        const node = stack.pop();
        if (node && !reachedIds.has(node.id)) {
          reachedIds.add(node.id);
          if (node.children) stack.push(...(node.children as any[]));
        }
      }
    }
  });

  items.forEach((item) => {
    if (!reachedIds.has(item.id)) {
      roots.push(map[item.id] as T);

      const stack = [map[item.id]];
      while (stack.length > 0) {
        const node = stack.pop();
        if (node && !reachedIds.has(node.id)) {
          reachedIds.add(node.id);
          if (node.children) stack.push(...(node.children as any[]));
        }
      }
    }
  });

  const sortFn = (a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0);
  roots.sort(sortFn);
  Object.values(map).forEach((node) => {
    if (node.children) node.children.sort(sortFn);
  });

  return roots;
};
