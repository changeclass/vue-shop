import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
  // 当访问根路径时自动跳转登录页面
  {
    path: '/',
    redirect: '/login'
  },
  // 登录页面的路由
  { path: '/login', component: Login }
]

const router = new VueRouter({
  routes
})

export default router
