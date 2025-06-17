<template>
  <div class="homework-result-container">
    <!-- 页面头部 -->
    <div class="result-header">
      <el-card shadow="never">
        <div class="header-content">
          <div class="header-left">
            <h2 class="homework-title">{{ homework.title }}</h2>
            <p class="homework-description">{{ homework.description }}</p>
          </div>
          <div class="header-right">
            <div class="score-display">
              <div class="score-number">{{ result.score || 0 }}</div>
              <div class="score-total">/ {{ homework.totalScore || 100 }}</div>
            </div>
            <div class="score-percentage">
              {{ getScorePercentage() }}%
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 作业信息 -->
    <div class="homework-info">
      <el-card shadow="never">
        <div slot="header">
          <span>作业信息</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">提交时间：</span>
              <span class="info-value">{{ result.submitTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">截止时间：</span>
              <span class="info-value">{{ homework.deadline | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">作业状态：</span>
              <el-tag :type="getStatusType(result.status)">{{ getStatusText(result.status) }}</el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 作业内容和答案 -->
    <div class="homework-content">
      <el-card shadow="never">
        <div slot="header">
          <span>作业内容</span>
        </div>

        <!-- 作业要求 -->
        <div class="homework-requirements">
          <h4>作业要求：</h4>
          <div class="requirements-content" v-html="homework.content"></div>
        </div>

        <!-- 附件下载 -->
        <div v-if="homework.attachments && homework.attachments.length > 0" class="homework-attachments">
          <h4>作业附件：</h4>
          <div class="attachments-list">
            <div v-for="attachment in homework.attachments" :key="attachment.id" class="attachment-item">
              <i class="el-icon-document"></i>
              <span class="attachment-name">{{ attachment.name }}</span>
              <el-button type="text" @click="downloadAttachment(attachment)">下载</el-button>
            </div>
          </div>
        </div>

        <!-- 详细答题情况 -->
        <div class="detailed-answers">
          <h4>答题详情：</h4>
          <div v-for="(answerDetail, index) in answerDetails" :key="answerDetail.questionId" class="answer-item">
            <div class="question-header">
              <span class="question-number">第{{ index + 1 }}题</span>
              <el-tag :type="getQuestionTypeTag(answerDetail.questionType)" size="mini">
                {{ getQuestionTypeText(answerDetail.questionType) }}
              </el-tag>
              <span class="question-score">{{ answerDetail.score || 0 }}/{{ answerDetail.questionScore }}分</span>
            </div>

            <!-- 题目内容 -->
            <div class="question-content">
              <div v-if="answerDetail.questionContent" v-html="getQuestionTitle(answerDetail.questionContent)"></div>

              <!-- 显示选择题选项 -->
              <div v-if="getQuestionOptions(answerDetail.questionContent).length > 0" class="question-options">
                <div v-for="(option, optIndex) in getQuestionOptions(answerDetail.questionContent)" :key="optIndex"
                  class="option-item">
                  <span class="option-prefix">{{ option.prefix }}.</span>
                  <span class="option-content" v-html="option.content"></span>
                </div>
              </div>
            </div>

            <!-- 学生答案 -->
            <div class="student-answer-detail">
              <h5>我的答案：</h5>
              <div class="answer-content" :class="getAnswerClass(answerDetail)">
                <span v-if="answerDetail.answer">{{ answerDetail.answer }}</span>
                <span v-else class="no-answer">未答题</span>

                <!-- 客观题结果显示 -->
                <el-tag v-if="[1, 2, 3].includes(answerDetail.questionType) && answerDetail.isCorrect !== null"
                  :type="answerDetail.isCorrect ? 'success' : 'danger'" size="mini" class="answer-result">
                  {{ answerDetail.isCorrect ? '正确' : '错误' }}
                </el-tag>
              </div>
            </div>

            <!-- 教师批改信息（仅主观题或已批改的题目） -->
            <div
              v-if="answerDetail.status >= 3 && ([4, 5].includes(answerDetail.questionType) || answerDetail.feedback)"
              class="teacher-grade">
              <h5>教师批改：</h5>
              <div class="grade-info">
                <div class="grade-score">
                  <span class="label">得分：</span>
                  <span class="score">{{ answerDetail.score || 0 }}/{{ answerDetail.questionScore }}分</span>
                </div>
                <div v-if="answerDetail.feedback" class="grade-feedback">
                  <span class="label">评语：</span>
                  <span class="feedback">{{ answerDetail.feedback }}</span>
                </div>
                <div v-if="answerDetail.gradeTime" class="grade-time">
                  <span class="label">批改时间：</span>
                  <span class="time">{{ answerDetail.gradeTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 整体教师评语 -->
        <div v-if="result.feedback" class="overall-feedback">
          <h4>整体评语：</h4>
          <div class="feedback-content">
            <div class="feedback-text">{{ result.feedback }}</div>
            <div class="feedback-meta">
              <span>评分时间：{{ result.gradeTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="goBack">返回</el-button>
      <el-button v-if="canResubmit" type="primary" @click="resubmit">重新提交</el-button>
    </div>
  </div>
</template>

<script>
import { homeworkDetail, getHomeworkResult, getStudentAnswers } from '@/api/student/homework'

export default {
  name: 'HomeworkResult',
  data() {
    return {
      homework: {},
      result: {},
      answerDetails: [],
      loading: false
    }
  },
  computed: {
    canResubmit() {
      // 根据作业设置和当前时间判断是否可以重新提交
      return this.homework.allowResubmit && new Date() < new Date(this.homework.deadline)
    }
  },
  created() {
    this.loadHomeworkResult()
  },
  methods: {
    async loadHomeworkResult() {
      try {
        this.loading = true
        const homeworkId = this.$route.params.id
        const courseId = this.$route.query.courseId

        if (!courseId) {
          this.$message.error('缺少课程信息')
          return
        }

        // 获取作业详情、提交结果和答题详情
        const [homeworkRes, resultRes, answersRes] = await Promise.all([
          homeworkDetail(courseId, homeworkId),
          getHomeworkResult(courseId, homeworkId),
          getStudentAnswers(courseId, homeworkId)
        ])

        if (homeworkRes.code === 1) {
          this.homework = homeworkRes.response
        }

        if (resultRes.code === 1) {
          this.result = resultRes.response
        }

        if (answersRes.code === 1) {
          this.answerDetails = answersRes.response || []
        }
      } catch (error) {
        this.$message.error('加载作业结果失败')
        console.error('Load homework result error:', error)
      } finally {
        this.loading = false
      }
    },

    getScorePercentage() {
      if (!this.homework.totalScore || !this.result.score) return 0
      return Math.round((this.result.score / this.homework.totalScore) * 100)
    },

    getStatusType(status) {
      const types = {
        'submitted': 'success',
        'graded': 'primary',
        'late': 'warning',
        'draft': 'info'
      }
      return types[status] || 'info'
    },

    getStatusText(status) {
      const texts = {
        'submitted': '已提交',
        'graded': '已批改',
        'late': '迟交',
        'draft': '草稿'
      }
      return texts[status] || '未知'
    },

    downloadAttachment(attachment) {
      // 下载作业附件
      window.open(attachment.url, '_blank')
    },

    downloadFile(file) {
      // 下载提交的文件
      window.open(file.url, '_blank')
    },

    goBack() {
      this.$router.go(-1)
    },

    resubmit() {
      // 跳转到重新提交页面
      this.$router.push({
        path: `/student/homework/${this.homework.id}/submit`,
        query: { courseId: this.$route.query.courseId, resubmit: true }
      })
    },

    getQuestionTypeText(type) {
      const typeMap = {
        1: '单选题',
        2: '多选题',
        3: '判断题',
        4: '填空题',
        5: '问答题'
      }
      return typeMap[type] || '未知类型'
    },

    getQuestionTypeTag(type) {
      const tagMap = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'info',
        5: 'danger'
      }
      return tagMap[type] || 'info'
    },

    getQuestionTitle(questionContent) {
      try {
        const content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent
        return content.titleContent || '题目内容获取失败'
      } catch (e) {
        return questionContent || '题目内容获取失败'
      }
    },

    getQuestionOptions(questionContent) {
      try {
        const content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent
        return content.questionItemObjects || []
      } catch (e) {
        return []
      }
    },

    getAnswerClass(answerDetail) {
      if ([1, 2, 3].includes(answerDetail.questionType) && answerDetail.isCorrect !== null) {
        return answerDetail.isCorrect ? 'correct-answer' : 'wrong-answer'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.homework-result-container {
  padding: 20px;
}

.result-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      .homework-title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .homework-description {
        color: #606266;
        margin: 0;
      }
    }

    .header-right {
      text-align: center;

      .score-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 8px;

        .score-number {
          font-size: 36px;
          font-weight: 700;
          color: #67C23A;
        }

        .score-total {
          font-size: 18px;
          color: #909399;
          margin-left: 4px;
        }
      }

      .score-percentage {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.homework-info {
  margin-bottom: 20px;

  .info-item {
    margin-bottom: 12px;

    .info-label {
      font-weight: 600;
      color: #606266;
    }

    .info-value {
      color: #303133;
    }
  }
}

.homework-content {
  margin-bottom: 20px;

  h4 {
    color: #303133;
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }

  h5 {
    color: #606266;
    margin: 16px 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .requirements-content {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .attachments-list,
  .files-list {

    .attachment-item,
    .file-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      i {
        color: #409EFF;
        margin-right: 8px;
      }

      .attachment-name,
      .file-name {
        flex: 1;
        color: #303133;
      }
    }
  }

  .answer-text {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 4px;
    border-left: 4px solid #409EFF;
  }

  .teacher-feedback {
    margin-top: 20px;

    .feedback-content {
      background: #fff7e6;
      padding: 16px;
      border-radius: 4px;
      border-left: 4px solid #E6A23C;

      .feedback-text {
        color: #303133;
        margin-bottom: 8px;
      }

      .feedback-meta {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.action-buttons {
  text-align: center;
  padding: 20px 0;
}
</style>
