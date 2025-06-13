import { post, get, put, del } from '@/utils/request'

// 学生端资源API
export default {
  // 获取课程资源列表
  getResources: (courseId, params) => get(`/api/student/courses/${courseId}/resources`, params),

  // 获取单个资源详情
  getResource: (courseId, resourceId) => get(`/api/student/courses/${courseId}/resources/${resourceId}`),

  // 下载资源
  downloadResource: (courseId, resourceId) => get(`/api/student/courses/${courseId}/resources/${resourceId}/download`),

  // 预览资源
  previewResource: (courseId, resourceId) => get(`/api/student/courses/${courseId}/resources/${resourceId}/preview`),

  // 收藏/取消收藏资源
  toggleFavorite: (courseId, resourceId) => post(`/api/student/courses/${courseId}/resources/${resourceId}/favorite`),

  // 获取收藏的资源
  getFavorites: (courseId, params) => get(`/api/student/courses/${courseId}/resources/favorites`, params),

  // 兼容旧版API
  getResourcesByCourse: courseId => post(`/api/student/courses/${courseId}/resources`)
}