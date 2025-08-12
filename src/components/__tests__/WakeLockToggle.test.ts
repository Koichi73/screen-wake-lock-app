import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import WakeLockToggle from '../WakeLockToggle.vue'

// Mock the useWakeLock composable
const mockUseWakeLock = {
  isActive: ref(false),
  isSupported: ref(true),
  error: ref(null),
  isLoading: ref(false),
  toggleWakeLock: vi.fn(),
  clearError: vi.fn()
}

vi.mock('../../composables/useWakeLock', () => ({
  useWakeLock: () => mockUseWakeLock
}))

describe('WakeLockToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWakeLock.isActive.value = false
    mockUseWakeLock.isSupported.value = true
    mockUseWakeLock.error.value = null
    mockUseWakeLock.isLoading.value = false
  })

  it('renders correctly when wake lock is inactive', () => {
    const wrapper = mount(WakeLockToggle)
    
    expect(wrapper.find('button').text()).toBe('ウェイクロックを有効化')
    expect(wrapper.text()).toContain('Wake Lock: Inactive')
  })

  it('renders correctly when wake lock is active', () => {
    mockUseWakeLock.isActive.value = true
    const wrapper = mount(WakeLockToggle)
    
    expect(wrapper.find('button').text()).toBe('ウェイクロックを解除')
    expect(wrapper.text()).toContain('Wake Lock: Active')
  })

  it('shows correct button styling when active', () => {
    mockUseWakeLock.isActive.value = true
    const wrapper = mount(WakeLockToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-red-500')
  })

  it('shows correct button styling when inactive', () => {
    const wrapper = mount(WakeLockToggle)
    
    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-green-500')
  })

  it('calls toggleWakeLock when button is clicked and wake lock is active', async () => {
    mockUseWakeLock.isActive.value = true
    const wrapper = mount(WakeLockToggle)
    
    await wrapper.find('button').trigger('click')
    
    expect(mockUseWakeLock.toggleWakeLock).toHaveBeenCalledOnce()
  })

  it('emits request-wake-lock event when button is clicked and wake lock is inactive', async () => {
    const wrapper = mount(WakeLockToggle)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('request-wake-lock')).toBeTruthy()
    expect(wrapper.emitted('request-wake-lock')).toHaveLength(1)
  })

  it('shows loading state during async operation', async () => {
    mockUseWakeLock.isLoading.value = true
    const wrapper = mount(WakeLockToggle)
    
    expect(wrapper.find('button').text()).toContain('処理中...')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('displays error message when error occurs', () => {
    mockUseWakeLock.error.value = 'Test error message'
    const wrapper = mount(WakeLockToggle)
    
    expect(wrapper.text()).toContain('Test error message')
    expect(wrapper.find('.bg-red-50').exists()).toBe(true)
  })

  it('shows unsupported message when browser does not support wake lock', () => {
    mockUseWakeLock.isSupported.value = false
    const wrapper = mount(WakeLockToggle)
    
    expect(wrapper.find('button').text()).toBe('サポートされていません')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('このブラウザはScreen Wake Lock APIをサポートしていません')
  })

  it('disables button when not supported', () => {
    mockUseWakeLock.isSupported.value = false
    const wrapper = mount(WakeLockToggle)
    
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('opacity-50')
    expect(button.classes()).toContain('cursor-not-allowed')
  })

  it('shows correct status indicator styling when active', () => {
    mockUseWakeLock.isActive.value = true
    const wrapper = mount(WakeLockToggle)
    
    const statusIndicator = wrapper.find('.bg-green-100')
    expect(statusIndicator.exists()).toBe(true)
    expect(statusIndicator.classes()).toContain('text-green-800')
  })

  it('shows correct status indicator styling when inactive', () => {
    const wrapper = mount(WakeLockToggle)
    
    const statusIndicator = wrapper.find('.bg-gray-100')
    expect(statusIndicator.exists()).toBe(true)
    expect(statusIndicator.classes()).toContain('text-gray-800')
  })

  describe('error handling', () => {
    it('shows retry button when error occurs', () => {
      mockUseWakeLock.error.value = 'Test error'
      const wrapper = mount(WakeLockToggle)
      
      const retryButton = wrapper.find('button[aria-label*="再試行"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toBe('再試行')
    })

    it('calls clearError when error close button is clicked', async () => {
      mockUseWakeLock.error.value = 'Test error'
      const wrapper = mount(WakeLockToggle)
      
      const closeButton = wrapper.find('button[aria-label*="エラーメッセージを閉じる"]')
      await closeButton.trigger('click')
      
      expect(mockUseWakeLock.clearError).toHaveBeenCalledOnce()
    })

    it('clears error before retry attempt', async () => {
      mockUseWakeLock.error.value = 'Test error'
      const wrapper = mount(WakeLockToggle)
      
      const retryButton = wrapper.find('button[aria-label*="再試行"]')
      await retryButton.trigger('click')
      
      expect(mockUseWakeLock.clearError).toHaveBeenCalledOnce()
    })

    it('disables retry button when loading', () => {
      mockUseWakeLock.error.value = 'Test error'
      mockUseWakeLock.isLoading.value = true
      const wrapper = mount(WakeLockToggle)
      
      const retryButtons = wrapper.findAll('button').filter(btn => 
        btn.text().includes('再試行')
      )
      expect(retryButtons.length).toBeGreaterThan(0)
      expect(retryButtons[0].attributes('disabled')).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for button', () => {
      const wrapper = mount(WakeLockToggle)
      
      const button = wrapper.find('button')
      expect(button.attributes('aria-pressed')).toBe('false')
      expect(button.attributes('aria-describedby')).toBe('wake-lock-inactive-desc')
      expect(button.attributes('aria-label')).toBeDefined()
    })

    it('updates ARIA attributes when active', () => {
      mockUseWakeLock.isActive.value = true
      const wrapper = mount(WakeLockToggle)
      
      const button = wrapper.find('button')
      expect(button.attributes('aria-pressed')).toBe('true')
      expect(button.attributes('aria-describedby')).toBe('wake-lock-active-desc')
    })

    it('has proper status role and aria-live', () => {
      const wrapper = mount(WakeLockToggle)
      
      const status = wrapper.find('[role="status"]')
      expect(status.exists()).toBe(true)
      expect(status.attributes('aria-live')).toBe('polite')
      expect(status.attributes('aria-label')).toBeDefined()
    })

    it('has proper alert role for errors', () => {
      mockUseWakeLock.error.value = 'Test error'
      const wrapper = mount(WakeLockToggle)
      
      const alert = wrapper.find('[role="alert"]')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('aria-labelledby')).toBe('error-title')
      expect(alert.attributes('aria-describedby')).toBe('error-message')
    })

    it('has screen reader descriptions', () => {
      const wrapper = mount(WakeLockToggle)
      
      const activeDesc = wrapper.find('#wake-lock-active-desc')
      const inactiveDesc = wrapper.find('#wake-lock-inactive-desc')
      
      expect(activeDesc.exists()).toBe(true)
      expect(inactiveDesc.exists()).toBe(true)
      
      // Check that they are in a sr-only container
      const srOnlyContainer = wrapper.find('.sr-only')
      expect(srOnlyContainer.exists()).toBe(true)
      expect(srOnlyContainer.find('#wake-lock-active-desc').exists()).toBe(true)
      expect(srOnlyContainer.find('#wake-lock-inactive-desc').exists()).toBe(true)
    })
  })

  describe('responsive design', () => {
    it('has responsive classes for different screen sizes', () => {
      const wrapper = mount(WakeLockToggle)
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('px-6')
      expect(button.classes()).toContain('sm:px-8')
      expect(button.classes()).toContain('py-3')
      expect(button.classes()).toContain('sm:py-4')
      expect(button.classes()).toContain('text-sm')
      expect(button.classes()).toContain('sm:text-base')
    })

    it('has minimum touch target sizes', () => {
      const wrapper = mount(WakeLockToggle)
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('min-h-[48px]')
      expect(button.classes()).toContain('sm:min-h-[52px]')
    })
  })

  describe('loading states', () => {
    it('shows loading spinner when processing', () => {
      mockUseWakeLock.isLoading.value = true
      const wrapper = mount(WakeLockToggle)
      
      const spinner = wrapper.find('svg.animate-spin')
      expect(spinner.exists()).toBe(true)
      expect(spinner.attributes('aria-hidden')).toBe('true')
    })

    it('shows loading text with aria-live', () => {
      mockUseWakeLock.isLoading.value = true
      const wrapper = mount(WakeLockToggle)
      
      const loadingText = wrapper.find('[aria-live="polite"]')
      expect(loadingText.exists()).toBe(true)
      expect(loadingText.text()).toBe('処理中...')
    })

    it('updates button aria-label when loading', () => {
      mockUseWakeLock.isLoading.value = true
      const wrapper = mount(WakeLockToggle)
      
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('ウェイクロック処理中です')
    })
  })

  describe('event handling edge cases', () => {
    it('does not emit event when button is disabled', async () => {
      mockUseWakeLock.isSupported.value = false
      const wrapper = mount(WakeLockToggle)
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('request-wake-lock')).toBeFalsy()
    })

    it('does not emit event when loading', async () => {
      mockUseWakeLock.isLoading.value = true
      const wrapper = mount(WakeLockToggle)
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('request-wake-lock')).toBeFalsy()
    })

    it('clears error before emitting request event', async () => {
      mockUseWakeLock.error.value = 'Previous error'
      const wrapper = mount(WakeLockToggle)
      
      await wrapper.find('button').trigger('click')
      
      expect(mockUseWakeLock.clearError).toHaveBeenCalledOnce()
      expect(wrapper.emitted('request-wake-lock')).toBeTruthy()
    })
  })
})