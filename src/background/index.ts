import Browser from '~services/extension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'
import { readTwitterCsrfToken } from './twitter-cookie'

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

// Only expose storage.session to content scripts in Chrome extension environment
if (isChromeExtension) {
  // using `chrome.*` API because `setAccessLevel` is not supported by `Browser.*` API
  (window as any).chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
}

async function openAppPage() {
  // In web environment, this function doesn't apply
  if (!isChromeExtension) {
    return
  }
  
  const tabs = await Browser.tabs.query({})
  const url = Browser.runtime.getURL('app.html')
  const tab = tabs.find((tab: any) => tab.url?.startsWith(url))
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true })
    return
  }
  const { startupPage } = await getUserConfig()
  const hash = startupPage === ALL_IN_ONE_PAGE_ID ? '' : `#/chat/${startupPage}`
  await Browser.tabs.create({ url: `app.html${hash}` })
}

// Only add event listeners in Chrome extension environment
if (isChromeExtension) {
  Browser.action.onClicked.addListener(() => {
    openAppPage()
  })

  Browser.runtime.onInstalled.addListener((details: any) => {
    if (details.reason === 'install') {
      Browser.tabs.create({ url: 'app.html#/setting' })
      trackInstallSource()
    }
  })

  Browser.commands.onCommand.addListener(async (command: any) => {
    console.debug(`Command: ${command}`)
    if (command === 'open-app') {
      openAppPage()
    }
  })

  Browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
    console.debug('onMessage', message, sender)
    if (message.target !== 'background') {
      return
    }
    if (message.type === 'read-twitter-csrf-token') {
      return readTwitterCsrfToken(message.data)
    }
  })
}
