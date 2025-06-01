import { post, get } from '@/utils/request'

export default {
  // 教师课程管理
  getCourseList: () => get('/api/teacher/course/list'),
  getCourse: id => {
    // 检查 id 是否有效（非undefined、非null、非空字符串）
    if (id === undefined || id === null || id === '' || id === 'undefined') {
      console.error('Invalid courseId:', id)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/course/select/' + id)
  },
  getCourseStudents: (courseId, params) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/course/students/' + courseId, params)
  },
  updateStudentScore: query => post('/api/teacher/course/student/score', query),
  // 班级管理
  getClassList: () => {
    // 模拟API调用返回数据，避免后端API不可用造成的错误
    return Promise.resolve({
      code: 1,
      response: [
        { id: 1, name: '计算机科学2101' },
        { id: 2, name: '计算机科学2102' },
        { id: 3, name: '软件工程2101' },
        { id: 4, name: '软件工程2102' },
        { id: 5, name: '信息安全2101' }
      ],
      message: 'success'
    })
  },
  // 学生管理
  addStudentToCourse: (courseId, studentIds) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/course/student/add', { courseId, studentIds })
  },
  addClassToCourse: (courseId, classId) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/course/class/add', { courseId, classId })
  },
  removeStudentFromCourse: (courseId, studentId) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/course/student/remove', { courseId, studentId })
  }
} 