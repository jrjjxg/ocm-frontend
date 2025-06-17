import { get, post } from '@/utils/request'

/**
 * 获取学生的课程作业列表 (RESTful风格)
 */
export function studentHomeworkList(courseId, params) {
  return get(`/api/student/courses/${courseId}/homework`, params)
}

/**
 * 获取作业详情（学生端）(RESTful风格)
 */
export function homeworkDetail(courseId, homeworkId) {
  return get(`/api/student/courses/${courseId}/homework/${homeworkId}`)
}

/**
 * 开始作业 (RESTful风格)
 */
export function startHomework(courseId, homeworkId) {
  return post(`/api/student/courses/${courseId}/homework/${homeworkId}/start`)
}

/**
 * 提交作业答案 (RESTful风格)
 */
export function submitHomeworkAnswer(data) {
  // 新的提交方式，直接使用payload
  if (data && data.homeworkId) {
    return post(`/api/student/task/submit`, data)
  }
  // 兼容旧的调用方式
  const [courseId, homeworkId, payload] = arguments
  return post(`/api/student/courses/${courseId}/homework/${homeworkId}/submit`, payload)
}

/**
 * 提交作业答案 - 新版本
 * @param {object} data - 包含作业ID和答案的payload
 */
export function submitTaskAnswer(data) {
  return post(`/api/student/task/submit`, data)
}

/**
 * 保存作业草稿 (RESTful风格)
 */
export function saveHomeworkDraft(courseId, homeworkId, data) {
  return post(`/api/student/courses/${courseId}/homework/${homeworkId}/save`, data)
}

/**
 * 获取作业结果 (RESTful风格)
 */
export function getHomeworkResult(courseId, homeworkId) {
  return get(`/api/student/courses/${courseId}/homework/${homeworkId}/result`)
}

/**
 * 获取学生的答题记录 (RESTful风格)
 */
export function getStudentAnswers(courseId, homeworkId) {
  return get(`/api/student/courses/${courseId}/homework/${homeworkId}/answers`)
}

// 为了向后兼容，保留旧版本函数名但使用新的RESTful接口
// 注意：这些函数需要courseId参数，调用时需要传入
export function studentHomeworkListLegacy(params) {
  // 这个函数需要courseId，如果没有提供则返回错误
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return studentHomeworkList(params.courseId, params)
}

export default {
  studentHomeworkList,
  homeworkDetail,
  startHomework,
  submitHomeworkAnswer,
  submitTaskAnswer,
  saveHomeworkDraft,
  getHomeworkResult,
  getStudentAnswers,
  // 向后兼容
  studentHomeworkListLegacy
}