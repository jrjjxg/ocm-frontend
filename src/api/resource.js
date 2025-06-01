import { get, post, form, put, delete as deleteMethod } from '@/utils/request'

export function getResourceByCourse(courseId) {
  return get(`/api/teacher/course/${courseId}/resources`)
}

// uploadResource 的实现比较特殊，因为它通常由 <el-upload> 组件直接调用其 action URL
// 但如果需要手动触发或传递复杂数据，可以这样封装
export function uploadResource(data) {
  // data 通常是一个 FormData 对象
  return form('/api/teacher/resource/upload', data)
}

export function updateResource(id, data) {
  return put(`/api/teacher/resource/${id}`, data)
}

export function deleteResource(id) {
  return deleteMethod(`/api/teacher/resource/${id}`)
} 