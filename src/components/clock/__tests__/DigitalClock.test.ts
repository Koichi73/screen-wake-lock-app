import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/vue';
import DigitalClock from '../DigitalClock.vue';
import { useClock } from '../../../composables/useClock';
import { ref, nextTick } from 'vue';

// Mock the useClock composable
vi.mock('../../../composables/useClock', () => ({
  useClock: vi.fn(),
}));

describe('DigitalClock.vue', () => {
  it('should render the time and date provided by useClock', () => {
    // Arrange: Set up the mock to return specific values
    const mockTime = ref('12:34:56');
    const mockDate = ref('2025/12/25');
    (useClock as vi.Mock).mockReturnValue({
      formattedTime: mockTime,
      formattedDate: mockDate,
    });

    // Act: Render the component
    render(DigitalClock);

    // Assert: Check if the rendered content matches the mock values
    const timeElement = screen.getByLabelText('現在の時刻');
    const dateElement = screen.getByLabelText('現在の日付');

    expect(timeElement.textContent).toContain(mockTime.value);
    expect(dateElement.textContent).toContain(mockDate.value);
  });

  it('should update when reactive values from useClock change', async () => {
    // Arrange
    const mockTime = ref('01:02:03');
    const mockDate = ref('2026/01/01');
    (useClock as vi.Mock).mockReturnValue({
      formattedTime: mockTime,
      formattedDate: mockDate,
    });
    render(DigitalClock);

    // Assert initial state
    expect(screen.getByLabelText('現在の時刻').textContent).toContain('01:02:03');

    // Act: Change the reactive value
    mockTime.value = '04:05:06';
    await nextTick(); // Wait for Vue to update the DOM

    // Assert updated state
    expect(screen.getByLabelText('現在の時刻').textContent).toContain('04:05:06');
  });
});
