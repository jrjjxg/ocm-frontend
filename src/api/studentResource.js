import { post } from '@/utils/request'

export default {
  // 学生资源管理
  getResourcesByCourse: courseId => post(`/api/student/course/resources/${courseId}`)
} 