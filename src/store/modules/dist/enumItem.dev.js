"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
// initial state
var state = {
  user: {
    sexEnum: [{
      key: 1,
      value: '男'
    }, {
      key: 2,
      value: '女'
    }],
    statusEnum: [{
      key: 1,
      value: '启用'
    }, {
      key: 2,
      value: '禁用'
    }],
    levelEnum: [{
      key: 1,
      value: '一年级'
    }, {
      key: 2,
      value: '二年级'
    }, {
      key: 3,
      value: '三年级'
    }, {
      key: 4,
      value: '四年级'
    }, {
      key: 5,
      value: '五年级'
    }, {
      key: 6,
      value: '六年级'
    }, {
      key: 7,
      value: '初一'
    }, {
      key: 8,
      value: '初二'
    }, {
      key: 9,
      value: '初三'
    }, {
      key: 10,
      value: '高一'
    }, {
      key: 11,
      value: '高二'
    }, {
      key: 12,
      value: '高三'
    }],
    roleEnum: [{
      key: 1,
      value: '学生'
    }, {
      key: 2,
      value: '教师'
    }, {
      key: 3,
      value: '管理员'
    }],
    statusTag: [{
      key: 1,
      value: 'success'
    }, {
      key: 2,
      value: 'danger'
    }],
    statusBtn: [{
      key: 1,
      value: '禁用'
    }, {
      key: 2,
      value: '启用'
    }]
  },
  exam: {
    examPaper: {
      paperTypeEnum: [{
        key: 1,
        value: '固定试卷'
      }, {
        key: 4,
        value: '时段试卷'
      }, {
        key: 6,
        value: '任务试卷'
      }]
    },
    question: {
      typeEnum: [{
        key: 1,
        value: '单选题'
      }, {
        key: 2,
        value: '多选题'
      }, {
        key: 3,
        value: '判断题'
      }, {
        key: 4,
        value: '填空题'
      }, {
        key: 5,
        value: '简答题'
      }],
      editUrlEnum: [{
        key: 1,
        value: '/exam/question/edit/singleChoice',
        name: '单选题'
      }, {
        key: 2,
        value: '/exam/question/edit/multipleChoice',
        name: '多选题'
      }, {
        key: 3,
        value: '/exam/question/edit/trueFalse',
        name: '判断题'
      }, {
        key: 4,
        value: '/exam/question/edit/gapFilling',
        name: '填空题'
      }, {
        key: 5,
        value: '/exam/question/edit/shortAnswer',
        name: '简答题'
      }],
      answer: {
        doCompletedTag: [{
          key: false,
          value: ''
        }, {
          key: true,
          value: 'success'
        }],
        doRightEnum: [{
          key: false,
          value: '错误'
        }, {
          key: true,
          value: '正确'
        }],
        doRightTag: [{
          key: false,
          value: 'danger'
        }, {
          key: true,
          value: 'success'
        }]
      }
    }
  }
}; // getters

var getters = {
  enumFormat: function enumFormat(state) {
    return function (arrary, key) {
      return format(arrary, key);
    };
  }
}; // actions

var actions = {}; // mutations

var mutations = {};

var format = function format(array, key) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      if (item.key === key) {
        return item.value;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
};

var _default = {
  namespaced: true,
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations
};
exports["default"] = _default;