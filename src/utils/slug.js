export const slugify = (str) => {
  if (!str) return ''
  return str
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
    .replace(/^-+|-+$/g, '') // Trim -
}

export const generateVariantSlug = (productName, variantOptionValues, versionName, colorName, price) => {
  const productNameSlug = slugify(productName)
  const parts = [productNameSlug]

  if (versionName) {
    parts.push(slugify(versionName))
  }

  if (colorName) {
    parts.push(slugify(colorName))
  }

  if (variantOptionValues) {
    const optionSlugs = Object.entries(variantOptionValues)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${slugify(key)}-${slugify(value)}`)
      .join('-')
    
    if (optionSlugs) {
      parts.push(optionSlugs)
    }
  }

  if (price) {
    parts.push(slugify(price.toString()))
  }

  return parts.join('-')
}


