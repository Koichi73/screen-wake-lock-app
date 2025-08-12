import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WarningModal from '../WarningModal.vue'

describe('WarningModal', () => {
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
  })

  it('renders modal when isVisible is true', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    expect(document.querySelector('#modal-title')).toBeTruthy()
    expect(document.querySelector('#modal-title')?.textContent?.trim()).toBe('画面スリープ防止機能について')
  })

  it('does not render modal when isVisible is false', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: false
      },
      attachTo: document.body
    })

    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeFalsy()
  })

  it('displays correct Japanese warning message', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const modalContent = document.querySelector('[role="dialog"]')
    expect(modalContent?.textContent).toContain('画面スリープ防止機能は、ブラウザで本webページを表示している間だけ有効です。以下のいずれかの操作を行うと、自動的に解除されます：')
    expect(modalContent?.textContent).toContain('他のタブに切り替える')
    expect(modalContent?.textContent).toContain('ブラウザを閉じる')
    expect(modalContent?.textContent).toContain('他のアプリを画面の前面に表示する')
  })

  it('displays confirmation button with correct text', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
    expect(confirmButton).toBeTruthy()
    expect(confirmButton?.textContent?.trim()).toBe('理解した')
  })

  it('emits confirm event when confirmation button is clicked', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
    confirmButton?.click()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits close event when backdrop is clicked', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const backdrop = document.querySelector('[role="dialog"]')
    backdrop?.click()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close event when modal content is clicked', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const modalContent = document.querySelector('.bg-white')
    modalContent?.click()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('emits close event when Escape key is pressed', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const backdrop = document.querySelector('[role="dialog"]')
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    backdrop?.dispatchEvent(escapeEvent)

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has proper accessibility attributes', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-labelledby')).toBe('modal-title')

    const title = document.querySelector('#modal-title')
    expect(title).toBeTruthy()
  })

  it('focuses confirmation button when modal becomes visible', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: false
      },
      attachTo: document.body
    })

    await wrapper.setProps({ isVisible: true })
    await nextTick()
    await nextTick() // Wait for focus to be set

    const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
    expect(document.activeElement).toBe(confirmButton)
  })

  it('handles Enter key on confirmation button', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    confirmButton?.dispatchEvent(enterEvent)

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('handles Space key on confirmation button', async () => {
    wrapper = mount(WarningModal, {
      props: {
        isVisible: true
      },
      attachTo: document.body
    })

    await nextTick()

    const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
    confirmButton?.dispatchEvent(spaceEvent)

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  describe('processing state', () => {
    it('shows processing state when isProcessing is true', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      // Look for the specific confirm button that should show processing state
      const buttons = document.querySelectorAll('button')
      let confirmButton: Element | null = null
      
      // Find the button that contains processing text or is the confirm button
      for (const button of buttons) {
        if (button.textContent?.includes('処理中') || button.textContent?.includes('理解した')) {
          confirmButton = button
          break
        }
      }
      
      expect(confirmButton).toBeTruthy()
      const buttonText = confirmButton?.textContent || ''
      expect(buttonText).toContain('処理中...')
      expect(confirmButton?.hasAttribute('disabled')).toBe(true)
    })

    it('shows loading spinner when processing', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeTruthy()
      expect(spinner?.getAttribute('aria-hidden')).toBe('true')
    })

    it('prevents close when processing', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      const backdrop = document.querySelector('[role="dialog"]')
      backdrop?.click()

      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('prevents confirm when processing', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
      confirmButton?.click()

      expect(wrapper.emitted('confirm')).toBeFalsy()
    })

    it('prevents escape key when processing', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      const backdrop = document.querySelector('[role="dialog"]')
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      backdrop?.dispatchEvent(escapeEvent)

      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('disables close button when processing', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true,
          isProcessing: true
        },
        attachTo: document.body
      })

      await nextTick()

      const closeButton = document.querySelector('button[aria-label*="モーダルを閉じる"]')
      expect(closeButton?.hasAttribute('disabled')).toBe(true)
    })
  })

  describe('focus management', () => {
    it('traps focus within modal', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()
      await nextTick() // Wait for focus to be set

      const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
      const closeButton = document.querySelector('button[aria-label*="モーダルを閉じる"]')

      // Tab from confirm button should go to close button
      confirmButton?.focus()
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(tabEvent)

      // Shift+Tab from close button should go to confirm button
      closeButton?.focus()
      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      document.dispatchEvent(shiftTabEvent)

      // Focus should stay within modal
      expect(document.activeElement).toBe(confirmButton)
    })

    it('handles arrow key navigation', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
      confirmButton?.focus()

      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(arrowDownEvent)

      const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(arrowUpEvent)

      // Should handle arrow keys without errors
      expect(document.activeElement).toBeTruthy()
    })

    it('prevents focus trap when no focusable elements', async () => {
      // Mock getFocusableElements to return empty array
      const originalQuerySelectorAll = Element.prototype.querySelectorAll
      Element.prototype.querySelectorAll = vi.fn().mockReturnValue([])

      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(tabEvent)

      // Should not throw error
      expect(true).toBe(true)

      Element.prototype.querySelectorAll = originalQuerySelectorAll
    })
  })

  describe('responsive design', () => {
    it('has responsive classes for different screen sizes', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const modalContent = document.querySelector('.bg-white')
      expect(modalContent?.classList.contains('p-6')).toBe(true)
      expect(modalContent?.classList.contains('sm:p-8')).toBe(true)
      expect(modalContent?.classList.contains('max-w-md')).toBe(true)
      expect(modalContent?.classList.contains('sm:max-w-lg')).toBe(true)
    })

    it('has minimum touch target sizes', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const confirmButton = document.querySelector('button[aria-label*="理解しました"]')
      expect(confirmButton?.classList.contains('min-h-[48px]')).toBe(true)
      expect(confirmButton?.classList.contains('sm:min-h-[52px]')).toBe(true)
    })
  })

  describe('transitions', () => {
    it('applies correct transition classes', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: false
        },
        attachTo: document.body
      })

      await wrapper.setProps({ isVisible: true })
      await nextTick()

      // Check that transition components are rendered
      const transitionElements = document.querySelectorAll('[class*="transition"]')
      expect(transitionElements.length).toBeGreaterThan(0)
    })
  })

  describe('content validation', () => {
    it('displays all required Japanese text content', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const modalContent = document.querySelector('[role="dialog"]')
      const textContent = modalContent?.textContent || ''

      expect(textContent).toContain('画面スリープ防止機能について')
      expect(textContent).toContain('画面スリープ防止機能は、ブラウザで本webページを表示している間だけ有効です。以下のいずれかの操作を行うと、自動的に解除されます：')
      expect(textContent).toContain('他のタブに切り替える')
      expect(textContent).toContain('ブラウザを閉じる')
      expect(textContent).toContain('他のアプリを画面の前面に表示する')
      expect(textContent).toContain('この内容を理解した上でご利用ください。')
      expect(textContent).toContain('理解した')
    })

    it('has proper list structure', async () => {
      wrapper = mount(WarningModal, {
        props: {
          isVisible: true
        },
        attachTo: document.body
      })

      await nextTick()

      const list = document.querySelector('[role="list"]')
      expect(list).toBeTruthy()
      expect(list?.classList.contains('list-decimal')).toBe(true)
      expect(list?.classList.contains('list-inside')).toBe(true)

      const listItems = list?.querySelectorAll('li')
      expect(listItems?.length).toBe(3)
    })
  })
})