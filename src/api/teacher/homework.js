import { get, post, put, del } from '@/utils/request'

/**
 * 获取课程作业列表 (RESTful风格 - 使用GET方法)
 */
export function homeworkPage(courseId, params = {}) {
  return get(`/api/teacher/courses/${courseId}/homework`, params)
}

/**
 * 创建课程作业 (RESTful风格)
 */
export function homeworkCreate(courseId, data) {
  return post(`/api/teacher/courses/${courseId}/homework`, data)
}

/**
 * 获取课程作业详情 (RESTful风格)
 */
export function homeworkDetail(courseId, homeworkId) {
  return get(`/api/teacher/courses/${courseId}/homework/${homeworkId}`)
}

/**
 * 更新课程作业 (RESTful风格)
 */
export function homeworkUpdate(courseId, homeworkId, data) {
  return put(`/api/teacher/courses/${courseId}/homework/${homeworkId}`, data)
}

/**
 * 获取课程作业题目列表 (RESTful风格)
 */
export function homeworkQuestions(courseId, homeworkId) {
  return get(`/api/teacher/courses/${courseId}/homework/${homeworkId}/questions`)
}

/**
 * 发布课程作业 (RESTful风格)
 */
export function homeworkPublish(courseId, homeworkId) {
  return post(`/api/teacher/courses/${courseId}/homework/${homeworkId}/publish`)
}

/**
 * 结束课程作业 (RESTful风格)
 */
export function homeworkEnd(courseId, homeworkId) {
  return post(`/api/teacher/courses/${courseId}/homework/${homeworkId}/end`)
}

/**
 * 删除课程作业 (RESTful风格)
 */
export function homeworkDelete(courseId, homeworkId) {
  return del(`/api/teacher/courses/${courseId}/homework/${homeworkId}`)
}

/**
 * 获取课程作业统计信息 (RESTful风格)
 */
export function homeworkStatistics(courseId, homeworkId) {
  return get(`/api/teacher/courses/${courseId}/homework/${homeworkId}/statistics`)
}

/**
 * 获取仪表板统计数据 (保持原有路径，因为这是全局统计)
 */
export function homeworkDashboardStatistics() {
  return get('/api/teacher/homework/dashboard/statistics')
}

/**
 * 分页查询待批改作业 (保持原有路径，因为这是跨课程查询)
 */
export function homeworkPendingPage(params) {
  return post('/api/teacher/homework/pending/page', params)
}

/**
 * 获取学生作业答题情况 (RESTful风格)
 */
export function homeworkStudentAnswers(courseId, homeworkId, studentId) {
  return get(`/api/teacher/courses/${courseId}/homework/${homeworkId}/students/${studentId}/answers`)
}

/**
 * 获取作业的学生提交列表 (RESTful风格)
 */
export function homeworkSubmissions(courseId, homeworkId, params = {}) {
  return get(`/api/teacher/courses/${courseId}/homework/${homeworkId}/submissions`, params)
}

// 为了向后兼容，保留旧版本函数但使用新的RESTful接口
// 注意：这些函数需要courseId参数，调用时需要传入
export function homeworkPageLegacy(params) {
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return homeworkPage(params.courseId, params)
}

export function homeworkCreateLegacy(data) {
  if (!data.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return homeworkCreate(data.courseId, data)
}

export function homeworkDetailLegacy(id, courseId) {
  if (!courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return homeworkDetail(courseId, id)
}

/**
 * 人工评分 (旧版本API，保持向后兼容)
 */
export function homeworkManualGrade(answerId, data) {
  return post(`/api/teacher/homework/answer/${answerId}/grade`, data)
}

/**
 * 批改学生作业 (RESTful风格)
 */
export function homeworkGradeStudent(courseId, homeworkId, studentId, data) {
  return post(`/api/teacher/courses/${courseId}/homework/${homeworkId}/students/${studentId}/grade`, data)
}

export default {
  homeworkPage,
  homeworkCreate,
  homeworkDetail,
  homeworkUpdate,
  homeworkQuestions,
  homeworkPublish,
  homeworkEnd,
  homeworkDelete,
  homeworkStatistics,
  homeworkDashboardStatistics,
  homeworkPendingPage,
  homeworkStudentAnswers,
  homeworkManualGrade,
  homeworkGradeStudent,
  homeworkSubmissions
} 