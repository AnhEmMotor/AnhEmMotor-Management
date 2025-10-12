import { createRouter, createWebHistory } from 'vue-router';
import PhieuNhapView from '@/views/PhieuNhapView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'phieu-nhap',
      component: PhieuNhapView
    },
    {
      path: '/them-moi',
      name: 'them-moi-phieu-nhap',
      component: PhieuNhapView
    }
  ]
});

export default router;