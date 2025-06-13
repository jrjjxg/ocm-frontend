"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.router = exports.constantRoutes = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _vueRouter = _interopRequireDefault(require("vue-router"));

var _layout = _interopRequireDefault(require("@/layout"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_vue["default"].use(_vueRouter["default"]);

var constantRoutes = [{
  path: '/redirect',
  component: _layout["default"],
  hidden: true,
  children: [{
    path: '/redirect/:path*',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/redirect/index'));
      });
    }
  }]
}, {
  path: '/login',
  name: 'Login',
  hidden: true,
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/views/login/index'));
    });
  },
  meta: {
    title: '登录'
  }
}, {
  path: '/',
  component: _layout["default"],
  redirect: '/dashboard',
  children: [{
    path: 'dashboard',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/dashboard/index'));
      });
    },
    name: 'AdminDashboard',
    meta: {
      title: '管理主页',
      icon: 'home',
      affix: true,
      roles: [3]
    }
  }]
}, {
  path: '/user',
  component: _layout["default"],
  name: 'UserPage',
  meta: {
    title: '用户管理',
    icon: 'users',
    roles: [3]
  },
  children: [{
    path: 'student/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/student/list'));
      });
    },
    name: 'UserStudentPageList',
    meta: {
      title: '学生列表',
      noCache: true
    }
  }, {
    path: 'student/edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/student/edit'));
      });
    },
    name: 'UserStudentEdit',
    meta: {
      title: '学生编辑',
      noCache: true,
      activeMenu: '/user/student/list'
    },
    hidden: true
  }, {
    path: 'teacher/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/teacher/list'));
      });
    },
    name: 'UserTeacherPageList',
    meta: {
      title: '教师列表',
      noCache: true
    }
  }, {
    path: 'teacher/edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/teacher/edit'));
      });
    },
    name: 'UserTeacherEdit',
    meta: {
      title: '教师编辑',
      noCache: true,
      activeMenu: '/user/teacher/list'
    },
    hidden: true
  }, {
    path: 'admin/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/admin/list'));
      });
    },
    name: 'UserAdminPageList',
    meta: {
      title: '管理员列表',
      noCache: true
    }
  }, {
    path: 'admin/edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/user/admin/edit'));
      });
    },
    name: 'UserAdminEdit',
    meta: {
      title: '管理员编辑',
      noCache: true,
      activeMenu: '/user/admin/list'
    },
    hidden: true
  }]
}, {
  path: '/exam',
  component: _layout["default"],
  name: 'ExamPage',
  meta: {
    title: '卷题管理',
    icon: 'exam',
    roles: [3]
  },
  children: [{
    path: 'paper/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/paper/list'));
      });
    },
    name: 'ExamPaperPageList',
    meta: {
      title: '试卷列表',
      noCache: true
    }
  }, {
    path: 'paper/edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/paper/edit'));
      });
    },
    name: 'ExamPaperEdit',
    meta: {
      title: '试卷编辑',
      noCache: true,
      activeMenu: '/exam/paper/list'
    },
    hidden: true
  }, {
    path: 'question/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/list'));
      });
    },
    name: 'ExamQuestionPageList',
    meta: {
      title: '题目列表',
      noCache: true
    }
  }, {
    path: 'question/edit/singleChoice',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/edit/single-choice'));
      });
    },
    name: 'singleChoicePage',
    meta: {
      title: '单选题编辑',
      noCache: true,
      activeMenu: '/exam/question/list'
    },
    hidden: true
  }, {
    path: 'question/edit/multipleChoice',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/edit/multiple-choice'));
      });
    },
    name: 'multipleChoicePage',
    meta: {
      title: '多选题编辑',
      noCache: true,
      activeMenu: '/exam/question/list'
    },
    hidden: true
  }, {
    path: 'question/edit/trueFalse',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/edit/true-false'));
      });
    },
    name: 'trueFalsePage',
    meta: {
      title: '判断题编辑',
      noCache: true,
      activeMenu: '/exam/question/list'
    },
    hidden: true
  }, {
    path: 'question/edit/gapFilling',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/edit/gap-filling'));
      });
    },
    name: 'gapFillingPage',
    meta: {
      title: '填空题编辑',
      noCache: true,
      activeMenu: '/exam/question/list'
    },
    hidden: true
  }, {
    path: 'question/edit/shortAnswer',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/exam/question/edit/short-answer'));
      });
    },
    name: 'shortAnswerPage',
    meta: {
      title: '简答题编辑',
      noCache: true,
      activeMenu: '/exam/question/list'
    },
    hidden: true
  }]
}, {
  path: '/task',
  component: _layout["default"],
  name: 'TaskPage',
  meta: {
    title: '任务管理',
    icon: 'task',
    roles: [3]
  },
  alwaysShow: true,
  children: [{
    path: 'list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/task/list'));
      });
    },
    name: 'TaskListPage',
    meta: {
      title: '任务列表',
      noCache: true
    }
  }, {
    path: 'edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/task/edit'));
      });
    },
    name: 'TaskEditPage',
    meta: {
      title: '任务创建',
      noCache: true
    }
  }]
}, {
  path: '/education',
  component: _layout["default"],
  name: 'EducationPage',
  meta: {
    title: '教育管理',
    icon: 'education',
    roles: [3]
  },
  alwaysShow: true,
  children: [{
    path: 'course/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/education/course/list'));
      });
    },
    name: 'EducationCoursePage',
    meta: {
      title: '课程列表',
      noCache: true
    }
  }, {
    path: 'course/edit',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/education/course/edit'));
      });
    },
    name: 'EducationCourseEditPage',
    meta: {
      title: '课程编辑',
      noCache: true,
      activeMenu: '/education/course/list'
    },
    hidden: true
  }, {
    path: 'course/teacher',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/education/course/teacher'));
      });
    },
    name: 'EducationCourseTeacherPage',
    meta: {
      title: '课程教师管理',
      noCache: true,
      activeMenu: '/education/course/list'
    },
    hidden: true
  }, {
    path: 'course/student',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/education/course/student'));
      });
    },
    name: 'EducationCourseStudentPage',
    meta: {
      title: '课程学生管理',
      noCache: true,
      activeMenu: '/education/course/list'
    },
    hidden: true
  }]
}, {
  path: '/answer',
  component: _layout["default"],
  name: 'AnswerPage',
  meta: {
    title: '成绩管理',
    icon: 'answer',
    roles: [3]
  },
  alwaysShow: true,
  children: [{
    path: 'list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/answer/list'));
      });
    },
    name: 'AnswerPageList',
    meta: {
      title: '答卷列表',
      noCache: true
    }
  }]
}, {
  path: '/message',
  component: _layout["default"],
  name: 'MessagePage',
  meta: {
    title: '消息中心',
    icon: 'message',
    roles: [3]
  },
  alwaysShow: true,
  children: [{
    path: 'list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/message/list'));
      });
    },
    name: 'MessageListPage',
    meta: {
      title: '消息列表',
      noCache: true
    }
  }, {
    path: 'send',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/message/send'));
      });
    },
    name: 'MessageSendPage',
    meta: {
      title: '消息发送',
      noCache: true
    }
  }]
}, {
  path: '/log',
  component: _layout["default"],
  name: 'LogPage',
  meta: {
    title: '日志中心',
    icon: 'log',
    roles: [3]
  },
  alwaysShow: true,
  children: [{
    path: 'user/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/log/list'));
      });
    },
    name: 'LogUserPage',
    meta: {
      title: '用户日志',
      noCache: true
    }
  }]
}, {
  path: '/profile',
  component: _layout["default"],
  hidden: true,
  children: [{
    path: 'index',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/profile/index'));
      });
    },
    name: 'Profile',
    meta: {
      title: '个人简介',
      icon: 'user',
      noCache: true
    }
  }]
}, {
  path: '/teacher',
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/layout/TeacherLayout'));
    });
  },
  redirect: '/teacher/index',
  name: 'TeacherArea',
  meta: {
    title: '教师空间',
    icon: 'education',
    roles: [2]
  },
  children: [{
    path: 'index',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/teacher/course/list'));
      });
    },
    name: 'TeacherIndex',
    meta: {
      title: '教师空间',
      icon: 'home',
      affix: true,
      noCache: true
    }
  }, {
    path: 'course/detail',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/teacher/course/detail'));
      });
    },
    name: 'TeacherCourseDetail',
    meta: {
      title: '课程详情',
      noCache: true,
      activeMenu: '/teacher/course/list'
    },
    hidden: true
  }, {
    path: 'course/:id',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/teacher/course/courseHub'));
      });
    },
    name: 'TeacherCourseHub',
    meta: {
      title: '课程中心',
      noCache: true,
      activeMenu: '/teacher/course/list'
    },
    hidden: true,
    children: [{
      path: 'overview',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/overview'));
        });
      },
      name: 'CourseOverview',
      meta: {
        title: '课程概览',
        noCache: true
      }
    }, {
      path: 'homework',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homework'));
        });
      },
      name: 'CourseHomework',
      meta: {
        title: '作业管理',
        noCache: true
      }
    }, {
      path: 'homework/create',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homeworkCreate'));
        });
      },
      name: 'CourseHomeworkCreate',
      meta: {
        title: '创建作业',
        noCache: true,
        activeMenu: '/teacher/course/:id/homework'
      },
      hidden: true
    }, {
      path: 'homework/edit/:homeworkId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homeworkCreate'));
        });
      },
      name: 'CourseHomeworkEdit',
      meta: {
        title: '编辑作业',
        noCache: true,
        activeMenu: '/teacher/course/:id/homework'
      },
      hidden: true
    }, {
      path: 'homework/detail/:homeworkId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homeworkDetail_new'));
        });
      },
      name: 'CourseHomeworkDetail',
      meta: {
        title: '作业详情',
        noCache: true,
        activeMenu: '/teacher/course/:id/homework'
      },
      hidden: true
    }, {
      path: 'homework/grade/:homeworkId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homeworkGrade'));
        });
      },
      name: 'CourseHomeworkGrade',
      meta: {
        title: '批改作业',
        noCache: true,
        activeMenu: '/teacher/course/:id/homework'
      },
      hidden: true
    }, {
      path: 'homework/statistics/:homeworkId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/homeworkStatistics'));
        });
      },
      name: 'CourseHomeworkStatistics',
      meta: {
        title: '作业统计',
        noCache: true,
        activeMenu: '/teacher/course/:id/homework'
      },
      hidden: true
    }, {
      path: 'exams',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/exams'));
        });
      },
      name: 'CourseExams',
      meta: {
        title: '测验管理',
        noCache: true
      }
    }, {
      path: 'exam/:examId/results',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/examResults'));
        });
      },
      name: 'CourseExamResults',
      meta: {
        title: '测验成绩',
        noCache: true,
        activeMenu: '/teacher/course/:id/exams'
      },
      hidden: true
    }, {
      path: 'exam/:examId/answer/:answerId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/examAnswer'));
        });
      },
      name: 'CourseExamAnswer',
      meta: {
        title: '答卷评阅',
        noCache: true,
        activeMenu: '/teacher/course/:id/exams'
      },
      hidden: true
    }, {
      path: 'questionBank',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/questionBank'));
        });
      },
      name: 'CourseQuestionBank',
      meta: {
        title: '题库管理',
        noCache: true
      }
    }, {
      path: 'question/edit/:type',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/questionEdit'));
        });
      },
      name: 'CourseQuestionEdit',
      meta: {
        title: '题目编辑',
        noCache: true,
        activeMenu: '/teacher/course/:id/questionBank'
      },
      hidden: true,
      props: true
    }, {
      path: 'papers',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/papers'));
        });
      },
      name: 'CoursePapers',
      meta: {
        title: '试卷管理',
        noCache: true
      }
    }, {
      path: 'paper/edit',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/paperEdit'));
        });
      },
      name: 'CoursePaperEdit',
      meta: {
        title: '试卷编辑',
        noCache: true,
        activeMenu: '/teacher/course/:id/papers'
      },
      hidden: true
    }, {
      path: 'discussion',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/discussion'));
        });
      },
      name: 'CourseDiscussion',
      meta: {
        title: '课程讨论',
        noCache: true
      }
    }, {
      path: 'discussion/:discussionId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/discussionDetail'));
        });
      },
      name: 'CourseDiscussionDetail',
      meta: {
        title: '讨论详情',
        noCache: true,
        activeMenu: '/teacher/course/:courseId/discussion'
      },
      hidden: true
    }, {
      path: 'resources',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/resources'));
        });
      },
      name: 'CourseResources',
      meta: {
        title: '课程资料',
        noCache: true
      }
    }, {
      path: 'students',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/students'));
        });
      },
      name: 'CourseStudents',
      meta: {
        title: '学生管理',
        noCache: true
      }
    }, {
      path: 'grades',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/teacher/course/grades'));
        });
      },
      name: 'CourseGrades',
      meta: {
        title: '成绩统计',
        noCache: true
      }
    }]
  }]
}, {
  path: '/student',
  component: _layout["default"],
  redirect: '/student/course/list',
  name: 'StudentArea',
  meta: {
    title: '学生空间',
    icon: 'user',
    roles: [1]
  },
  children: [{
    path: 'course/list',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/course/list'));
      });
    },
    name: 'StudentCoursePageList',
    meta: {
      title: '我的课程',
      icon: 'home',
      affix: true,
      noCache: true
    }
  }, {
    path: 'course/available',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/course/available'));
      });
    },
    name: 'StudentCourseAvailable',
    meta: {
      title: '可选课程',
      noCache: true
    }
  }, {
    path: 'course/detail',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/course/detail'));
      });
    },
    name: 'StudentCourseDetail',
    meta: {
      title: '课程详情',
      noCache: true,
      activeMenu: '/student/course/list'
    },
    hidden: true
  }, {
    path: 'course/:id',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/course/courseHub'));
      });
    },
    name: 'StudentCourseHub',
    meta: {
      title: '课程中心',
      noCache: true,
      activeMenu: '/student/course/list'
    },
    hidden: true,
    children: [{
      path: 'overview',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/overview'));
        });
      },
      name: 'StudentCourseOverview',
      meta: {
        title: '课程概览',
        noCache: true
      }
    }, {
      path: 'discussion',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/discussion'));
        });
      },
      name: 'StudentCourseDiscussion',
      meta: {
        title: '课程讨论',
        noCache: true
      }
    }, {
      path: 'discussion/:discussionId',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/discussionDetail'));
        });
      },
      name: 'StudentCourseDiscussionDetail',
      meta: {
        title: '讨论详情',
        noCache: true,
        activeMenu: '/student/course/:id/discussion'
      },
      hidden: true
    }, {
      path: 'resources',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/resources'));
        });
      },
      name: 'StudentCourseResources',
      meta: {
        title: '课程资源',
        noCache: true
      }
    }, {
      path: 'exams',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/exams'));
        });
      },
      name: 'StudentCourseExams',
      meta: {
        title: '课程测验',
        noCache: true
      }
    }, {
      path: 'grades',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/grades'));
        });
      },
      name: 'StudentCourseGrades',
      meta: {
        title: '我的成绩',
        noCache: true
      }
    }, {
      path: 'homework',
      component: function component() {
        return Promise.resolve().then(function () {
          return _interopRequireWildcard(require('@/views/student/course/homework'));
        });
      },
      name: 'StudentCourseHomework',
      meta: {
        title: '课程作业',
        noCache: true
      }
    }]
  }, {
    path: 'homework',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/homework/HomeworkList'));
      });
    },
    name: 'StudentHomeworkList',
    meta: {
      title: '我的作业',
      icon: 'edit',
      noCache: true
    }
  }, {
    path: 'homework/answer/:id',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/homework/HomeworkAnswer'));
      });
    },
    name: 'StudentHomeworkAnswer',
    meta: {
      title: '作业答题',
      noCache: true,
      activeMenu: '/student/homework'
    },
    hidden: true
  }, {
    path: 'homework/result/:id',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/homework/HomeworkResult'));
      });
    },
    name: 'StudentHomeworkResult',
    meta: {
      title: '作业结果',
      noCache: true,
      activeMenu: '/student/homework'
    },
    hidden: true
  }, {
    path: 'exam/:id/do',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/exam/do'));
      });
    },
    name: 'StudentExamDo',
    meta: {
      title: '在线考试',
      noCache: true
    },
    hidden: true
  }, {
    path: 'exam/:id/result',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/exam/result'));
      });
    },
    name: 'StudentExamResult',
    meta: {
      title: '考试结果',
      noCache: true
    },
    hidden: true
  }, {
    path: 'homework/test',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/homework/HomeworkTest'));
      });
    },
    name: 'HomeworkTest',
    meta: {
      title: '作业功能测试',
      noCache: true
    },
    hidden: true
  }]
}, // 全屏布局路由 - 用于答题页面
{
  path: '/fullscreen',
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/layout/FullscreenLayout'));
    });
  },
  hidden: true,
  children: [{
    path: 'homework/answer/:id',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/homework/HomeworkAnswer'));
      });
    },
    name: 'FullscreenHomeworkAnswer',
    meta: {
      title: '作业答题',
      noCache: true,
      roles: [1]
    }
  }, {
    path: 'exam/:id/do',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/views/student/exam/do'));
      });
    },
    name: 'FullscreenExamDo',
    meta: {
      title: '在线考试',
      noCache: true,
      roles: [1]
    }
  }]
}, {
  path: '*',
  hidden: true,
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/views/error-page/404'));
    });
  },
  meta: {
    title: '404',
    noCache: true
  }
}];
exports.constantRoutes = constantRoutes;
var router = new _vueRouter["default"]({
  routes: constantRoutes
});
exports.router = router;