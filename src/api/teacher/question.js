import { post, get, put, del } from '@/utils/request'

// 教师端题目相关API
export const questionPage = (params) => {
  return post('/api/teacher/question/page', params)
}

/**
 * 根据课程ID分页查询题目列表 (RESTful风格)
 */
export const courseQuestionPage = (courseId, params) => {
  return post(`/api/teacher/courses/${courseId}/questions`, params)
}

export const getQuestionById = (questionId) => {
  if (!questionId || questionId === 'undefined') {
    console.error('Invalid questionId:', questionId)
    return Promise.reject(new Error('无效的题目ID'))
  }
  return get(`/api/teacher/question/${questionId}`)
}

/**
 * 根据课程获取题目详情 (RESTful风格)
 */
export const getCourseQuestionById = (courseId, questionId) => {
  if (!courseId || !questionId || courseId === 'undefined' || questionId === 'undefined') {
    console.error('Invalid courseId or questionId:', courseId, questionId)
    return Promise.reject(new Error('无效的课程ID或题目ID'))
  }
  return post(`/api/teacher/courses/${courseId}/questions/${questionId}`)
}

export const createQuestion = (data) => {
  return post('/api/teacher/question/create', data)
}

/**
 * 创建课程题目 (RESTful风格)
 */
export const createCourseQuestion = (courseId, data) => {
  return post(`/api/teacher/courses/${courseId}/questions/edit`, data)
}

export const updateQuestion = (data) => {
  return put('/api/teacher/question/update', data)
}

/**
 * 更新课程题目 (RESTful风格)
 */
export const updateCourseQuestion = (courseId, data) => {
  return post(`/api/teacher/courses/${courseId}/questions/edit`, data)
}

export const deleteQuestion = (questionId) => {
  if (!questionId || questionId === 'undefined') {
    console.error('Invalid questionId:', questionId)
    return Promise.reject(new Error('无效的题目ID'))
  }
  return del(`/api/teacher/question/${questionId}`)
}

/**
 * 删除课程题目 (RESTful风格)
 */
export const deleteCourseQuestion = (courseId, questionId) => {
  return post(`/api/teacher/courses/${courseId}/questions/${questionId}/delete`)
}



export default {
  questionPage,
  courseQuestionPage,
  getQuestionById,
  getCourseQuestionById,
  createQuestion,
  createCourseQuestion,
  updateQuestion,
  updateCourseQuestion,
  deleteQuestion,
  deleteCourseQuestion
} 