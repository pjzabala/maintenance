import { createRouter, createWebHistory } from 'vue-router';
import NarraThermal from '@/views/NarraThermal.vue';
import AborlanBunker from '@/views/AborlanBunker.vue';
import HomeView from '@/views/HomeView.vue';


const routes = [
    {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/narra-thermal1',
    name: 'NarraThermal',
    component: NarraThermal,
  },
  {
    path: '/equipment-status',
    name: 'EquipmentStatus',
    component: () => import('@/views/EquipmentStatus.vue'), // ✅ Lazy loaded
  },
  {
    path: '/aborlan-bunker1',
    name: 'AborlanBunker',
    component: AborlanBunker,
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
