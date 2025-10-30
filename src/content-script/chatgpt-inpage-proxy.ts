import Browser from '~services/extension-polyfill'
import { setupProxyExecutor } from '~services/proxy-fetch'

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

function injectTip() {
  const div = document.createElement('div')
  div.innerText = 'Please keep this tab open, now you can go back to ChatHub'
  div.style.position = 'fixed'
  // put the div at right top of page
  div.style.top = '0'
  div.style.right = '0'
  div.style.zIndex = '50'
  div.style.padding = '10px'
  div.style.margin = '10px'
  div.style.border = '1px solid'
  div.style.color = 'red'
  document.body.appendChild(div)
}

async function main() {
  // Only add event listeners in Chrome extension environment
  if (isChromeExtension) {
    Browser.runtime.onMessage.addListener(async (message: any) => {
      if (message === 'url') {
        return location.href
      }
    })
    if ((window as any).__NEXT_DATA__) {
      if (await Browser.runtime.sendMessage({ event: 'PROXY_TAB_READY' })) {
        injectTip()
      }
    }
  }
}

setupProxyExecutor()
main().catch(console.error)
