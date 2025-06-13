import { get, post, put, del } from '@/utils/request'

// 学生端API (使用RESTful风格，与后端实际API保持一致)
export const studentDiscussionApi = {
  // 获取课程讨论列表
  getDiscussionList(courseId, params = {}) {
    return get(`/api/student/courses/${courseId}/discussions`, params)
  },

  // 创建讨论主题
  createDiscussion(courseId, data) {
    return post(`/api/student/courses/${courseId}/discussions`, data)
  },

  // 获取讨论详情
  getDiscussionDetail(discussionId) {
    return get(`/api/student/detail/${discussionId}`)
  },

  // 更新讨论
  updateDiscussion(discussionId, data) {
    return put(`/api/student/update/${discussionId}`, data)
  },

  // 删除讨论
  deleteDiscussion(discussionId) {
    return del(`/api/student/delete/${discussionId}`)
  },

  // 获取置顶讨论
  getTopDiscussions(courseId) {
    return get(`/api/student/courses/${courseId}/discussions/top`)
  },

  // 获取精华讨论
  getEssenceDiscussions(courseId) {
    return get(`/api/student/courses/${courseId}/discussions/essence`)
  },

  // 获取讨论回复列表
  getReplies(discussionId, params = {}) {
    return get(`/api/student/replies/${discussionId}`, params)
  },

  // 创建回复
  createReply(data) {
    return post(`/api/student/reply`, data)
  },

  // 删除回复
  deleteReply(replyId) {
    return del(`/api/student/reply/${replyId}`)
  }
}

// 教师端API (使用传统风格，与后端实际API保持一致)
export const teacherDiscussionApi = {
  // 获取课程讨论列表
  getDiscussionList(courseId, params = {}) {
    return get(`/api/teacher/list/${courseId}`, params)
  },

  // 创建讨论主题
  createDiscussion(data) {
    return post(`/api/teacher/create`, data)
  },

  // 获取讨论详情
  getDiscussionDetail(discussionId) {
    return get(`/api/teacher/detail/${discussionId}`)
  },

  // 更新讨论
  updateDiscussion(discussionId, data) {
    return put(`/api/teacher/update/${discussionId}`, data)
  },

  // 删除讨论
  deleteDiscussion(discussionId) {
    return del(`/api/teacher/delete/${discussionId}`)
  },

  // 置顶/取消置顶讨论
  toggleTop(discussionId) {
    return post(`/api/teacher/toggle-top/${discussionId}`)
  },

  // 设置/取消精华讨论
  toggleEssence(discussionId) {
    return post(`/api/teacher/toggle-essence/${discussionId}`)
  },

  // 获取置顶讨论
  getTopDiscussions(courseId) {
    return get(`/api/teacher/top/${courseId}`)
  },

  // 获取精华讨论
  getEssenceDiscussions(courseId) {
    return get(`/api/teacher/essence/${courseId}`)
  },

  // 获取讨论回复列表
  getReplies(discussionId, params = {}) {
    return get(`/api/teacher/replies/${discussionId}`, params)
  },

  // 创建回复
  createReply(data) {
    return post(`/api/teacher/reply`, data)
  },

  // 删除回复
  deleteReply(replyId) {
    return del(`/api/teacher/reply/${replyId}`)
  }
}