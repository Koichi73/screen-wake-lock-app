// TypeScript interfaces for Screen Wake Lock API
export interface WakeLockSentinel extends EventTarget {
  readonly released: boolean
  readonly type: 'screen'
  release(): Promise<void>
}

export interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

export interface NavigatorWithWakeLock {
  wakeLock?: WakeLock
}

export interface CompatibilityResult {
  isSupported: boolean
  errorMessage?: string
}

export interface WakeLockError {
  name: string
  message: string
  code?: string
}