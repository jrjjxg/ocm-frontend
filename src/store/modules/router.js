import { constantRoutes } from '@/router'
// import Cookies from 'js-cookie' // No longer directly reading cookies here

let state = {
  routes: constantRoutes
}

const mutations = {
  // Note: initRoutes now needs access to the rootState to get user.userInfo
  initRoutes: (state, rootState) => { 
    let userRole = 0 // 默认角色为0
    const userInfoStr = rootState.user.userInfo // 从 Vuex store user模块获取 userInfo 字符串

    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        if (userInfo && userInfo.role !== undefined && userInfo.role !== null) {
          userRole = parseInt(userInfo.role, 10)
          if (isNaN(userRole)) {
            console.error('store/router.js - 解析用户角色为数字失败 (NaN)，userInfo.role:', userInfo.role)
            userRole = 0
          }
        } else {
          console.warn('store/router.js - Vuex store 用户信息中未找到role或role为null/undefined')
          userRole = 0
        }
      } catch (e) {
        console.error('store/router.js - 解析Vuex store中的用户信息失败:', e)
        userRole = 0
      }
    } else {
      // console.log('store/router.js - Vuex store 中未找到用户信息 (user.userInfo is null/undefined)')
      userRole = 0 // 没有用户信息则角色为0
    }
    
    let accessRoutes = constantRoutes.filter(route => {
      // 特殊处理：管理主页只对管理员(role=3)显示
      if (route.path === '/' && userRole !== 3) {
        return false;
      }
      
      if (!route.meta || !route.meta.roles) {
        return true;
      }
      return route.meta.roles.includes(userRole);
    });
    
    state.routes = accessRoutes;
  }
}

const actions = {
  // Action to call mutation with rootState
  initializeRoutes({ commit, rootState }) {
    commit('initRoutes', rootState)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions // Make sure actions are exported
}
