import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'ホーム' }
  },
  {
    path: '/clock',
    name: 'Clock',
    component: () => import('../views/ClockView.vue'),
    meta: { title: '時計', showBackButton: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
