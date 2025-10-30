// Web Storage Adapter for replacing Chrome Extension APIs
// This adapter provides a Chrome-like storage API using localStorage and IndexedDB

class WebStorageAdapter {
  private prefix = 'chathub_'

  // Local Storage operations for simple key-value pairs
  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // Sync storage implementation using localStorage
  async get(keys?: string | string[] | Record<string, any> | null): Promise<Record<string, any>> {
    const result: Record<string, any> = {}

    if (keys === null || keys === undefined) {
      // Get all items with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const unprefixedKey = key.substring(this.prefix.length)
          try {
            result[unprefixedKey] = JSON.parse(localStorage.getItem(key) || '')
          } catch (e) {
            result[unprefixedKey] = localStorage.getItem(key)
          }
        }
      }
    } else if (typeof keys === 'string') {
      // Get single key
      const prefixedKey = this.getPrefixedKey(keys)
      const value = localStorage.getItem(prefixedKey)
      if (value !== null) {
        try {
          result[keys] = JSON.parse(value)
        } catch (e) {
          result[keys] = value
        }
      }
    } else if (Array.isArray(keys)) {
      // Get multiple keys
      keys.forEach(key => {
        const prefixedKey = this.getPrefixedKey(key)
        const value = localStorage.getItem(prefixedKey)
        if (value !== null) {
          try {
            result[key] = JSON.parse(value)
          } catch (e) {
            result[key] = value
          }
        }
      })
    } else if (typeof keys === 'object') {
      // Get keys with default values
      Object.keys(keys).forEach(key => {
        const prefixedKey = this.getPrefixedKey(key)
        const value = localStorage.getItem(prefixedKey)
        if (value !== null) {
          try {
            result[key] = JSON.parse(value)
          } catch (e) {
            result[key] = value
          }
        } else {
          result[key] = keys[key]
        }
      })
    }

    return result
  }

  async set(items: Record<string, any>): Promise<void> {
    Object.keys(items).forEach(key => {
      const prefixedKey = this.getPrefixedKey(key)
      const value = typeof items[key] === 'string' ? items[key] : JSON.stringify(items[key])
      localStorage.setItem(prefixedKey, value)
    })
  }

  async remove(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys]
    keysArray.forEach(key => {
      const prefixedKey = this.getPrefixedKey(key)
      localStorage.removeItem(prefixedKey)
    })
  }

  async clear(): Promise<void> {
    // Only remove items with our prefix
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

// Session storage implementation using sessionStorage
class WebSessionStorageAdapter {
  private prefix = 'chathub_session_'

  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(keys?: string | string[] | Record<string, any> | null): Promise<Record<string, any>> {
    const result: Record<string, any> = {}

    if (keys === null || keys === undefined) {
      // Get all items with our prefix
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const unprefixedKey = key.substring(this.prefix.length)
          try {
            result[unprefixedKey] = JSON.parse(sessionStorage.getItem(key) || '')
          } catch (e) {
            result[unprefixedKey] = sessionStorage.getItem(key)
          }
        }
      }
    } else if (typeof keys === 'string') {
      // Get single key
      const prefixedKey = this.getPrefixedKey(keys)
      const value = sessionStorage.getItem(prefixedKey)
      if (value !== null) {
        try {
          result[keys] = JSON.parse(value)
        } catch (e) {
          result[keys] = value
        }
      }
    } else if (Array.isArray(keys)) {
      // Get multiple keys
      keys.forEach(key => {
        const prefixedKey = this.getPrefixedKey(key)
        const value = sessionStorage.getItem(prefixedKey)
        if (value !== null) {
          try {
            result[key] = JSON.parse(value)
          } catch (e) {
            result[key] = value
          }
        }
      })
    } else if (typeof keys === 'object') {
      // Get keys with default values
      Object.keys(keys).forEach(key => {
        const prefixedKey = this.getPrefixedKey(key)
        const value = sessionStorage.getItem(prefixedKey)
        if (value !== null) {
          try {
            result[key] = JSON.parse(value)
          } catch (e) {
            result[key] = value
          }
        } else {
          result[key] = keys[key]
        }
      })
    }

    return result
  }

  async set(items: Record<string, any>): Promise<void> {
    Object.keys(items).forEach(key => {
      const prefixedKey = this.getPrefixedKey(key)
      const value = typeof items[key] === 'string' ? items[key] : JSON.stringify(items[key])
      sessionStorage.setItem(prefixedKey, value)
    })
  }

  async remove(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys]
    keysArray.forEach(key => {
      const prefixedKey = this.getPrefixedKey(key)
      sessionStorage.removeItem(prefixedKey)
    })
  }

  async clear(): Promise<void> {
    // Only remove items with our prefix
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  }
}

// Runtime adapter for Chrome extension runtime API
class WebRuntimeAdapter {
  async getURL(path: string): Promise<string> {
    // In a web app, we just return the path as is
    return path
  }

  async sendMessage(message: any): Promise<any> {
    // In a web app, we don't have a background script
    // This would need to be implemented based on specific needs
    console.warn('sendMessage called in web app context:', message)
    return null
  }

  onMessage = {
    addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => {
      // In a web app, we don't have a background script
      // This would need to be implemented based on specific needs
      console.warn('onMessage.addListener called in web app context')
    }
  }

  onInstalled = {
    addListener: (callback: (details: any) => void) => {
      // In a web app, we don't have installation events
      console.warn('onInstalled.addListener called in web app context')
    }
  }
}

// Tabs adapter for Chrome extension tabs API
class WebTabsAdapter {
  async query(queryInfo: any): Promise<any[]> {
    // In a web app, we only have one tab
    return [{
      id: 1,
      url: window.location.href,
      active: true
    }]
  }

  async update(tabId: number, updateProperties: any): Promise<any> {
    // In a web app, we can't update other tabs
    if (tabId === 1 && updateProperties.active) {
      // Just focus the current window
      window.focus()
    }
    return { id: tabId, url: window.location.href }
  }

  async create(createProperties: any): Promise<any> {
    // In a web app, we open a new window
    if (createProperties.url) {
      window.open(createProperties.url, '_blank')
    }
    return { id: Date.now(), url: createProperties.url }
  }
}

// Action adapter for Chrome extension action API
class WebActionAdapter {
  onClicked = {
    addListener: (callback: () => void) => {
      // In a web app, we don't have extension actions
      console.warn('onClicked.addListener called in web app context')
    }
  }
}

// Commands adapter for Chrome extension commands API
class WebCommandsAdapter {
  onCommand = {
    addListener: (callback: (command: string) => void) => {
      // In a web app, we don't have extension commands
      console.warn('onCommand.addListener called in web app context')
    }
  }
}

// Create the web extension polyfill
const webExtensionPolyfill = {
  storage: {
    sync: new WebStorageAdapter(),
    local: new WebStorageAdapter(),
    session: new WebSessionStorageAdapter()
  },
  runtime: new WebRuntimeAdapter(),
  tabs: new WebTabsAdapter(),
  action: new WebActionAdapter(),
  commands: new WebCommandsAdapter()
}

export default webExtensionPolyfill