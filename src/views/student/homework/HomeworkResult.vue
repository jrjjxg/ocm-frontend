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

        <!-- 学生提交的答案 -->
        <div class="student-answer">
          <h4>我的答案：</h4>
          <div class="answer-content">
            <div v-if="result.textAnswer" class="text-answer">
              <h5>文字答案：</h5>
              <div class="answer-text" v-html="result.textAnswer"></div>
            </div>

            <!-- 提交的文件 -->
            <div v-if="result.files && result.files.length > 0" class="submitted-files">
              <h5>提交文件：</h5>
              <div class="files-list">
                <div v-for="file in result.files" :key="file.id" class="file-item">
                  <i class="el-icon-document"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button type="text" @click="downloadFile(file)">下载</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 教师评语 -->
        <div v-if="result.feedback" class="teacher-feedback">
          <h4>教师评语：</h4>
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
import { homeworkDetail, getHomeworkResult } from '@/api/student/homework'

export default {
  name: 'HomeworkResult',
  data() {
    return {
      homework: {},
      result: {},
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

        // 获取作业详情和提交结果
        const [homeworkRes, resultRes] = await Promise.all([
          homeworkDetail(courseId, homeworkId),
          getHomeworkResult(courseId, homeworkId)
        ])

        if (homeworkRes.code === 1) {
          this.homework = homeworkRes.response
        }

        if (resultRes.code === 1) {
          this.result = resultRes.response
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
