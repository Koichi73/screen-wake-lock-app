// Export all compatibility utilities
export {
  isWakeLockSupported,
  getCompatibilityInfo,
  getUnsupportedMessage,
  getWakeLockErrorMessage,
  isSecureContext,
  performCompatibilityCheck
} from './compatibility'

// Export types
export type {
  WakeLockSentinel,
  WakeLock,
  NavigatorWithWakeLock,
  CompatibilityResult,
  WakeLockError
} from '../types/wakeLock'