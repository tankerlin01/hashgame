import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory('/hashgame/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/frequency',
      name: 'Frequency',
      component: () => import('../views/Frequency.vue')
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/History.vue')
    },
    {
      path: '/strategy',
      name: 'Strategy',
      component: () => import('../views/Strategy.vue')
    },
    {
      path: '/my-strategies',
      name: 'MyStrategies',
      component: () => import('../views/MyStrategies.vue')
    },
    {
      path: '/update',
      name: 'Update',
      component: () => import('../views/Update.vue')
    }
  ]
})

export default router
