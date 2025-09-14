import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TimerControls from '../TimerControls.vue';

describe('TimerControls.vue', () => {

  // Test for initial state (not running)
  it('renders "Start" button initially and emits "start" on click', async () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: false, isPaused: false },
    });

    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.text()).toBe('Start');

    await primaryButton.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('start');
  });

  it('disables the reset button when not running and not paused', () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: false, isPaused: false },
    });
    const resetButton = wrapper.findAll('button').find(b => b.text() === 'Reset');
    expect(resetButton.attributes('disabled')).toBeDefined();
  });

  // Test for running state
  it('renders "Pause" button when running and emits "pause" on click', async () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: true, isPaused: false },
    });

    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.text()).toBe('Pause');

    await primaryButton.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('pause');
  });

  it('enables the reset button when running', () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: true, isPaused: false },
    });
    const resetButton = wrapper.findAll('button').find(b => b.text() === 'Reset');
    expect(resetButton.attributes('disabled')).toBeUndefined();
  });

  // Test for paused state
  it('renders "Resume" button when paused and emits "start" on click', async () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: true, isPaused: true },
    });

    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.text()).toBe('Resume');

    await primaryButton.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('start');
  });

  it('enables the reset button when paused', () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: true, isPaused: true },
    });
    const resetButton = wrapper.findAll('button').find(b => b.text() === 'Reset');
    expect(resetButton.attributes('disabled')).toBeUndefined();
  });

  // Test for reset button click
  it('emits "reset" on reset button click', async () => {
    const wrapper = mount(TimerControls, {
      props: { isRunning: true, isPaused: false }, // A state where reset is enabled
    });

    const resetButton = wrapper.findAll('button').find(b => b.text() === 'Reset');
    await resetButton.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('reset');
  });

  // Tests for button classes
  it('applies correct class for "Start" state', () => {
    const wrapper = mount(TimerControls, { props: { isRunning: false, isPaused: false } });
    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.classes()).toContain('bg-blue-500');
  });

  it('applies correct class for "Pause" state', () => {
    const wrapper = mount(TimerControls, { props: { isRunning: true, isPaused: false } });
    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.classes()).toContain('bg-red-500');
  });

  it('applies correct class for "Resume" state', () => {
    const wrapper = mount(TimerControls, { props: { isRunning: true, isPaused: true } });
    const primaryButton = wrapper.find('button[aria-live="polite"]');
    expect(primaryButton.classes()).toContain('bg-yellow-500');
  });
});
