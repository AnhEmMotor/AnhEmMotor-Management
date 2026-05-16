export const buildTree = (items, parentId = null) => {
  if (parentId !== null) {
    return items
      .filter(item => (item.parentId ?? item.parent_id) === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  const map = {}
  items.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  const childIds = new Set()
  items.forEach(item => {
    const pId = item.parentId ?? item.parent_id
    if (pId && map[pId] && pId !== item.id) {
      map[pId].children.push(map[item.id])
      childIds.add(item.id)
    }
  })

  const roots = []
  const reachedIds = new Set()

  // 1. Legitimate roots (no parent in list)
  items.forEach(item => {
    if (!childIds.has(item.id)) {
      roots.push(map[item.id])
      // Mark all reachable items
      const stack = [map[item.id]]
      while (stack.length > 0) {
        const node = stack.pop()
        if (reachedIds.has(node.id)) continue
        reachedIds.add(node.id)
        if (node.children) stack.push(...node.children)
      }
    }
  })

  // 2. Handle Cycles: If some items were never reached, they are part of a cycle
  items.forEach(item => {
    if (!reachedIds.has(item.id)) {
      // This item is part of a cycle. Force it to be a root.
      roots.push(map[item.id])
      
      // Mark it and its descendants as reached to avoid duplicates
      const stack = [map[item.id]]
      while (stack.length > 0) {
        const node = stack.pop()
        if (reachedIds.has(node.id)) continue
        reachedIds.add(node.id)
        if (node.children) stack.push(...node.children)
      }
    }
  })

  // Sort function
  const sortFn = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  roots.sort(sortFn)
  Object.values(map).forEach(node => {
    if (node.children) node.children.sort(sortFn)
  })

  return roots
}

export const flattenTree = (tree, level = 0, visited = new Set()) => {
  return tree.reduce((acc, node) => {
    if (visited.has(node.id)) return acc
    visited.add(node.id)

    acc.push({ ...node, level })
    if (node.children && node.children.length > 0) {
      acc.push(...flattenTree(node.children, level + 1, visited))
    }
    return acc
  }, [])
}
