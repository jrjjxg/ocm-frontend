import { get, post, put, delete as deleteMethod } from '@/utils/request'

export function getAssignmentsByCourse(courseId) {
  return get(`/api/teacher/assignment/course/${courseId}`)
}

export function createAssignment(data) {
  return post('/api/teacher/assignment/create', data)
}

export function updateAssignment(id, data) {
  return put(`/api/teacher/assignment/${id}`, data)
}

export function deleteAssignment(id) {
  return deleteMethod(`/api/teacher/assignment/${id}`)
}

export function getAssignmentSubmissions(assignmentId) {
  return get(`/api/teacher/assignment/${assignmentId}/submissions`)
}

export function gradeSubmission(submissionId, data) {
  return put(`/api/teacher/assignment/submission/${submissionId}/grade`, data)
} 