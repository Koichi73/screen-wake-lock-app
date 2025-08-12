import { ref, onUnmounted, type Ref } from 'vue'
import type { WakeLockSentinel, NavigatorWithWakeLock, WakeLockError } from '../types/wakeLock'
import { 
  isWakeLockSupported, 
  getWakeLockErrorMessage, 
  performCompatibilityCheck 
} from '../utils/compatibility'

export interface UseWakeLock {
  isActive: Ref<boolean>
  isSupported: Ref<boolean>
  error: Ref<string | null>
  isLoading: Ref<boolean>
  requestWakeLock(): Promise<void>
  releaseWakeLock(): Promise<void>
  toggleWakeLock(): Promise<void>
  clearError(): void
}

/**
 * Composable for managing Screen Wake Lock functionality
 * Provides reactive state management and methods for wake lock control
 */
export function useWakeLock(): UseWakeLock {
  // Reactive state
  const isActive = ref<boolean>(false)
  const isSupported = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  
  // Internal state
  let wakeLockSentinel: WakeLockSentinel | null = null

  // Initialize compatibility check
  const compatibilityResult = performCompatibilityCheck()
  isSupported.value = compatibilityResult.isSupported
  
  if (!compatibilityResult.isSupported && compatibilityResult.errorMessage) {
    error.value = compatibilityResult.errorMessage
  }

  /**
   * Request a wake lock to prevent screen from sleeping
   */
  const requestWakeLock = async (): Promise<void> => {
    // Prevent multiple concurrent requests
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    
    try {
      // Clear any previous errors
      error.value = null

      // Check if already active
      if (isActive.value && wakeLockSentinel && !wakeLockSentinel.released) {
        return
      }

      // Check browser support
      if (!isSupported.value) {
        throw new Error('Wake Lock API is not supported')
      }

      const navigator = window.navigator as NavigatorWithWakeLock
      
      if (!navigator.wakeLock) {
        throw new Error('Wake Lock API is not available')
      }

      // Request wake lock
      wakeLockSentinel = await navigator.wakeLock.request('screen')
      
      // Update state
      isActive.value = true

      // Listen for wake lock release events
      wakeLockSentinel.addEventListener('release', handleWakeLockRelease)

    } catch (err) {
      const wakeLockError = err as WakeLockError
      error.value = getWakeLockErrorMessage(wakeLockError)
      
      // Ensure proper state recovery after error
      await recoverFromError()
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Release the current wake lock
   */
  const releaseWakeLock = async (): Promise<void> => {
    // Prevent multiple concurrent operations
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    
    try {
      error.value = null

      if (wakeLockSentinel && !wakeLockSentinel.released) {
        await wakeLockSentinel.release()
      }
      
      // Clean up state
      cleanup()

    } catch (err) {
      const wakeLockError = err as WakeLockError
      error.value = getWakeLockErrorMessage(wakeLockError)
      
      // Force cleanup even if release failed
      cleanup()
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle wake lock state (request if inactive, release if active)
   */
  const toggleWakeLock = async (): Promise<void> => {
    if (isActive.value) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }

  /**
   * Handle wake lock release events
   */
  const handleWakeLockRelease = (): void => {
    cleanup()
  }

  /**
   * Clean up wake lock state and event listeners
   */
  const cleanup = (): void => {
    if (wakeLockSentinel) {
      wakeLockSentinel.removeEventListener('release', handleWakeLockRelease)
    }
    wakeLockSentinel = null
    isActive.value = false
  }

  /**
   * Recover from error state by ensuring clean state
   */
  const recoverFromError = async (): Promise<void> => {
    try {
      // Force cleanup of any existing wake lock
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        await wakeLockSentinel.release().catch(() => {
          // Ignore errors during recovery cleanup
        })
      }
    } catch {
      // Ignore errors during recovery
    } finally {
      // Always ensure clean state
      cleanup()
    }
  }

  /**
   * Clear the current error state
   */
  const clearError = (): void => {
    error.value = null
  }

  // Clean up on component unmount
  onUnmounted(() => {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      wakeLockSentinel.release().catch(() => {
        // Ignore errors during cleanup
      })
    }
    cleanup()
  })

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
    clearError
  }
}