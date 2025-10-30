// Web Extension Polyfill Adapter
// This module provides a compatibility layer for Chrome extension APIs in a web environment

import webStorageAdapter from './web-storage-adapter'

// In web app environment, we always use our web adapter
const polyfill = webStorageAdapter

export default polyfill