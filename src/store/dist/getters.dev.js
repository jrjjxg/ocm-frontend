"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var getters = {
  sidebar: function sidebar(state) {
    return state.app.sidebar;
  },
  device: function device(state) {
    return state.app.device;
  },
  visitedViews: function visitedViews(state) {
    return state.tagsView.visitedViews;
  },
  cachedViews: function cachedViews(state) {
    return state.tagsView.cachedViews;
  },
  userName: function userName(state) {
    return state.user.userName;
  },
  userInfo: function userInfo(state) {
    if (state.user.userInfo) {
      try {
        return JSON.parse(state.user.userInfo);
      } catch (e) {
        return null;
      }
    }

    return null;
  },
  routes: function routes(state) {
    return state.router.routes;
  }
};
var _default = getters;
exports["default"] = _default;