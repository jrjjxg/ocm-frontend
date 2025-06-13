import { get, post, del } from '@/utils/request'

// 默认导出
export default {
  // 学生课程管理
  getAvailableCourses: () => get('/api/student/courses/available'),
  getEnrolledCourses: () => get('/api/student/courses'),
  getCourse: id => get('/api/student/courses/' + id),
  enrollCourse: courseId => post('/api/student/courses/' + courseId + '/enroll'),
  unenrollCourse: courseId => del('/api/student/courses/' + courseId + '/enroll')
}

// 命名导出 - 为了兼容不同的导入方式
export const getCourse = id => get('/api/student/courses/' + id)
export const studentCourseList = () => get('/api/student/courses')
export const getAvailableCourses = () => get('/api/student/courses/available')
export const getEnrolledCourses = () => get('/api/student/courses')
export const enrollCourse = courseId => post('/api/student/courses/' + courseId + '/enroll')
export const unenrollCourse = courseId => del('/api/student/courses/' + courseId + '/enroll')