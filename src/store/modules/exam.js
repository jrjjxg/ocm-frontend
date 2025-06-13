// 由于课程管理系统不需要学科概念，这个模块可以简化或移除
// 暂时保留空的实现以避免破坏现有代码

const state = {
  // 课程管理系统不需要学科概念，保留空状态
}

const getters = {
  // 保留空的getters以避免破坏现有代码
}

// actions
const actions = {
  initSubject ({ commit }, action) {
    // 课程管理系统不需要学科概念，直接执行回调
    if (action !== undefined) {
      action()
    }
  }
}

// mutations
const mutations = {
  // 保留空的mutations
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
