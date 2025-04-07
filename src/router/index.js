import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '@/components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Navbar,
      children: [
        {
          path: '',
          name: 'clients',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/ClientsView.vue'),
        },
        {
          path: '/clients',
          name: 'clients',
          component: () => import('../views/ClientsView.vue'),
        },
        {
          path: '/users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
        },
        {
          path: '/terminals',
          name: 'terminals',
          component: () => import('../views/TerminalsView.vue'),
        },
        {
          path: '/subscriptions',
          name: 'subscriptions',
          component: () => import('../views/SubscriptionsView.vue'),
        },
      ],
    },
  ],
})

export default router
