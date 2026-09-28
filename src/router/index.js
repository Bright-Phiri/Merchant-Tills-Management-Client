import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import Navbar from '@/components/NavigationDrawer.vue'
import { useCustomerStore } from '@/stores/useCustomerStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/portal/login',
      name: 'customer-login',
      meta: { portal: true },
      component: () => import('../views/portal/CustomerSignInView.vue'),
    },
    {
      path: '/portal/change-password',
      name: 'customer-change-password',
      meta: { portal: true, customer: true, passwordChange: true, title: 'Secure your account' },
      component: () => import('../views/ChangeTemporaryPasswordView.vue'),
    },
    {
      path: '/portal',
      component: () => import('../components/portal/PortalLayout.vue'),
      meta: { portal: true, customer: true },
      children: [
        {
          path: '',
          name: 'customer-overview',
          meta: { title: 'Overview' },
          component: () => import('../views/portal/OverviewView.vue'),
        },
        {
          path: 'plans',
          name: 'customer-plans',
          meta: { title: 'Subscription plans' },
          component: () => import('../views/portal/PlansView.vue'),
        },
        {
          path: 'checkout/:planId',
          name: 'customer-checkout',
          meta: { title: 'Checkout' },
          component: () => import('../views/portal/CheckoutView.vue'),
        },
        {
          path: 'payment',
          name: 'customer-payment',
          meta: { title: 'Payment confirmation' },
          component: () => import('../views/portal/PaymentResultView.vue'),
        },
        {
          path: 'payments',
          name: 'customer-payments',
          meta: { title: 'Payment history' },
          component: () => import('../views/portal/PaymentHistoryView.vue'),
        },
      ],
    },
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
          path: '/logs',
          name: 'logs',
          component: () => import('../views/LogsView.vue'),
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
          path: '/subscription-plans',
          name: 'subscription-plans',
          component: () => import('../views/SubscriptionPlansView.vue'),
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
      path: '/change-password',
      name: 'change-password',
      meta: { passwordChange: true },
      component: () => import('../views/ChangeTemporaryPasswordView.vue'),
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
  if (to.meta.portal) {
    const customerStore = useCustomerStore()
    if (to.meta.customer && !customerStore.authenticated) {
      return next({ name: 'customer-login', query: { redirect: to.fullPath } })
    }
    if (customerStore.authenticated && customerStore.mustChangePassword && !to.meta.passwordChange) {
      return next({ name: 'customer-change-password' })
    }
    return next()
  }
  const authStore = useAuthStore()

  if (
    to.name !== 'sign-in' &&
    to.name !== 'sign-up' &&
    to.name !== 'forgot-password' &&
    !authStore.getIsUserLoggedIn
  ) {
    next({ name: 'sign-in' })
  } else if (
    authStore.getIsUserLoggedIn &&
    authStore.getMustChangePassword &&
    !to.meta.passwordChange
  ) {
    next({ name: 'change-password' })
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = to.meta.portal
    ? `${to.meta.title || 'Merchant sign in'} · T-Control`
    : 'T-Control · Back office'
  window.scrollTo({ top: 0, behavior: 'instant' })
})

export default router
