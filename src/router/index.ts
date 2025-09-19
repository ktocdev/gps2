import { createRouter, createWebHistory } from 'vue-router'
import DebugView from '../views/DebugView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'debug',
      component: DebugView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router