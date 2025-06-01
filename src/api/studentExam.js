import { post, get } from '@/utils/request'

export default {
  getCourseExams: (courseId) => get(`/api/student/course/${courseId}/exams`),
  
  getExamDetail: (courseId, examId) => get(`/api/student/course/${courseId}/exam/${examId}`),
  
  startExam: (courseId, examId) => post(`/api/student/course/${courseId}/exam/${examId}/start`),
  
  submitExam: (courseId, examId, data) => post(`/api/student/course/${courseId}/exam/${examId}/submit`, data),
  
  getExamResult: (courseId, examId) => get(`/api/student/course/${courseId}/exam/${examId}/result`)
}
 