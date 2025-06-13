"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.del = exports.put = exports.form = exports.get = exports.postWithOutLoadTip = exports.postWithLoadTip = exports.post = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var request = function request(loadtip, query) {
  var loading;

  if (loadtip) {
    loading = _vue["default"].prototype.$loading({
      lock: false,
      text: '正在加载中…',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.5)'
    });
  }

  return _axios["default"].request(query).then(function (res) {
    if (loadtip) {
      loading.close();
    }

    if (res.data.code === 401) {
      _vue["default"].prototype.$$router.push({
        path: '/login'
      });

      return Promise.reject(res.data);
    } else if (res.data.code === 500) {
      return Promise.reject(res.data);
    } else if (res.data.code === 501) {
      return Promise.reject(res.data);
    } else if (res.data.code === 502) {
      _vue["default"].prototype.$$router.push({
        path: '/login'
      });

      return Promise.reject(res.data);
    } else {
      return Promise.resolve(res.data);
    }
  })["catch"](function (e) {
    if (loadtip) {
      loading.close();
    }

    _vue["default"].prototype.$message.error(e.message);

    return Promise.reject(e.message);
  });
};

var post = function post(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json',
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.post = post;

var postWithLoadTip = function postWithLoadTip(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json',
      'request-ajax': true
    }
  };
  return request(true, query);
};

exports.postWithLoadTip = postWithLoadTip;

var postWithOutLoadTip = function postWithOutLoadTip(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json',
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.postWithOutLoadTip = postWithOutLoadTip;

var get = function get(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'get',
    withCredentials: true,
    timeout: 30000,
    params: params,
    headers: {
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.get = get;

var form = function form(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data',
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.form = form;

var put = function put(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'put',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json',
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.put = put;

var del = function del(url, params) {
  var query = {
    baseURL: process.env.VUE_APP_URL || 'http://localhost:8000',
    url: url,
    method: 'delete',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json',
      'request-ajax': true
    }
  };
  return request(false, query);
};

exports.del = del;