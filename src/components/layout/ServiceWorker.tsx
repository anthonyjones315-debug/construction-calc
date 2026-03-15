'use client'
import { useEffect } from 'react'

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register Serwist-built SW (built from src/app/sw.ts → public/sw.js)
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — app still works, just without offline support
      })
    }
  }, [])
  return null
}
