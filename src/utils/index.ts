import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 } from 'uuid'
import Browser from '~services/extension-polyfill'

export function uuid() {
  return v4()
}

export function getVersion() {
  try {
    return Browser.runtime.getManifest().version
  } catch (e) {
    // Fallback for non-extension environment
    return '1.0.0'
  }
}

export function isProduction() {
  return !import.meta.env.DEV
}

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
