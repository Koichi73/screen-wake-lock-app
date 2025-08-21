import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import { nextTick } from 'vue';
import App from '../App.vue';
import HomeView from '../views/HomeView.vue';
import ClockView from '../views/ClockView.vue';

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
});