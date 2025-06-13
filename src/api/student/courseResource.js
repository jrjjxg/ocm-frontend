import { get, post } from '@/utils/request'

/**
 * 获取课程资源列表
 */
export function getCourseResources(courseId, params) {
  return post(`/api/student/courses/${courseId}/resources`, params)
}

/**
 * 下载课程资源
 */
export function downloadResource(courseId, resourceId) {
  return post(`/api/student/courses/${courseId}/resources/${resourceId}/download`)
}

/**
 * 预览课程资源
 */
export function previewResource(courseId, resourceId) {
  return get(`/api/student/courses/${courseId}/resources/${resourceId}/preview`)
}

/**
 * 切换资源收藏状态
 */
export function toggleResourceFavorite(courseId, resourceId) {
  return post(`/api/student/courses/${courseId}/resources/${resourceId}/favorite`)
}

/**
 * 获取学生收藏的资源
 */
export function getFavoriteResources(courseId, params) {
  return post(`/api/student/courses/${courseId}/resources/favorites`, params)
}

export default {
  getCourseResources,
  downloadResource,
  previewResource,
  toggleResourceFavorite,
  getFavoriteResources
} 