import Browser from '~services/extension-polyfill'

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

export async function requestHostPermissions(hosts: string[]) {
  // In web environment, we don't need to request permissions
  if (!isChromeExtension) {
    console.warn('Host permissions are not applicable in web environment')
    return true
  }
  
  const permissions: any = { origins: hosts }
  if (await Browser.permissions.contains(permissions)) {
    return true
  }
  return Browser.permissions.request(permissions)
}

export async function requestHostPermission(host: string) {
  return requestHostPermissions([host])
}
