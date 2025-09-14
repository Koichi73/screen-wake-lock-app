import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SessionInfo from '../SessionInfo.vue';

describe('SessionInfo.vue', () => {
  it('renders the cycle count correctly', () => {
    const wrapper = mount(SessionInfo, {
      props: {
        cycleCount: 3,
      },
    });

    // Check if the rendered text contains the cycle count
    const span = wrapper.find('span');
    expect(span.text()).toBe('3');
  });

  it('renders with a different cycle count', () => {
    const wrapper = mount(SessionInfo, {
      props: {
        cycleCount: 10,
      },
    });

    const span = wrapper.find('span');
    expect(span.text()).toBe('10');
  });
});
