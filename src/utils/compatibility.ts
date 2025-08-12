import type { NavigatorWithWakeLock, CompatibilityResult, WakeLockError } from '../types/wakeLock'

/**
 * Check if the Screen Wake Lock API is supported in the current browser
 * @returns boolean indicating if the API is supported
 */
export const isWakeLockSupported = (): boolean => {
    const nav = navigator as NavigatorWithWakeLock
    return 'wakeLock' in nav && typeof nav.wakeLock?.request === 'function'
}

/**
 * Get detailed compatibility information for Screen Wake Lock API
 * @returns CompatibilityResult with support status and error message if unsupported
 */
export const getCompatibilityInfo = (): CompatibilityResult => {
    if (isWakeLockSupported()) {
        return { isSupported: true }
    }

    return {
        isSupported: false,
        errorMessage: getUnsupportedMessage()
    }
}

/**
 * Get user-friendly error message for unsupported browsers
 * @returns string with localized error message in Japanese
 */
export const getUnsupportedMessage = (): string => {
    return 'このブラウザはScreen Wake Lock APIをサポートしていません。Chrome、Edge、またはSafari（iOS 16.4以降）をご利用ください。'
}

/**
 * Get user-friendly error message for Wake Lock API errors
 * @param error - The error object from Wake Lock API
 * @returns string with localized error message in Japanese
 */
export const getWakeLockErrorMessage = (error: WakeLockError): string => {
    switch (error.name) {
        case 'NotAllowedError':
            return 'ウェイクロックの使用が許可されていません。ページがアクティブでない可能性があります。タブをクリックしてから再度お試しください。'
        case 'AbortError':
            return 'ウェイクロックの取得がキャンセルされました。しばらく待ってから再度お試しください。'
        case 'NotSupportedError':
            return 'このデバイスまたはブラウザではウェイクロック機能がサポートされていません。Chrome、Edge、またはSafari（iOS 16.4以降）をご利用ください。'
        case 'SecurityError':
            return 'セキュリティ上の理由でウェイクロックを使用できません。HTTPSでアクセスしているか確認してください。'
        case 'InvalidStateError':
            return 'ウェイクロックが無効な状態です。ページを再読み込みしてから再度お試しください。'
        case 'NetworkError':
            return 'ネットワークエラーが発生しました。インターネット接続を確認してから再度お試しください。'
        case 'TimeoutError':
            return 'ウェイクロックの取得がタイムアウトしました。しばらく待ってから再度お試しください。'
        default:
            // Provide more context for unknown errors
            if (error.message) {
                return `ウェイクロックでエラーが発生しました: ${error.message}。ページを再読み込みしてから再度お試しください。`
            }
            return 'ウェイクロックで予期しないエラーが発生しました。ページを再読み込みしてから再度お試しください。'
    }
}

/**
 * Check if the current context allows Wake Lock usage (HTTPS requirement)
 * @returns boolean indicating if the context is secure
 */
export const isSecureContext = (): boolean => {
    return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost'
}

/**
 * Get recovery suggestions for different error types
 * @param error - The error object from Wake Lock API
 * @returns string with recovery suggestions in Japanese
 */
export const getErrorRecoverySuggestion = (error: WakeLockError): string => {
    switch (error.name) {
        case 'NotAllowedError':
            return 'このタブをクリックしてアクティブにしてから、再度お試しください。'
        case 'AbortError':
            return '数秒待ってから再度お試しください。'
        case 'SecurityError':
            return 'HTTPSでアクセスしているか確認してください。'
        case 'InvalidStateError':
            return 'ページを再読み込みしてから再度お試しください。'
        case 'NetworkError':
            return 'インターネット接続を確認してから再度お試しください。'
        default:
            return 'ページを再読み込みしてから再度お試しください。'
    }
}

/**
 * Check if an error is recoverable by user action
 * @param error - The error object from Wake Lock API
 * @returns boolean indicating if the error is recoverable
 */
export const isRecoverableError = (error: WakeLockError): boolean => {
    const recoverableErrors = [
        'NotAllowedError',
        'AbortError',
        'InvalidStateError',
        'NetworkError',
        'TimeoutError'
    ]
    return recoverableErrors.includes(error.name)
}

/**
 * Perform comprehensive compatibility check including security context
 * @returns CompatibilityResult with detailed information
 */
export const performCompatibilityCheck = (): CompatibilityResult => {
    if (!isSecureContext()) {
        return {
            isSupported: false,
            errorMessage: 'ウェイクロック機能はHTTPS接続でのみ利用できます。'
        }
    }

    return getCompatibilityInfo()
}