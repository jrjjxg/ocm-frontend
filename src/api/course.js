import { post, get, put, del } from '@/utils/request'

export default {
  // 课程基本管理 (RESTful风格)
  getCoursePageList: query => post('/api/admin/course/page/list', query),
  createCourse: query => post('/api/admin/course/edit', query),
  getCourse: id => get('/api/admin/course/select/' + id),
  changeStatus: id => put('/api/admin/course/changeStatus/' + id),
  deleteCourse: id => del('/api/admin/course/delete/' + id),

  // 课程-教师关联管理 (RESTful风格)
  getCourseTeachers: courseId => get('/api/admin/course/' + courseId + '/teachers'),
  assignTeacher: query => post('/api/admin/course/teacher/assign', query),
  revokeTeacher: query => post('/api/admin/course/teacher/revoke', query),

  // 课程-学生关联管理 (RESTful风格)
  getCourseStudents: courseId => get('/api/admin/course/' + courseId + '/students'),
  enrollStudent: query => post('/api/admin/course/student/enroll', query),
  unenrollStudent: query => post('/api/admin/course/student/unenroll', query)
}

// 获取当前教师的课程列表
export function getTeacherCourses() {
  return get('/api/teacher/courses')
}

// 获取所有课程列表 (通常用于管理员)
export function getAllCourses(params) {
  return get('/api/education/course/list', params)
} 