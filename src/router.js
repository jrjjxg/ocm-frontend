import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: () => import('@/views/login/index'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'AdminDashboard',
        meta: { title: '管理主页', icon: 'home', affix: true, roles: [3] }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'UserPage',
    meta: {
      title: '用户管理',
      icon: 'users',
      roles: [3]
    },
    children: [
      {
        path: 'student/list',
        component: () => import('@/views/user/student/list'),
        name: 'UserStudentPageList',
        meta: { title: '学生列表', noCache: true }
      },
      {
        path: 'student/edit',
        component: () => import('@/views/user/student/edit'),
        name: 'UserStudentEdit',
        meta: { title: '学生编辑', noCache: true, activeMenu: '/user/student/list' },
        hidden: true
      },
      {
        path: 'teacher/list',
        component: () => import('@/views/user/teacher/list'),
        name: 'UserTeacherPageList',
        meta: { title: '教师列表', noCache: true }
      },
      {
        path: 'teacher/edit',
        component: () => import('@/views/user/teacher/edit'),
        name: 'UserTeacherEdit',
        meta: { title: '教师编辑', noCache: true, activeMenu: '/user/teacher/list' },
        hidden: true
      },
      {
        path: 'admin/list',
        component: () => import('@/views/user/admin/list'),
        name: 'UserAdminPageList',
        meta: { title: '管理员列表', noCache: true }
      },
      {
        path: 'admin/edit',
        component: () => import('@/views/user/admin/edit'),
        name: 'UserAdminEdit',
        meta: { title: '管理员编辑', noCache: true, activeMenu: '/user/admin/list' },
        hidden: true
      }
    ]
  },
  {
    path: '/exam',
    component: Layout,
    name: 'ExamPage',
    meta: {
      title: '卷题管理',
      icon: 'exam',
      roles: [3]
    },
    children: [
      {
        path: 'paper/list',
        component: () => import('@/views/exam/paper/list'),
        name: 'ExamPaperPageList',
        meta: { title: '试卷列表', noCache: true }
      },
      {
        path: 'paper/edit',
        component: () => import('@/views/exam/paper/edit'),
        name: 'ExamPaperEdit',
        meta: { title: '试卷编辑', noCache: true, activeMenu: '/exam/paper/list' },
        hidden: true
      },
      {
        path: 'question/list',
        component: () => import('@/views/exam/question/list'),
        name: 'ExamQuestionPageList',
        meta: { title: '题目列表', noCache: true }
      },
      {
        path: 'question/edit/singleChoice',
        component: () => import('@/views/exam/question/edit/single-choice'),
        name: 'singleChoicePage',
        meta: { title: '单选题编辑', noCache: true, activeMenu: '/exam/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/multipleChoice',
        component: () => import('@/views/exam/question/edit/multiple-choice'),
        name: 'multipleChoicePage',
        meta: { title: '多选题编辑', noCache: true, activeMenu: '/exam/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/trueFalse',
        component: () => import('@/views/exam/question/edit/true-false'),
        name: 'trueFalsePage',
        meta: { title: '判断题编辑', noCache: true, activeMenu: '/exam/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/gapFilling',
        component: () => import('@/views/exam/question/edit/gap-filling'),
        name: 'gapFillingPage',
        meta: { title: '填空题编辑', noCache: true, activeMenu: '/exam/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/shortAnswer',
        component: () => import('@/views/exam/question/edit/short-answer'),
        name: 'shortAnswerPage',
        meta: { title: '简答题编辑', noCache: true, activeMenu: '/exam/question/list' },
        hidden: true
      }
    ]
  },
  {
    path: '/task',
    component: Layout,
    name: 'TaskPage',
    meta: {
      title: '任务管理',
      icon: 'task',
      roles: [3]
    },
    alwaysShow: true,
    children: [
      {
        path: 'list',
        component: () => import('@/views/task/list'),
        name: 'TaskListPage',
        meta: { title: '任务列表', noCache: true }
      },
      {
        path: 'edit',
        component: () => import('@/views/task/edit'),
        name: 'TaskEditPage',
        meta: { title: '任务创建', noCache: true }
      }
    ]
  },
  {
    path: '/education',
    component: Layout,
    name: 'EducationPage',
    meta: {
      title: '教育管理',
      icon: 'education',
      roles: [3]
    },
    alwaysShow: true,
    children: [
      {
        path: 'subject/list',
        component: () => import('@/views/education/subject/list'),
        name: 'EducationSubjectPage',
        meta: { title: '学科列表', noCache: true }
      },
      {
        path: 'subject/edit',
        component: () => import('@/views/education/subject/edit'),
        name: 'EducationSubjectEditPage',
        meta: { title: '学科编辑', noCache: true, activeMenu: '/education/subject/list' },
        hidden: true
      },
      {
        path: 'course/list',
        component: () => import('@/views/education/course/list'),
        name: 'EducationCoursePage',
        meta: { title: '课程列表', noCache: true }
      },
      {
        path: 'course/edit',
        component: () => import('@/views/education/course/edit'),
        name: 'EducationCourseEditPage',
        meta: { title: '课程编辑', noCache: true, activeMenu: '/education/course/list' },
        hidden: true
      },
      {
        path: 'course/teacher',
        component: () => import('@/views/education/course/teacher'),
        name: 'EducationCourseTeacherPage',
        meta: { title: '课程教师管理', noCache: true, activeMenu: '/education/course/list' },
        hidden: true
      },
      {
        path: 'course/student',
        component: () => import('@/views/education/course/student'),
        name: 'EducationCourseStudentPage',
        meta: { title: '课程学生管理', noCache: true, activeMenu: '/education/course/list' },
        hidden: true
      }
    ]
  },
  {
    path: '/answer',
    component: Layout,
    name: 'AnswerPage',
    meta: {
      title: '成绩管理',
      icon: 'answer',
      roles: [3]
    },
    alwaysShow: true,
    children: [
      {
        path: 'list',
        component: () => import('@/views/answer/list'),
        name: 'AnswerPageList',
        meta: { title: '答卷列表', noCache: true }
      }
    ]
  },
  {
    path: '/message',
    component: Layout,
    name: 'MessagePage',
    meta: {
      title: '消息中心',
      icon: 'message',
      roles: [3]
    },
    alwaysShow: true,
    children: [
      {
        path: 'list',
        component: () => import('@/views/message/list'),
        name: 'MessageListPage',
        meta: { title: '消息列表', noCache: true }
      },
      {
        path: 'send',
        component: () => import('@/views/message/send'),
        name: 'MessageSendPage',
        meta: { title: '消息发送', noCache: true }
      }
    ]
  },
  {
    path: '/log',
    component: Layout,
    name: 'LogPage',
    meta: {
      title: '日志中心',
      icon: 'log',
      roles: [3]
    },
    alwaysShow: true,
    children: [
      {
        path: 'user/list',
        component: () => import('@/views/log/list'),
        name: 'LogUserPage',
        meta: { title: '用户日志', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人简介', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/teacher',
    component: Layout,
    redirect: '/teacher/course/list',
    name: 'TeacherArea',
    meta: { title: '教师空间', icon: 'education', roles: [2] },
    children: [
      {
        path: 'course/list',
        component: () => import('@/views/teacher/course/list'),
        name: 'TeacherCourseList',
        meta: { title: '我的课程', icon: 'home', affix: true, noCache: true }
      },
      {
        path: 'course/detail',
        component: () => import('@/views/teacher/course/detail'),
        name: 'TeacherCourseDetail',
        meta: { title: '课程详情', noCache: true, activeMenu: '/teacher/course/list' },
        hidden: true
      },
      {
        path: 'course/:id',
        component: () => import('@/views/teacher/course/courseHub'),
        name: 'TeacherCourseHub',
        meta: { title: '课程中心', noCache: true, activeMenu: '/teacher/course/list' },
        hidden: true,
        children: [
          {
            path: 'overview',
            component: () => import('@/views/teacher/course/overview'),
            name: 'CourseOverview',
            meta: { title: '课程概览', noCache: true }
          },
          {
            path: 'assignments',
            component: () => import('@/views/teacher/course/assignments'),
            name: 'CourseAssignments',
            meta: { title: '作业管理', noCache: true }
          },
          {
            path: 'exams',
            component: () => import('@/views/teacher/course/exams'),
            name: 'CourseExams',
            meta: { title: '测验管理', noCache: true }
          },
          {
            path: 'resources',
            component: () => import('@/views/teacher/course/resources'),
            name: 'CourseResources',
            meta: { title: '课程资料', noCache: true }
          },
          {
            path: 'students',
            component: () => import('@/views/teacher/course/students'),
            name: 'CourseStudents',
            meta: { title: '学生管理', noCache: true }
          },
          {
            path: 'questionBank',
            component: () => import('@/views/teacher/course/questionBank'),
            name: 'CourseQuestionBank',
            meta: { title: '题库管理', noCache: true }
          },
          {
            path: 'papers',
            component: () => import('@/views/teacher/course/papers'),
            name: 'CoursePapers',
            meta: { title: '试卷管理', noCache: true }
          },
          {
            path: 'exam/:examId/results',
            component: () => import('@/views/teacher/course/examResults'),
            name: 'CourseExamResults',
            meta: { title: '测验成绩', noCache: true, activeMenu: '/teacher/course/:id/exams' },
            hidden: true
          },
          {
            path: 'question/edit/:type',
            component: () => import('@/views/teacher/course/questionEdit'),
            name: 'CourseQuestionEdit',
            meta: { title: '题目编辑', noCache: true, activeMenu: '/teacher/course/:id/questionBank' },
            hidden: true,
            props: true
          },
          {
            path: 'paper/edit',
            component: () => import('@/views/teacher/course/paperEdit'),
            name: 'CoursePaperEdit',
            meta: { title: '试卷编辑', noCache: true, activeMenu: '/teacher/course/:id/papers' },
            hidden: true
          },
          {
            path: 'exam/:examId/answer/:answerId',
            component: () => import('@/views/teacher/course/examAnswer'),
            name: 'CourseExamAnswer',
            meta: { title: '答卷评阅', noCache: true, activeMenu: '/teacher/course/:id/exams' },
            hidden: true
          }
        ]
      }
    ]
  },
  {
    path: '/student',
    component: Layout,
    redirect: '/student/course/list',
    name: 'StudentArea',
    meta: { title: '学生空间', icon: 'user', roles: [1] },
    children: [
      {
        path: 'course/list',
        component: () => import('@/views/student/course/list'),
        name: 'StudentCoursePageList',
        meta: { title: '我的课程', icon: 'home', affix: true, noCache: true }
      },
      {
        path: 'course/available',
        component: () => import('@/views/student/course/available'),
        name: 'StudentCourseAvailable',
        meta: { title: '可选课程', noCache: true }
      },
      {
        path: 'course/detail',
        component: () => import('@/views/student/course/detail'),
        name: 'StudentCourseDetail',
        meta: { title: '课程详情', noCache: true, activeMenu: '/student/course/list' },
        hidden: true
      },
      {
        path: 'course/:id',
        component: () => import('@/views/student/course/courseHub'),
        name: 'StudentCourseHub',
        meta: { title: '课程中心', noCache: true, activeMenu: '/student/course/list' },
        hidden: true,
        children: [
          {
            path: 'overview',
            component: () => import('@/views/student/course/overview'),
            name: 'StudentCourseOverview',
            meta: { title: '课程概览', noCache: true }
          },
          {
            path: 'resources',
            component: () => import('@/views/student/course/resources'),
            name: 'StudentCourseResources',
            meta: { title: '课程资源', noCache: true }
          },
          {
            path: 'exams',
            component: () => import('@/views/student/course/exams'),
            name: 'StudentCourseExams',
            meta: { title: '课程测验', noCache: true }
          },
          {
            path: 'exam/:examId',
            component: () => import('@/views/student/course/examDetail'),
            name: 'StudentCourseExamDetail',
            meta: { title: '测验详情', noCache: true, activeMenu: '/student/course/:id/exams' },
            hidden: true
          },
          {
            path: 'exam/:examId/do',
            component: () => import('@/views/student/course/examDo'),
            name: 'StudentCourseExamDo',
            meta: { title: '参加测验', noCache: true, activeMenu: '/student/course/:id/exams' },
            hidden: true
          },
          {
            path: 'exam/:examId/result',
            component: () => import('@/views/student/course/examResult'),
            name: 'StudentCourseExamResult',
            meta: { title: '测验结果', noCache: true, activeMenu: '/student/course/:id/exams' },
            hidden: true
          }
        ]
      }
    ]
  },
  { path: '*',
    hidden: true,
    component: () => import('@/views/error-page/404'),
    meta: { title: '404', noCache: true }
  }
]

const router = new Router({
  routes: constantRoutes
})

export {
  constantRoutes,
  router
}
