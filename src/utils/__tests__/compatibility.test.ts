import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isWakeLockSupported,
  getCompatibilityInfo,
  getUnsupportedMessage,
  getWakeLockErrorMessage,
  getErrorRecoverySuggestion,
  isRecoverableError,
  isSecureContext,
  performCompatibilityCheck
} from '../compatibility'
import type { WakeLockError } from '../../types/wakeLock'

// Mock navigator
const mockNavigator = vi.fn()

describe('Browser Compatibility Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigator mock
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator(),
      writable: true
    })
  })

  describe('isWakeLockSupported', () => {
    it('should return true when wakeLock API is supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          wakeLock: {
            request: vi.fn()
          }
        },
        writable: true
      })

      expect(isWakeLockSupported()).toBe(true)
    })

    it('should return false when wakeLock is not in navigator', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      })

      expect(isWakeLockSupported()).toBe(false)
    })

    it('should return false when wakeLock.request is not a function', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          wakeLock: {}
        },
        writable: true
      })

      expect(isWakeLockSupported()).toBe(false)
    })

    it('should return false when wakeLock.request is null', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          wakeLock: {
            request: null
          }
        },
        writable: true
      })

      expect(isWakeLockSupported()).toBe(false)
    })
  })

  describe('getCompatibilityInfo', () => {
    it('should return supported true when API is available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          wakeLock: {
            request: vi.fn()
          }
        },
        writable: true
      })

      const result = getCompatibilityInfo()
      expect(result.isSupported).toBe(true)
      expect(result.errorMessage).toBeUndefined()
    })

    it('should return supported false with error message when API is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      })

      const result = getCompatibilityInfo()
      expect(result.isSupported).toBe(false)
      expect(result.errorMessage).toBe(getUnsupportedMessage())
    })
  })

  describe('getUnsupportedMessage', () => {
    it('should return Japanese error message for unsupported browsers', () => {
      const message = getUnsupportedMessage()
      expect(message).toBe('このブラウザはScreen Wake Lock APIをサポートしていません。Chrome、Edge、またはSafari（iOS 16.4以降）をご利用ください。')
    })
  })

  describe('getWakeLockErrorMessage', () => {
    it('should return appropriate message for NotAllowedError', () => {
      const error: WakeLockError = { name: 'NotAllowedError', message: 'Not allowed' }
      const message = getWakeLockErrorMessage(error)
      expect(message).toBe('ウェイクロックの使用が許可されていません。ページがアクティブでない可能性があります。タブをクリックしてから再度お試しください。')
    })

    it('should return appropriate message for AbortError', () => {
      const error: WakeLockError = { name: 'AbortError', message: 'Aborted' }
      const message = getWakeLockErrorMessage(error)
      expect(message).toBe('ウェイクロックの取得がキャンセルされました。しばらく待ってから再度お試しください。')
    })

    it('should return appropriate message for NotSupportedError', () => {
      const error: WakeLockError = { name: 'NotSupportedError', message: 'Not supported' }
      const message = getWakeLockErrorMessage(error)
      expect(message).toBe('このデバイスまたはブラウザではウェイクロック機能がサポートされていません。Chrome、Edge、またはSafari（iOS 16.4以降）をご利用ください。')
    })

    it('should return appropriate message for SecurityError', () => {
      const error: WakeLockError = { name: 'SecurityError', message: 'Security error' }
      const message = getWakeLockErrorMessage(error)
      expect(message).toBe('セキュリティ上の理由でウェイクロックを使用できません。HTTPSでアクセスしているか確認してください。')
    })

    it('should return generic message for unknown errors', () => {
      const error: WakeLockError = { name: 'UnknownError', message: 'Something went wrong' }
      const message = getWakeLockErrorMessage(error)
      expect(message).toBe('ウェイクロックでエラーが発生しました: Something went wrong。ページを再読み込みしてから再度お試しください。')
    })
  })

  describe('isSecureContext', () => {
    beforeEach(() => {
      // Reset window and location mocks
      Object.defineProperty(global, 'window', {
        value: {
          isSecureContext: false
        },
        writable: true
      })
      Object.defineProperty(global, 'location', {
        value: {
          protocol: 'http:',
          hostname: 'example.com'
        },
        writable: true
      })
    })

    it('should return true when window.isSecureContext is true', () => {
      Object.defineProperty(global, 'window', {
        value: {
          isSecureContext: true
        },
        writable: true
      })

      expect(isSecureContext()).toBe(true)
    })

    it('should return true when protocol is https', () => {
      Object.defineProperty(global, 'location', {
        value: {
          protocol: 'https:',
          hostname: 'example.com'
        },
        writable: true
      })

      expect(isSecureContext()).toBe(true)
    })

    it('should return true when hostname is localhost', () => {
      Object.defineProperty(global, 'location', {
        value: {
          protocol: 'http:',
          hostname: 'localhost'
        },
        writable: true
      })

      expect(isSecureContext()).toBe(true)
    })

    it('should return false for insecure context', () => {
      expect(isSecureContext()).toBe(false)
    })
  })

  describe('getErrorRecoverySuggestion', () => {
    it('should return appropriate recovery suggestion for NotAllowedError', () => {
      const error: WakeLockError = { name: 'NotAllowedError', message: 'Not allowed' }
      const suggestion = getErrorRecoverySuggestion(error)
      expect(suggestion).toBe('このタブをクリックしてアクティブにしてから、再度お試しください。')
    })

    it('should return appropriate recovery suggestion for AbortError', () => {
      const error: WakeLockError = { name: 'AbortError', message: 'Aborted' }
      const suggestion = getErrorRecoverySuggestion(error)
      expect(suggestion).toBe('数秒待ってから再度お試しください。')
    })

    it('should return appropriate recovery suggestion for SecurityError', () => {
      const error: WakeLockError = { name: 'SecurityError', message: 'Security error' }
      const suggestion = getErrorRecoverySuggestion(error)
      expect(suggestion).toBe('HTTPSでアクセスしているか確認してください。')
    })

    it('should return generic recovery suggestion for unknown errors', () => {
      const error: WakeLockError = { name: 'UnknownError', message: 'Something went wrong' }
      const suggestion = getErrorRecoverySuggestion(error)
      expect(suggestion).toBe('ページを再読み込みしてから再度お試しください。')
    })
  })

  describe('isRecoverableError', () => {
    it('should return true for recoverable errors', () => {
      const recoverableErrors = ['NotAllowedError', 'AbortError', 'InvalidStateError', 'NetworkError', 'TimeoutError']
      
      recoverableErrors.forEach(errorName => {
        const error: WakeLockError = { name: errorName, message: 'Test error' }
        expect(isRecoverableError(error)).toBe(true)
      })
    })

    it('should return false for non-recoverable errors', () => {
      const nonRecoverableErrors = ['NotSupportedError', 'SecurityError', 'UnknownError']
      
      nonRecoverableErrors.forEach(errorName => {
        const error: WakeLockError = { name: errorName, message: 'Test error' }
        expect(isRecoverableError(error)).toBe(false)
      })
    })
  })

  describe('performCompatibilityCheck', () => {
    beforeEach(() => {
      // Reset mocks
      Object.defineProperty(global, 'window', {
        value: {
          isSecureContext: true
        },
        writable: true
      })
      Object.defineProperty(global, 'location', {
        value: {
          protocol: 'https:',
          hostname: 'example.com'
        },
        writable: true
      })
    })

    it('should return unsupported for insecure context', () => {
      Object.defineProperty(global, 'window', {
        value: {
          isSecureContext: false
        },
        writable: true
      })
      Object.defineProperty(global, 'location', {
        value: {
          protocol: 'http:',
          hostname: 'example.com'
        },
        writable: true
      })

      const result = performCompatibilityCheck()
      expect(result.isSupported).toBe(false)
      expect(result.errorMessage).toBe('ウェイクロック機能はHTTPS接続でのみ利用できます。')
    })

    it('should return compatibility info for secure context', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          wakeLock: {
            request: vi.fn()
          }
        },
        writable: true
      })

      const result = performCompatibilityCheck()
      expect(result.isSupported).toBe(true)
      expect(result.errorMessage).toBeUndefined()
    })

    it('should return unsupported with message for secure context without API', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      })

      const result = performCompatibilityCheck()
      expect(result.isSupported).toBe(false)
      expect(result.errorMessage).toBe(getUnsupportedMessage())
    })
  })
})