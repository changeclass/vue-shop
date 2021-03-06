import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import User from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'

// import GoodList from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'

// import Order from '../components/order/order.vue'
// import Report from '../components/report/Report.vue'

const Login = () =>
  import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
const Home = () =>
  import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
const Welcome = () =>
  import(
    /* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue'
  )
const User = () =>
  import(
    /* webpackChunkName:"User_Rights_Roles" */ '../components/user/User.vue'
  )
const Rights = () =>
  import(
    /* webpackChunkName:"User_Rights_Roles" */ '../components/power/Rights.vue'
  )
const Roles = () =>
  import(
    /* webpackChunkName:"User_Rights_Roles" */ '../components/power/Roles.vue'
  )
const Cate = () =>
  import(/* webpackChunkName:"Cate_Params" */ '../components/goods/Cate.vue')
const Params = () =>
  import(/* webpackChunkName:"Cate_Params" */ '../components/goods/Params.vue')

const GoodList = () =>
  import(/* webpackChunkName:"GoodList_Add" */ '../components/goods/List.vue')
const Add = () =>
  import(/* webpackChunkName:"GoodList_Add" */ '../components/goods/Add.vue')
const Edit = () =>
  import(/* webpackChunkName:"GoodList_Add" */ '../components/goods/Edit.vue')
const Order = () =>
  import(/* webpackChunkName:"Order_Report" */ '../components/order/order.vue')
const Report = () =>
  import(
    /* webpackChunkName:"Order_Report" */ '../components/report/Report.vue'
  )

Vue.use(VueRouter)

const routes = [
  // 当访问根路径时自动跳转登录页面
  { path: '/', redirect: '/login' },
  // 登录页面的路由
  { path: '/login', component: Login },
  // home页面
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodList },
      { path: '/goods/add', component: Add },
      { path: '/goods/edit/:id', component: Edit, props: true },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
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
