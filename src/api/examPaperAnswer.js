import { post, get } from '@/utils/request'

export default {
  /**
   * 学生端 - 获取答卷详情
   * @param {number} answerId 答卷ID
   * @returns {Promise} 答卷详情
   */
  getAnswerDetail: (answerId) => {
    return get(`/api/student/exam/answer/${answerId}`)
  },

  /**
   * 学生端 - 提交答卷
   * @param {object} answerData 答卷数据
   * @returns {Promise} 提交结果
   */
  submitAnswer: (answerData) => {
    return post('/api/student/exam/answer/submit', answerData)
  },

  /**
   * 学生端 - 保存答题草稿
   * @param {object} draftData 草稿数据
   * @returns {Promise} 保存结果
   */
  saveDraft: (draftData) => {
    return post('/api/student/exam/answer/draft', draftData)
  },

  /**
   * 教师端 - 获取答卷列表
   * @param {object} query 查询参数
   * @returns {Promise} 答卷列表
   */
  getAnswerList: (query) => {
    return post('/api/teacher/exam/answer/list', query)
  },

  /**
   * 教师端 - 批改答卷
   * @param {number} answerId 答卷ID
   * @param {object} gradeData 批改数据
   * @returns {Promise} 批改结果
   */
  gradeAnswer: (answerId, gradeData) => {
    return post(`/api/teacher/exam/answer/${answerId}/grade`, gradeData)
  },

  /**
   * 管理员端 - 分页查询答卷
   * @param {object} query 查询参数
   * @returns {Promise} 分页结果
   */
  pageList: (query) => {
    return post('/api/admin/exam/answer/page', query)
  },

  /**
   * 管理员端 - 删除答卷
   * @param {number} answerId 答卷ID
   * @returns {Promise} 删除结果
   */
  deleteAnswer: (answerId) => {
    return post(`/api/admin/exam/answer/delete/${answerId}`)
  },

  /**
   * 获取答卷统计信息
   * @param {object} query 查询参数
   * @returns {Promise} 统计结果
   */
  getStatistics: (query) => {
    return post('/api/admin/exam/answer/statistics', query)
  }
}
