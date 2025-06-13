import Vue from 'vue'
import App from './App.vue'
import { router } from './router'
import store from './store'
import 'normalize.css/normalize.css'
import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css
import './icons' // icon
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { parseTime } from '@/utils/index'

Vue.use(Element, {
  size: 'medium' // set element-ui default size
})

// 注册全局过滤器
Vue.filter('parseTime', (time, cFormat) => {
  return parseTime(time, cFormat)
})

Vue.config.productionTip = false

// 全局处理Vue Router导航重复错误
const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      // 只有当不是导航重复错误时才抛出
      return Promise.reject(err)
    }
    // 忽略导航重复错误
    return Promise.resolve()
  })
}

NProgress.configure({ showSpinner: false }) // NProgress Configuration

router.beforeEach(async (to, from, next) => {
  console.log('[Router Guard] Start. To:', to.path, 'From:', from.path);
  // start progress bar
  NProgress.start()
  if (to.meta.title !== undefined) {
    document.title = to.meta.title
  } else {
    document.title = '\u200E'
  }
  // store.commit('router/initRoutes') // 路由初始化在登录成功后或者App.vue created时执行更佳

  // 获取用户信息
  const userInfoStr = store.state.user.userInfo // 从 Vuex store 获取 userInfo 字符串
  let userRole = 0 // 默认角色为0，表示未识别或未登录

  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      if (userInfo && userInfo.role !== undefined && userInfo.role !== null) {
        userRole = parseInt(userInfo.role, 10)
        if (isNaN(userRole)) {
          console.error('main.js - 解析用户角色为数字失败 (NaN)，userInfo.role:', userInfo.role)
          userRole = 0
        }
      } else {
        // 用户信息中无角色字段，或者角色为null/undefined
        userRole = 0
      }
    } catch (e) {
      console.error('main.js - 解析Vuex中的用户信息失败:', e)
      userRole = 0
    }
    console.log('[Router Guard] UserInfo parsed. Role:', userRole);
  } else {
    console.log('[Router Guard] No userInfoStr. Role set to 0.');
    userRole = 0
  }

  // 检查用户是否登录（通过userRole判断，如果为0则可能未登录或角色信息无效）
  // 对于非登录页面，允许访问
  if (to.path === '/login') {
    console.log('[Router Guard] Path is /login. Calling next() and NProgress.done()');
    next()
    NProgress.done() // NProgress.done() 应该在这里，因为这是个终点
    return
  }

  // 如果没有有效的角色信息 (例如未登录) 并且访问的不是登录页，则重定向到登录页
  if (userRole === 0 && to.path !== '/login') {
    console.log('[Router Guard] No valid role and not /login. Redirecting to /login. Target:', to.path);
    next('/login')
    NProgress.done() // NProgress.done() 应该在这里，因为这是个终点
    return
  }

  // 根据路径前缀和用户角色进行权限控制
  // 管理员(role=3)可以访问所有路径，无需额外检查特定前缀
  // 教师(role=2)可以访问教师路径和公共路径
  // 学生(role=1)可以访问学生路径和公共路径
  console.log('[Router Guard] Checking role-based path permissions. Role:', userRole, 'To:', to.path);
  if (userRole !== 3) { // 非管理员需要检查路径权限
    if (to.path.startsWith('/teacher') && userRole !== 2) {
      console.log('[Router Guard] Teacher path, but not teacher role. Redirecting to /dashboard.');
      next('/dashboard')
      Element.Message.error('没有教师权限')
      NProgress.done() // NProgress.done() 应该在这里，因为这是个终点
      return
    }

    if (to.path.startsWith('/student') && userRole !== 1) {
      console.log('[Router Guard] Student path, but not student role. Redirecting to /dashboard.');
      next('/dashboard')
      Element.Message.error('没有学生权限')
      NProgress.done() // NProgress.done() 应该在这里，因为这是个终点
      return
    }

    // 对于/admin路径，如果不是管理员，则一律拒绝
    if (to.path.startsWith('/admin') && userRole !== 3) {
      console.log('[Router Guard] Admin path, but not admin role. Redirecting to /dashboard.');
      next('/dashboard')
      Element.Message.error('没有管理员权限')
      NProgress.done() // NProgress.done() 应该在这里，因为这是个终点
      return
    }
  }

  if (to.path) {
    // eslint-disable-next-line no-undef
    _hmt.push(['_trackPageview', '/#' + to.fullPath])
  }

  console.log('[Router Guard] All checks passed. Calling next() for path:', to.path);
  next()
  // NProgress.done() 不应该在这里，应在 afterEach
})

router.afterEach(() => {
  console.log('[Router Guard] afterEach: NProgress.done()');
  // finish progress bar
  NProgress.done()
})

Vue.prototype.$$router = router

new Vue({
  router: router,
  store: store,
  render: h => h(App)
}).$mount('#app')
