import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { useClock } from '../useClock';
import { defineComponent, nextTick } from 'vue';

// A wrapper component to test the composable's output
const TestComponent = defineComponent({
  template: `
    <div>
      <span data-testid="time">{{ formattedTime }}</span>
      <span data-testid="date">{{ formattedDate }}</span>
    </div>
  `,
  setup() {
    const { formattedTime, formattedDate } = useClock();
    return { formattedTime, formattedDate };
  },
});

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render initial formatted time and date correctly', async () => {
    const specificDate = new Date('2025-08-20T10:20:30');
    vi.setSystemTime(specificDate);

    render(TestComponent);

    // Wait for the component to render with initial values
    await nextTick();

    expect(screen.getByTestId('time').textContent).toBe('10:20:30');
    expect(screen.getByTestId('date').textContent).toBe('2025/08/20');
  });

  it('should update the time every second', async () => {
    render(TestComponent);
    await nextTick();

    const initialTime = screen.getByTestId('time').textContent;

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    await nextTick();

    const timeAfter1Second = screen.getByTestId('time').textContent;
    expect(timeAfter1Second).not.toBe(initialTime);
  });

  it('should clear the interval on unmount', () => {
    const { unmount } = render(TestComponent);

    // Timer should be running after mount
    expect(vi.getTimerCount()).toBe(1);

    // Unmount the component to trigger cleanup
    unmount();

    // Timer should be cleared
    expect(vi.getTimerCount()).toBe(0);
  });
});