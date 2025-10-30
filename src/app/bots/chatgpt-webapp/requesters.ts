import Browser from '~services/extension-polyfill'
import { CHATGPT_HOME_URL } from '~app/consts'
import { proxyFetch } from '~services/proxy-fetch'
import { RequestInitSubset } from '~types/messaging'

// Define MessageSender type locally
type MessageSender = {
  tab: any
}

// Define Runtime interface locally
interface Runtime {
  MessageSender: MessageSender
}

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

export interface Requester {
  fetch(url: string, options?: RequestInitSubset): Promise<Response>
}

class GlobalFetchRequester implements Requester {
  fetch(url: string, options?: RequestInitSubset) {
    return fetch(url, options)
  }
}

class ProxyFetchRequester implements Requester {
  async findExistingProxyTab() {
    if (!isChromeExtension) {
      return null
    }
    
    const tabs = await Browser.tabs.query({ pinned: true })
    const results: (string | undefined)[] = await Promise.all(
      tabs.map(async (tab: any) => {
        if (tab.url) {
          return tab.url
        }
        return Browser.tabs.sendMessage(tab.id!, 'url').catch(() => undefined)
      }),
    )
    for (let i = 0; i < results.length; i++) {
      if (results[i]?.startsWith('https://chat.openai.com')) {
        return tabs[i]
      }
    }
  }

  waitForProxyTabReady(): Promise<any> {
    if (!isChromeExtension) {
      return Promise.reject(new Error('Proxy tab not available in web environment'))
    }
    
    return new Promise((resolve, reject) => {
      const listener = async function (message: any, sender: MessageSender) {
        if (message.event === 'PROXY_TAB_READY') {
          console.debug('new proxy tab ready')
          Browser.runtime.onMessage.removeListener(listener)
          clearTimeout(timer)
          resolve(sender.tab!)
          return true
        }
      }
      const timer = setTimeout(() => {
        Browser.runtime.onMessage.removeListener(listener)
        reject(new Error('Timeout waiting for ChatGPT tab'))
      }, 10 * 1000)

      Browser.runtime.onMessage.addListener(listener)
    })
  }

  async createProxyTab() {
    if (!isChromeExtension) {
      throw new Error('Cannot create proxy tab in web environment')
    }
    
    const readyPromise = this.waitForProxyTabReady()
    Browser.tabs.create({ url: CHATGPT_HOME_URL, pinned: true })
    return readyPromise
  }

  async getProxyTab() {
    if (!isChromeExtension) {
      throw new Error('Proxy tab not available in web environment')
    }
    
    let tab = await this.findExistingProxyTab()
    if (!tab) {
      tab = await this.createProxyTab()
    }
    return tab
  }

  async refreshProxyTab() {
    if (!isChromeExtension) {
      throw new Error('Cannot refresh proxy tab in web environment')
    }
    
    const tab = await this.findExistingProxyTab()
    if (!tab) {
      await this.createProxyTab()
      return
    }
    const readyPromise = this.waitForProxyTabReady()
    Browser.tabs.reload(tab.id!)
    return readyPromise
  }

  async fetch(url: string, options?: RequestInitSubset) {
    if (!isChromeExtension) {
      // In web environment, use global fetch
      return fetch(url, options)
    }
    
    const tab = await this.getProxyTab()
    const resp = await proxyFetch(tab.id!, url, options)
    if (resp.status === 403) {
      await this.refreshProxyTab()
      return proxyFetch(tab.id!, url, options)
    }
    return resp
  }
}

export const globalFetchRequester = new GlobalFetchRequester()
export const proxyFetchRequester = new ProxyFetchRequester()
