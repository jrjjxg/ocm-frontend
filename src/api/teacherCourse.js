import { post, get } from '@/utils/request'

export default {
  // 教师课程管理
  getCourseList: () => get('/api/teacher/courses'),
  getCourse: id => {
    // 检查 id 是否有效（非undefined、非null、非空字符串）
    if (id === undefined || id === null || id === '' || id === 'undefined') {
      console.error('Invalid courseId:', id)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return get('/api/teacher/courses/' + id)
  },
  getCourseStudents: (courseId, params) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return get('/api/teacher/courses/' + courseId + '/students', { params })
  },
  updateStudentScore: query => post('/api/teacher/courses/student/score', query),

  // 学生管理
  addStudentToCourse: (courseId, studentIds) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/courses/student/add', { courseId, studentIds })
  },
  removeStudentFromCourse: (courseId, studentId) => {
    // 检查 courseId 是否有效
    if (courseId === undefined || courseId === null || courseId === '' || courseId === 'undefined') {
      console.error('Invalid courseId:', courseId)
      return Promise.reject(new Error('无效的课程ID'))
    }
    return post('/api/teacher/courses/student/remove', { courseId, studentId })
  }
} 