/**
 * Utility to handle image URLs and placeholders in the management app
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/100x100/gray/white?text=N/A'

  // Handle multiple images (comma-separated)
  const firstPath = path.split(',')[0].trim()

  if (
    firstPath.startsWith('http') ||
    firstPath.startsWith('https') ||
    firstPath.startsWith('data:')
  ) {
    return firstPath
  }

  const baseURL = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'

  // Remove leading slash if exists
  const normalizedPath = firstPath.startsWith('/') ? firstPath.substring(1) : firstPath

  return `${baseURL}/${normalizedPath}`
}


