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
          name: 'home',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/dashboard',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
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
        {
          path: '/payments',
          name: 'payments',
          component: () => import('../views/PaymentsView.vue'),
        },
        {
          path: '/new-user',
          name: 'new-user',
          component: () => import('../views/AddUserView.vue'),
        },
        {
          path: '/edit-user/:id',
          name: 'edit-user',
          component: () => import('../views/EditUserView.vue'),
        },
      ],
    },
  ],
})

export default router
