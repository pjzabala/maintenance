// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NarraThermal1 from '@/views/NarraThermal.vue';
import AborlanBunker1 from '@/views/AborlanBunker.vue';


const routes = [
    {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/narra-thermal1',
    name: 'NarraThermal',
    component: NarraThermal1,
  },
  {
    path: '/equipment-status',
    name: 'EquipmentStatus',
    component: () => import('@/views/EquipmentStatus.vue'), // ✅ Lazy loaded
  },
  {
    path: '/aborlan-bunker1',
    name: 'AborlanBunker',
    component: AborlanBunker1,
  },
  {
    path: '/hs-diesel',
    name: 'HsDiesel',
    component: () => import('@/views/HsDiesel.vue') // ✅ Lazy loaded
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
