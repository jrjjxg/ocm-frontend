import { get, post } from '@/utils/request'

/**
 * 获取学生的测验列表
 */
export function getStudentExams(courseId, params) {
  return get(`/api/student/courses/${courseId}/exams`, params)
}

/**
 * 获取测验详情（学生端）
 */
export function getExamDetail(courseId, examId) {
  return get(`/api/student/courses/${courseId}/exams/${examId}`)
}

/**
 * 开始测验
 */
export function startExam(courseId, examId) {
  return post(`/api/student/courses/${courseId}/exams/${examId}/start`)
}

/**
 * 提交测验答案
 */
export function submitExamAnswer(courseId, examId, data) {
  return post(`/api/student/courses/${courseId}/exams/${examId}/submit`, data)
}

/**
 * 保存测验答案草稿
 */
export function saveExamDraft(courseId, examId, data) {
  return post(`/api/student/courses/${courseId}/exams/${examId}/save`, data)
}

/**
 * 获取测验结果
 */
export function getExamResult(courseId, examId) {
  return get(`/api/student/courses/${courseId}/exams/${examId}/result`)
}

/**
 * 获取学生的答题记录
 */
export function getStudentExamAnswers(courseId, examId) {
  return get(`/api/student/courses/${courseId}/exams/${examId}/answers`)
}

export default {
  getStudentExams,
  getExamDetail,
  startExam,
  submitExamAnswer,
  saveExamDraft,
  getExamResult,
  getStudentExamAnswers
} 