import { post, get, put, del } from '@/utils/request'

export default {
  // 获取课程测验列表
  getExamList: courseId => get(`/api/teacher/courses/${courseId}/exams`),
  
  // 获取单个测验详情
  getExam: (courseId, examId) => get(`/api/teacher/courses/${courseId}/exams/${examId}`),
  
  // 创建新测验
  createExam: (courseId, data) => post(`/api/teacher/courses/${courseId}/exams`, data),
  
  // 更新测验
  updateExam: (courseId, examId, data) => put(`/api/teacher/courses/${courseId}/exams/${examId}`, data),
  
  // 删除测验
  deleteExam: (courseId, examId) => del(`/api/teacher/courses/${courseId}/exams/${examId}`),
  
  // 获取测验成绩
  getExamResults: (courseId, examId) => get(`/api/teacher/courses/${courseId}/exams/${examId}/results`),
  
  // 获取可用试卷列表
  getPaperList: (courseId) => get(`/api/teacher/courses/${courseId}/papers`),
  
  // 题库管理相关API
  // 获取题目分页列表
  getQuestionList: (courseId, query) => post(`/api/teacher/courses/${courseId}/questions`, query),
  
  // 获取题目详情
  getQuestion: (courseId, questionId) => get(`/api/teacher/courses/${courseId}/questions/${questionId}`),
  
  // 创建题目
  createQuestion: (courseId, data) => post(`/api/teacher/courses/${courseId}/questions`, data),
  
  // 更新题目
  updateQuestion: (courseId, questionId, data) => put(`/api/teacher/courses/${courseId}/questions/${questionId}`, data),
  
  // 删除题目
  deleteQuestion: (courseId, questionId) => del(`/api/teacher/courses/${courseId}/questions/${questionId}`),
  
  // 试卷管理相关API
  // 获取试卷分页列表
  getPaperPage: (courseId, query) => post(`/api/teacher/courses/${courseId}/papers/page`, query),
  
  // 创建试卷
  createPaper: (courseId, data) => post(`/api/teacher/courses/${courseId}/papers`, data),
  
  // 更新试卷
  updatePaper: (courseId, paperId, data) => put(`/api/teacher/courses/${courseId}/papers/${paperId}`, data),
  
  // 获取试卷详情
  selectPaper: (courseId, paperId) => get(`/api/teacher/courses/${courseId}/papers/${paperId}`),
  
  // 删除试卷
  deletePaper: (courseId, paperId) => del(`/api/teacher/courses/${courseId}/papers/${paperId}`),
  
  // 获取测验答卷列表
  getExamAnswers: (courseId, examId, query) => post(`/api/teacher/courses/${courseId}/exams/${examId}/answers`, query),
  
  // 获取单个答卷信息
  getAnswerInfo: (courseId, examId, answerId) => get(`/api/teacher/courses/${courseId}/exams/${examId}/answers/${answerId}`),
  
  // 评阅测验答卷
  evaluateAnswer: (courseId, examId, answerId, data) => put(`/api/teacher/courses/${courseId}/exams/${examId}/answers/${answerId}`, data),
  
  // 获取成绩统计数据
  getStatistics: (courseId, examId) => get(`/api/teacher/courses/${courseId}/exams/${examId}/statistics`)
} 