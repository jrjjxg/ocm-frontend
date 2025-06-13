"use strict";

var _vue = _interopRequireDefault(require("vue"));

var _App = _interopRequireDefault(require("./App.vue"));

var _router = require("./router");

var _store = _interopRequireDefault(require("./store"));

require("normalize.css/normalize.css");

var _elementUi = _interopRequireDefault(require("element-ui"));

require("./styles/element-variables.scss");

require("@/styles/index.scss");

require("./icons");

var _nprogress = _interopRequireDefault(require("nprogress"));

require("nprogress/nprogress.css");

var _index2 = require("@/utils/index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// global css
// icon
// progress bar
// progress bar style
_vue["default"].use(_elementUi["default"], {
  size: 'medium' // set element-ui default size

}); // 注册全局过滤器


_vue["default"].filter('parseTime', function (time, cFormat) {
  return (0, _index2.parseTime)(time, cFormat);
});

_vue["default"].config.productionTip = false; // 全局处理Vue Router导航重复错误

var originalPush = _router.router.push;

_router.router.push = function push(location) {
  return originalPush.call(this, location)["catch"](function (err) {
    if (err.name !== 'NavigationDuplicated') {
      // 只有当不是导航重复错误时才抛出
      return Promise.reject(err);
    } // 忽略导航重复错误


    return Promise.resolve();
  });
};

_nprogress["default"].configure({
  showSpinner: false
}); // NProgress Configuration


_router.router.beforeEach(function _callee(to, from, next) {
  var userInfoStr, userRole, userInfo;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('[Router Guard] Start. To:', to.path, 'From:', from.path); // start progress bar

          _nprogress["default"].start();

          if (to.meta.title !== undefined) {
            document.title = to.meta.title;
          } else {
            document.title = "\u200E";
          } // store.commit('router/initRoutes') // 路由初始化在登录成功后或者App.vue created时执行更佳
          // 获取用户信息


          userInfoStr = _store["default"].state.user.userInfo; // 从 Vuex store 获取 userInfo 字符串

          userRole = 0; // 默认角色为0，表示未识别或未登录

          if (userInfoStr) {
            try {
              userInfo = JSON.parse(userInfoStr);

              if (userInfo && userInfo.role !== undefined && userInfo.role !== null) {
                userRole = parseInt(userInfo.role, 10);

                if (isNaN(userRole)) {
                  console.error('main.js - 解析用户角色为数字失败 (NaN)，userInfo.role:', userInfo.role);
                  userRole = 0;
                }
              } else {
                // 用户信息中无角色字段，或者角色为null/undefined
                userRole = 0;
              }
            } catch (e) {
              console.error('main.js - 解析Vuex中的用户信息失败:', e);
              userRole = 0;
            }

            console.log('[Router Guard] UserInfo parsed. Role:', userRole);
          } else {
            console.log('[Router Guard] No userInfoStr. Role set to 0.');
            userRole = 0;
          } // 检查用户是否登录（通过userRole判断，如果为0则可能未登录或角色信息无效）
          // 对于非登录页面，允许访问


          if (!(to.path === '/login')) {
            _context.next = 11;
            break;
          }

          console.log('[Router Guard] Path is /login. Calling next() and NProgress.done()');
          next();

          _nprogress["default"].done(); // NProgress.done() 应该在这里，因为这是个终点


          return _context.abrupt("return");

        case 11:
          if (!(userRole === 0 && to.path !== '/login')) {
            _context.next = 16;
            break;
          }

          console.log('[Router Guard] No valid role and not /login. Redirecting to /login. Target:', to.path);
          next('/login');

          _nprogress["default"].done(); // NProgress.done() 应该在这里，因为这是个终点


          return _context.abrupt("return");

        case 16:
          // 根据路径前缀和用户角色进行权限控制
          // 管理员(role=3)可以访问所有路径，无需额外检查特定前缀
          // 教师(role=2)可以访问教师路径和公共路径
          // 学生(role=1)可以访问学生路径和公共路径
          console.log('[Router Guard] Checking role-based path permissions. Role:', userRole, 'To:', to.path);

          if (!(userRole !== 3)) {
            _context.next = 36;
            break;
          }

          if (!(to.path.startsWith('/teacher') && userRole !== 2)) {
            _context.next = 24;
            break;
          }

          console.log('[Router Guard] Teacher path, but not teacher role. Redirecting to /dashboard.');
          next('/dashboard');

          _elementUi["default"].Message.error('没有教师权限');

          _nprogress["default"].done(); // NProgress.done() 应该在这里，因为这是个终点


          return _context.abrupt("return");

        case 24:
          if (!(to.path.startsWith('/student') && userRole !== 1)) {
            _context.next = 30;
            break;
          }

          console.log('[Router Guard] Student path, but not student role. Redirecting to /dashboard.');
          next('/dashboard');

          _elementUi["default"].Message.error('没有学生权限');

          _nprogress["default"].done(); // NProgress.done() 应该在这里，因为这是个终点


          return _context.abrupt("return");

        case 30:
          if (!(to.path.startsWith('/admin') && userRole !== 3)) {
            _context.next = 36;
            break;
          }

          console.log('[Router Guard] Admin path, but not admin role. Redirecting to /dashboard.');
          next('/dashboard');

          _elementUi["default"].Message.error('没有管理员权限');

          _nprogress["default"].done(); // NProgress.done() 应该在这里，因为这是个终点


          return _context.abrupt("return");

        case 36:
          if (to.path) {
            // eslint-disable-next-line no-undef
            _hmt.push(['_trackPageview', '/#' + to.fullPath]);
          }

          console.log('[Router Guard] All checks passed. Calling next() for path:', to.path);
          next(); // NProgress.done() 不应该在这里，应在 afterEach

        case 39:
        case "end":
          return _context.stop();
      }
    }
  });
});

_router.router.afterEach(function () {
  console.log('[Router Guard] afterEach: NProgress.done()'); // finish progress bar

  _nprogress["default"].done();
});

_vue["default"].prototype.$$router = _router.router;
new _vue["default"]({
  router: _router.router,
  store: _store["default"],
  render: function render(h) {
    return h(_App["default"]);
  }
}).$mount('#app');