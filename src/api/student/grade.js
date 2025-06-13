import { get, post } from '@/utils/request'

/**
 * 获取学生的课程成绩统计
 */
export function getStudentGrades(courseId) {
  return get(`/api/student/courses/${courseId}/grades`)
}

/**
 * 获取学生的作业成绩列表
 */
export function getStudentHomeworkGrades(courseId, params) {
  return post(`/api/student/courses/${courseId}/homework/grades`, params)
}

/**
 * 获取学生的测验成绩列表
 */
export function getStudentExamGrades(courseId, params) {
  return post(`/api/student/courses/${courseId}/exam/grades`, params)
}

/**
 * 获取学生的成绩排名
 */
export function getStudentRanking(courseId) {
  return get(`/api/student/courses/${courseId}/ranking`)
}

/**
 * 获取班级成绩统计
 */
export function getClassGradeStats(courseId) {
  return get(`/api/student/courses/${courseId}/class-stats`)
}

export default {
  getStudentGrades,
  getStudentHomeworkGrades,
  getStudentExamGrades,
  getStudentRanking,
  getClassGradeStats
} 