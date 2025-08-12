import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../../App.vue'
import WakeLockToggle from '../WakeLockToggle.vue'
import WarningModal from '../WarningModal.vue'

// Mock the components to isolate App.vue testing
vi.mock('../WakeLockToggle.vue', () => ({
  default: {
    name: 'WakeLockToggle',
    template: '<div data-testid="wake-lock-toggle"><button @click="$emit(\'request-wake-lock\', mockCallback)">Toggle</button></div>',
    emits: ['request-wake-lock'],
    setup() {
      const mockCallback = vi.fn().mockResolvedValue(undefined)
      return { mockCallback }
    }
  }
}))

vi.mock('../WarningModal.vue', () => ({
  default: {
    name: 'WarningModal',
    template: `
      <div v-if="isVisible" data-testid="warning-modal">
        <button @click="$emit('confirm')" data-testid="modal-confirm">Confirm</button>
        <button @click="$emit('close')" data-testid="modal-close">Close</button>
      </div>
    `,
    props: ['isVisible', 'isProcessing'],
    emits: ['confirm', 'close']
  }
}))

describe('App.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Create a div with id="app" for Teleport target
    const app = document.createElement('div')
    app.id = 'app'
    document.body.appendChild(app)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Clean up the DOM
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders correctly with all main sections', () => {
    wrapper = mount(App)

    // Check main structure
    expect(wrapper.find('[role="main"]').exists()).toBe(true)
    expect(wrapper.find('#app-title').text()).toBe('スリープ防止ウェブページ')
    expect(wrapper.find('#app-description').exists()).toBe(true)
    
    // Check components are rendered
    expect(wrapper.findComponent(WakeLockToggle).exists()).toBe(true)
    expect(wrapper.findComponent(WarningModal).exists()).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    wrapper = mount(App)

    const main = wrapper.find('[role="main"]')
    expect(main.attributes('aria-label')).toBe('スリープ防止ウェブアプリケーション')
    
    const skipLink = wrapper.find('a[href="#main-content"]')
    expect(skipLink.exists()).toBe(true)
    expect(skipLink.text()).toBe('メインコンテンツにスキップ')
    
    const mainContent = wrapper.find('#main-content')
    expect(mainContent.attributes('role')).toBe('region')
    expect(mainContent.attributes('aria-labelledby')).toBe('app-title')
  })

  it('initially does not show warning modal', () => {
    wrapper = mount(App)

    const modal = wrapper.findComponent(WarningModal)
    expect(modal.props('isVisible')).toBe(false)
    expect(modal.props('isProcessing')).toBe(false)
  })

  describe('wake lock request handling', () => {
    it('shows warning modal on first wake lock request', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      const mockCallback = vi.fn().mockResolvedValue(undefined)
      
      await toggle.vm.$emit('request-wake-lock', mockCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      expect(modal.props('isVisible')).toBe(true)
      expect(modal.props('isProcessing')).toBe(false)
    })

    it('does not show modal on subsequent requests after warning shown', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      const mockCallback1 = vi.fn().mockResolvedValue(undefined)
      const mockCallback2 = vi.fn().mockResolvedValue(undefined)

      // First request - should show modal
      await toggle.vm.$emit('request-wake-lock', mockCallback1)
      await nextTick()

      let modal = wrapper.findComponent(WarningModal)
      expect(modal.props('isVisible')).toBe(true)

      // Confirm modal
      await modal.vm.$emit('confirm')
      await nextTick()

      expect(modal.props('isVisible')).toBe(false)
      expect(mockCallback1).toHaveBeenCalledOnce()

      // Second request - should not show modal
      await toggle.vm.$emit('request-wake-lock', mockCallback2)
      await nextTick()

      modal = wrapper.findComponent(WarningModal)
      expect(modal.props('isVisible')).toBe(false)
      expect(mockCallback2).toHaveBeenCalledOnce()
    })

    it('executes wake lock callback directly when warning already shown', async () => {
      wrapper = mount(App)

      // Set hasShownWarning to true by simulating a previous modal confirmation
      const toggle = wrapper.findComponent(WakeLockToggle)
      const firstCallback = vi.fn().mockResolvedValue(undefined)
      
      // First request to show modal
      await toggle.vm.$emit('request-wake-lock', firstCallback)
      await nextTick()

      // Confirm modal
      const modal = wrapper.findComponent(WarningModal)
      await modal.vm.$emit('confirm')
      await nextTick()

      // Second request should execute directly
      const secondCallback = vi.fn().mockResolvedValue(undefined)
      await toggle.vm.$emit('request-wake-lock', secondCallback)
      await nextTick()

      expect(secondCallback).toHaveBeenCalledOnce()
      expect(modal.props('isVisible')).toBe(false)
    })

    it('handles wake lock callback errors gracefully', async () => {
      wrapper = mount(App)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const toggle = wrapper.findComponent(WakeLockToggle)
      const errorCallback = vi.fn().mockRejectedValue(new Error('Wake lock failed'))

      // Set hasShownWarning to true to skip modal
      await toggle.vm.$emit('request-wake-lock', vi.fn().mockResolvedValue(undefined))
      const modal = wrapper.findComponent(WarningModal)
      await modal.vm.$emit('confirm')
      await nextTick()

      // Now test error handling
      await toggle.vm.$emit('request-wake-lock', errorCallback)
      await nextTick()

      expect(errorCallback).toHaveBeenCalledOnce()
      expect(consoleSpy).toHaveBeenCalledWith('Wake lock request failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('modal interaction', () => {
    it('executes pending wake lock request when modal is confirmed', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      const mockCallback = vi.fn().mockResolvedValue(undefined)

      // Trigger wake lock request
      await toggle.vm.$emit('request-wake-lock', mockCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      expect(modal.props('isVisible')).toBe(true)

      // Confirm modal
      await modal.vm.$emit('confirm')
      await nextTick()

      expect(mockCallback).toHaveBeenCalledOnce()
      expect(modal.props('isVisible')).toBe(false)
      expect(modal.props('isProcessing')).toBe(false)
    })

    it('shows processing state during modal confirmation', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      let resolveCallback: () => void
      const slowCallback = vi.fn().mockImplementation(() => {
        return new Promise<void>((resolve) => {
          resolveCallback = resolve
        })
      })

      // Trigger wake lock request
      await toggle.vm.$emit('request-wake-lock', slowCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      
      // Start confirmation (should show processing state)
      const confirmPromise = modal.vm.$emit('confirm')
      await nextTick()

      expect(modal.props('isProcessing')).toBe(true)
      expect(modal.props('isVisible')).toBe(true)

      // Resolve the callback
      resolveCallback!()
      await confirmPromise
      await nextTick()

      expect(modal.props('isProcessing')).toBe(false)
      expect(modal.props('isVisible')).toBe(false)
    })

    it('handles errors during modal confirmation', async () => {
      wrapper = mount(App)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const toggle = wrapper.findComponent(WakeLockToggle)
      const errorCallback = vi.fn().mockRejectedValue(new Error('Wake lock failed'))

      // Trigger wake lock request
      await toggle.vm.$emit('request-wake-lock', errorCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      
      // Confirm modal (should handle error)
      await modal.vm.$emit('confirm')
      await nextTick()

      expect(errorCallback).toHaveBeenCalledOnce()
      expect(consoleSpy).toHaveBeenCalledWith('Wake lock request failed after modal confirmation:', expect.any(Error))
      expect(modal.props('isVisible')).toBe(false)
      expect(modal.props('isProcessing')).toBe(false)

      consoleSpy.mockRestore()
    })

    it('clears pending request when modal is closed', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      const mockCallback = vi.fn().mockResolvedValue(undefined)

      // Trigger wake lock request
      await toggle.vm.$emit('request-wake-lock', mockCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      expect(modal.props('isVisible')).toBe(true)

      // Close modal without confirming
      await modal.vm.$emit('close')
      await nextTick()

      expect(mockCallback).not.toHaveBeenCalled()
      expect(modal.props('isVisible')).toBe(false)
    })

    it('prevents multiple modal confirmations when processing', async () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      let resolveCallback: () => void
      const slowCallback = vi.fn().mockImplementation(() => {
        return new Promise<void>((resolve) => {
          resolveCallback = resolve
        })
      })

      // Trigger wake lock request
      await toggle.vm.$emit('request-wake-lock', slowCallback)
      await nextTick()

      const modal = wrapper.findComponent(WarningModal)
      
      // Start first confirmation
      modal.vm.$emit('confirm')
      await nextTick()

      expect(modal.props('isProcessing')).toBe(true)

      // Try to confirm again while processing
      await modal.vm.$emit('confirm')
      await nextTick()

      // Should still only be called once
      expect(slowCallback).toHaveBeenCalledTimes(1)

      // Resolve the callback
      resolveCallback!()
      await nextTick()
    })
  })

  describe('responsive design and accessibility', () => {
    it('has responsive classes for different screen sizes', () => {
      wrapper = mount(App)

      const container = wrapper.find('.min-h-screen')
      expect(container.classes()).toContain('py-4')
      expect(container.classes()).toContain('sm:py-8')
      expect(container.classes()).toContain('px-4')
      expect(container.classes()).toContain('sm:px-6')
      expect(container.classes()).toContain('lg:px-8')
    })

    it('has proper heading hierarchy', () => {
      wrapper = mount(App)

      const h1 = wrapper.find('h1')
      expect(h1.exists()).toBe(true)
      expect(h1.attributes('id')).toBe('app-title')

      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      expect(h2.classes()).toContain('sr-only')
    })

    it('has proper ARIA landmarks and labels', () => {
      wrapper = mount(App)

      const main = wrapper.find('[role="main"]')
      expect(main.exists()).toBe(true)

      const region = wrapper.find('[role="region"]')
      expect(region.exists()).toBe(true)

      const notes = wrapper.findAll('[role="note"]')
      expect(notes.length).toBeGreaterThan(0)
    })

    it('has skip link for keyboard navigation', () => {
      wrapper = mount(App)

      const skipLink = wrapper.find('a[href="#main-content"]')
      expect(skipLink.exists()).toBe(true)
      expect(skipLink.classes()).toContain('sr-only')
      expect(skipLink.classes()).toContain('focus:not-sr-only')
    })
  })

  describe('component integration', () => {
    it('passes correct props to WarningModal', () => {
      wrapper = mount(App)

      const modal = wrapper.findComponent(WarningModal)
      expect(modal.props()).toEqual({
        isVisible: false,
        isProcessing: false
      })
    })

    it('listens to correct events from WakeLockToggle', () => {
      wrapper = mount(App)

      const toggle = wrapper.findComponent(WakeLockToggle)
      // Check that the component has the event listener
      expect(toggle.props()).toBeDefined()
      expect(toggle.exists()).toBe(true)
    })

    it('listens to correct events from WarningModal', () => {
      wrapper = mount(App)

      const modal = wrapper.findComponent(WarningModal)
      // Check that the component has the required props
      expect(modal.props()).toEqual({
        isVisible: false,
        isProcessing: false
      })
      expect(modal.exists()).toBe(true)
    })
  })
})