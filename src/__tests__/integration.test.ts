import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import { nextTick } from 'vue';
import App from '../App.vue';
import HomeView from '../views/HomeView.vue';
import ClockView from '../views/ClockView.vue';
import PomodoroView from '../views/PomodoroView.vue';

// Define the routes for the test environment
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView, // Using actual components for integration test
    meta: { title: 'ホーム' }
  },
  {
    path: '/clock',
    name: 'Clock',
    component: ClockView,
    meta: { title: '時計', showBackButton: true }
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: PomodoroView,
    meta: { title: 'Pomodoro Timer', showBackButton: true }
  }
];

// Mock the Wake Lock API to avoid errors in test environment
const mockWakeLockSentinel = {
  released: false,
  type: 'screen',
  release: vi.fn().mockResolvedValue(undefined),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};
const mockWakeLock = {
  request: vi.fn().mockResolvedValue(mockWakeLockSentinel)
};
Object.defineProperty(navigator, 'wakeLock', {
  value: mockWakeLock,
  writable: true,
  configurable: true
});

// Mock useAudio to prevent errors during tests
const playAlarmMock = vi.fn();
vi.mock('../composables/useAudio', () => ({
  useAudio: () => ({
    playAlarm: playAlarmMock,
  }),
}));

describe('Routing and Integration Tests', () => {
  let router: Router;

  beforeEach(async () => {
    // Create a new router instance for each test to ensure isolation
    router = createRouter({
      history: createWebHistory(),
      routes,
    });

    // It's important to push to the initial route and wait for it to resolve
    router.push('/');
    await router.isReady();
  });

  it('should render the HomeView on the root path', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    // Check that HomeView content is present
    expect(wrapper.find('main h1').text()).toContain('画面スリープ防止アプリ');
    // Check that the feature card to navigate to the clock is there
    expect(wrapper.find('h3').text()).toContain('時計表示');
    // Check that the feature card to navigate to the pomodoro is there
    const cards = wrapper.findAll('h3');
    expect(cards.some(card => card.text().includes('ポモドーロタイマー'))).toBe(true);
  });

  it('should display the correct title in the navigation for the home page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    const navH1 = wrapper.find('header h1');
    expect(navH1.text()).toBe('ホーム');
  });

  it('should navigate to the ClockView page and display its content', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.push('/clock');
    await nextTick();

    const clock = wrapper.find('[class*="font-mono"]');
    expect(clock.exists()).toBe(true);

    const wakeLockControl = wrapper.findComponent({ name: 'WakeLockControl' });
    expect(wakeLockControl.exists()).toBe(true);
  });

  it('should display the correct title and back button in the navigation for the clock page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.push('/clock');
    await nextTick();

    const navH1 = wrapper.find('header h1');
    expect(navH1.text()).toBe('時計');

    const backButton = wrapper.find('header button[aria-label="前のページに戻る"]');
    expect(backButton.exists()).toBe(true);
  });

  it('should navigate back to the HomeView when navigating from clock page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    // Go to clock page first
    await router.push('/clock');
    await nextTick();

    // Navigate back to home explicitly
    await router.push('/');
    await nextTick();

    // Check that we are back on the HomeView
    expect(wrapper.find('main h1').text()).toContain('画面スリープ防止アプリ');
    
    // And the nav title is back to 'ホーム'
    const navH1 = wrapper.find('header h1');
    expect(navH1.text()).toBe('ホーム');
  });

  it('should navigate to the PomodoroView page and display its content', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.push('/pomodoro');
    await nextTick();

    const pomodoroTimer = wrapper.findComponent({ name: 'PomodoroTimer' });
    expect(pomodoroTimer.exists()).toBe(true);

    const wakeLockControl = wrapper.findComponent({ name: 'WakeLockControl' });
    expect(wakeLockControl.exists()).toBe(true);
  });

  it('should display the correct title and back button in the navigation for the pomodoro page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.push('/pomodoro');
    await nextTick();

    const navH1 = wrapper.find('header h1');
    expect(navH1.text()).toBe('Pomodoro Timer');

    const backButton = wrapper.find('header button[aria-label="前のページに戻る"]');
    expect(backButton.exists()).toBe(true);
  });
});

describe('Pomodoro Page Integration', () => {
  let router: Router;

  beforeEach(async () => {
    vi.useFakeTimers();
    router = createRouter({
      history: createWebHistory(),
      routes,
    });
    router.push('/pomodoro');
    await router.isReady();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should run through a full pomodoro cycle', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    // Initial state: Work session, cycle count is 0 and visible
    expect(wrapper.find('div.uppercase.tracking-widest').text()).toBe('work');
    const sessionInfoInitial = wrapper.findComponent({ name: 'SessionInfo' });
    expect(sessionInfoInitial.exists()).toBe(true);
    expect(sessionInfoInitial.find('span.font-bold').text()).toBe('0');

    // Start the timer
    await wrapper.find('button[aria-live="polite"]').trigger('click');
    expect(wrapper.find('button[aria-live="polite"]').text()).toBe('Pause');

    // After starting, cycle count is 1 and visible
    await nextTick();
    const sessionInfo = wrapper.findComponent({ name: 'SessionInfo' });
    expect(sessionInfo.exists()).toBe(true);
    expect(sessionInfo.find('span.font-bold').text()).toBe('1');

    // Advance time to finish work session
    await vi.advanceTimersByTimeAsync(25 * 60 * 1000);
    await nextTick();
    // Advance one more second to trigger the switch
    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();

    // State after work session: Break session, cycle 1
    expect(wrapper.find('div.uppercase.tracking-widest').text()).toBe('break');
    expect(wrapper.find('span.font-bold').text()).toBe('1');
    expect(playAlarmMock).toHaveBeenCalledTimes(1);

    // Advance time to finish break session
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    await nextTick();
    // Advance one more second to trigger the switch
    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();

    // State after break session: Work session, cycle 2
    expect(wrapper.find('div.uppercase.tracking-widest').text()).toBe('work');
    expect(wrapper.find('span.font-bold').text()).toBe('2');
    expect(playAlarmMock).toHaveBeenCalledTimes(2);
  });

  it('should allow toggling wake lock on the pomodoro page', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      },
      attachTo: document.body // Attach to body to handle Teleport
    });

    const wakeLockControl = wrapper.findComponent({ name: 'WakeLockControl' });
    expect(wakeLockControl.exists()).toBe(true);

    const toggleButton = wakeLockControl.findAll('button').find(b => b.text().includes('画面スリープ防止'));
    const statusDiv = wakeLockControl.find('div[aria-live="polite"]');

    // Initial state
    expect(statusDiv.text()).toBe('現在の状態：無効');

    // Click toggle to show modal
    await toggleButton.trigger('click');
    await nextTick();

    // Find and click the confirm button in the modal (now in document.body)
    const modalConfirmButton = document.querySelector('button[aria-label*="理解しました"]') as HTMLElement;
    expect(modalConfirmButton).toBeTruthy();
    expect(modalConfirmButton.textContent).toContain('理解した');
    
    // Click the confirm button
    modalConfirmButton.click();
    await nextTick();

    // Now, assert that the wake lock was requested and the state updated
    expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
    await nextTick();

    expect(statusDiv.text()).toBe('現在の状態：有効');

    wrapper.unmount(); // Clean up the component
  });
});