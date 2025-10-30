import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from '~services/extension-polyfill'
import Button from '~app/components/Button'
import KDB from '~app/components/Settings/KDB'

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id

function ShortcutPanel() {
  const [shortcuts, setShortcuts] = useState<string[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    if (isChromeExtension) {
      Browser.commands.getAll().then((commands: any) => {
        for (const c of commands) {
          if (c.name === 'open-app' && c.shortcut) {
            console.debug(c.shortcut)
            setShortcuts(c.shortcut ? [c.shortcut] : [])
          }
        }
      })
    }
  }, [])

  const handleShortcutChange = () => {
    if (isChromeExtension) {
      Browser.tabs.create({ url: 'chrome://extensions/shortcuts' })
    } else {
      // In web environment, show a message or use a different approach
      alert('Keyboard shortcuts are only available in the browser extension version')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-lg">{t('Shortcut to open this app')}</p>
      <div className="flex flex-row gap-2 items-center">
        {shortcuts.length > 0 && (
          <div className="flex flex-row gap-1">
            {shortcuts.map((s) => (
              <KDB key={s} text={s} />
            ))}
          </div>
        )}
        <Button
          text={t('Change shortcut')}
          size="small"
          onClick={handleShortcutChange}
        />
      </div>
    </div>
  )
}

export default ShortcutPanel
