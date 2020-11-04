import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  // 当访问根路径时自动跳转登录页面
  { path: '/', redirect: '/login' },
  // 登录页面的路由
  { path: '/login', component: Login },
  // home页面
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})
// 路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next表示一个函数，放行
  if (to.path === '/login') return next()
  // 获取TOKEN
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('./login')
  next()
})

export default router
