import { post } from '@/utils/request'

export default {
  // 学生课程管理
  getAvailableCourses: () => post('/api/student/course/available'),
  getEnrolledCourses: () => post('/api/student/course/list'),
  getCourse: id => post('/api/student/course/select/' + id),
  enrollCourse: courseId => post('/api/student/course/enroll/' + courseId),
  unenrollCourse: courseId => post('/api/student/course/unenroll/' + courseId)
} 