import { post, get, form } from '@/utils/request'

export default {
  getCourseStudents: (courseId, params) => get(`/api/teacher/course/${courseId}/students`, params),
  
  addStudentToCourse: (courseId, data) => post(`/api/teacher/course/${courseId}/student/add`, data),
  
  removeStudentFromCourse: (courseId, studentId) => post(`/api/teacher/course/${courseId}/student/${studentId}/remove`),
  
  importStudents: (courseId, data) => form(`/api/teacher/course/${courseId}/students/import`, data)
} 