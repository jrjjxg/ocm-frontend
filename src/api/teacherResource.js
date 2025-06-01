import { post, get, put, delete as del, form } from '@/utils/request'

// 把所有单独导出的函数改为一个默认导出对象
export default {
  getResources: (courseId, params) => get(`/api/teacher/course/${courseId}/resources`, params),
  
  getResource: (courseId, resourceId) => get(`/api/teacher/course/${courseId}/resource/${resourceId}`),
  
  createResource: (courseId, data) => post(`/api/teacher/course/${courseId}/resource/create`, data),
  
  updateResource: (courseId, resourceId, data) => put(`/api/teacher/course/${courseId}/resource/${resourceId}`, data),
  
  deleteResource: (courseId, resourceId) => post(`/api/teacher/course/${courseId}/resource/${resourceId}/delete`),
  
  deleteResourceRestful: (courseId, resourceId) => del(`/api/teacher/course/${courseId}/resource/${resourceId}`),
  
  uploadResource: (courseId, data) => form(`/api/teacher/course/${courseId}/resource/upload`, data)
} 