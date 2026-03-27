export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const generateVariantSlug = (productName, variantOptionValues) => {
  const productNameSlug = slugify(productName)
  if (!variantOptionValues) return productNameSlug

  const optionSlugs = Object.entries(variantOptionValues)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${slugify(key)}-${slugify(value)}`)
    .join('-')

  if (optionSlugs) {
    return `${productNameSlug}-${optionSlugs}`
  }
  return productNameSlug
}
