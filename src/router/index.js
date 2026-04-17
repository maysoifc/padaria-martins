import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('../views/MenuView.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/ProfileView.vue'),
    },
        {
      path: '/carrinho',
      name: 'carrinho',
      component: () => import('../views/ProfileView.vue'),
    },
        {
      path: '/mapa',
      name: 'mapa',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
})

export default router
