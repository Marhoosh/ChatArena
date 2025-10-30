// Web Extension Polyfill Adapter
// This module provides a compatibility layer for Chrome extension APIs in a web environment

import webStorageAdapter from './web-storage-adapter'

// Detect if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

// Export the appropriate polyfill based on environment
let polyfill: any

async function initPolyfill() {
  if (isChromeExtension) {
    // Use the real Chrome extension APIs
    try {
      // Try to import webextension-polyfill with dynamic import
      // @ts-ignore - Ignore type errors for dynamic import
      polyfill = await import('webextension-polyfill')
    } catch (e) {
      console.warn('webextension-polyfill not available, falling back to web adapter')
      // Fallback to web adapter if polyfill import fails
      polyfill = webStorageAdapter
    }
  } else {
    // Use our web adapter
    polyfill = webStorageAdapter
  }
}

// Initialize polyfill
initPolyfill()

export default polyfill