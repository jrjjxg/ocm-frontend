import { post, get } from '@/utils/request'

export default {
  getCourseExams: (courseId) => get(`/api/student/courses/${courseId}/exams`),

  getExamDetail: (courseId, examId) => get(`/api/student/courses/${courseId}/exams/${examId}`),

  startExam: (courseId, examId) => post(`/api/student/courses/${courseId}/exams/${examId}/start`),

  submitExam: (courseId, examId, data) => post(`/api/student/courses/${courseId}/exams/${examId}/submit`, data),

  getExamResult: (courseId, examId) => get(`/api/student/courses/${courseId}/exams/${examId}/result`)
}
 