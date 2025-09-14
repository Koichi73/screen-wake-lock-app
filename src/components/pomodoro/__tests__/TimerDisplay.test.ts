import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TimerDisplay from '../TimerDisplay.vue';

describe('TimerDisplay.vue', () => {
  it('renders the formatted time correctly', () => {
    const wrapper = mount(TimerDisplay, {
      props: {
        formattedTime: '25:00',
        sessionType: 'work',
      },
    });
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('25:00');
  });

  it('renders the session type correctly', () => {
    const wrapper = mount(TimerDisplay, {
      props: {
        formattedTime: '25:00',
        sessionType: 'work',
      },
    });
    expect(wrapper.find('.font-semibold').text()).toBe('work');
  });

  it('applies the correct classes for a work session', () => {
    const wrapper = mount(TimerDisplay, {
      props: {
        formattedTime: '25:00',
        sessionType: 'work',
      },
    });
    expect(wrapper.classes()).toContain('bg-blue-50');
    expect(wrapper.classes()).toContain('text-blue-900');
  });

  it('applies the correct classes for a break session', () => {
    const wrapper = mount(TimerDisplay, {
      props: {
        formattedTime: '05:00',
        sessionType: 'break',
      },
    });
    expect(wrapper.classes()).toContain('bg-green-50');
    expect(wrapper.classes()).toContain('text-green-900');
  });
});
