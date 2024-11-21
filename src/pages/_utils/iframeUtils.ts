const defaultAllowedUrls = ['localhost:']
const configuredAllowedUrls = import.meta.env.PUBLIC_ALLOWED_URLS?.split(',')
const allowedUrls = [...defaultAllowedUrls, ...configuredAllowedUrls].filter((it) => it?.trim().length > 0)
const defaultBaseUrl = import.meta.env.PUBLIC_BASE_URL ?? 'www.grekz.com/hello/'

export const getNewUrl = (url: string) => {
  let resultUrl = url.trim()
  resultUrl = resultUrl.replace(/^http(s?):\/\//, '')
  const isAllowedUrl = allowedUrls.some((it) => url.startsWith(it))
  if (!isAllowedUrl && !url.includes('/')) {
    resultUrl = `${defaultBaseUrl}${url}`
  }
  return `https://${resultUrl}`
}

export const getKey = (key: string) => `${Office?.context?.partitionKey ?? ''}/gpc/${key}`
export const setInStorage = (key: string, value: string) => {
  const newKey = getKey(key)
  Office?.context?.document?.settings?.set(newKey, value)
  Office?.context?.document?.settings?.saveAsync()
}
export const getFromStorage = (key: string) => {
  const newKey = getKey(key)
  return Office?.context?.document?.settings?.get(newKey) ?? ''
}

export interface MetadataValue {
  slides: [{ id: number }]
}
export const getIdFromMetadata = ({ slides }: MetadataValue) => {
  if (slides.length > 0) {
    return String(slides[0].id)
  }
  return 'no-id'
}
