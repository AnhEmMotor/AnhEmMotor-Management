export const formatImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000';
  const mediaRoutePrefix = 'api/v1/MediaFile/view-image/';
  let normalizedUrl = url.replace(/\\/g, '/').replace(/^\//, '');
  if (!normalizedUrl.startsWith(mediaRoutePrefix)) {
    normalizedUrl = `${mediaRoutePrefix}${normalizedUrl}`;
  }
  return `${baseUrl.replace(/\/$/, '')}/${normalizedUrl}`;
};
