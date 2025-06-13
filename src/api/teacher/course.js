import { get } from '@/utils/request'

// 教师端课程相关API
export const courseListByTeacher = () => {
  return get('/api/teacher/courses')
}

export const getCourseById = (courseId) => {
  if (!courseId || courseId === 'undefined') {
    console.error('Invalid courseId:', courseId)
    return Promise.reject(new Error('无效的课程ID'))
  }
  return get(`/api/teacher/courses/${courseId}`)
}

// 学生管理相关API已移至 teacherCourse.js，此文件专注于课程基本操作

export default {
  courseListByTeacher,
  getCourseById
}