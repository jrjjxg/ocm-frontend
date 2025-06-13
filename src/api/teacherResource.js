import { post, get, put, del, form } from '@/utils/request'

// 把所有单独导出的函数改为一个默认导出对象
export default {
  getResources: (courseId, params) => get(`/api/teacher/courses/${courseId}/resources`, params),

  getResource: (courseId, resourceId) => get(`/api/teacher/courses/${courseId}/resources/${resourceId}`),

  createResource: (courseId, data) => post(`/api/teacher/courses/${courseId}/resources`, data),

  updateResource: (courseId, resourceId, data) => put(`/api/teacher/courses/${courseId}/resources/${resourceId}`, data),

  deleteResource: (courseId, resourceId) => post(`/api/teacher/courses/${courseId}/resources/${resourceId}/delete`),

  deleteResourceRestful: (courseId, resourceId) => del(`/api/teacher/courses/${courseId}/resources/${resourceId}`),
  
  uploadResource: (courseId, data) => form(`/api/teacher/course/${courseId}/resource/upload`, data)
} 