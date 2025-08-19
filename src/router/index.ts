import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/clock',
    name: 'Clock',
    component: () => import('../views/ClockView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
