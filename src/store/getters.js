const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  userName: state => state.user.userName,
  userInfo: state => {
    if (state.user.userInfo) {
      try {
        return JSON.parse(state.user.userInfo)
      } catch (e) {
        return null
      }
    }
    return null
  },
  routes: state => state.router.routes
}
export default getters
