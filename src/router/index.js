import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import Navbar from '@/components/NavigationDrawer.vue'

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
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/dashboard',
          name: 'dashboard',
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
        {
          path: '/client-terminals/:id/:name',
          name: 'client-terminals',
          component: () => import('../views/ClientTerminalsView.vue'),
        },
        {
          path: '/new-subscription/:id',
          name: 'new-subscription',
          component: () => import('../views/NewSubscriptionView.vue'),
        },
        {
          path: '/renew-subscription/:id',
          name: 'renew-subscription',
          component: () => import('../views/RenewSubscriptionView.vue'),
        },
        {
          path: '/subscriptions/:id',
          name: 'subscription-details',
          component: () => import('@/views/SubscriptionDetailsView.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/SignInView.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/SignUpView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (
    to.name !== 'sign-in' &&
    to.name !== 'sign-up' &&
    to.name !== 'forgot-password' &&
    !authStore.getIsUserLoggedIn
  ) {
    next({ name: 'sign-in' })
  } else {
    next()
  }
})

export default router
