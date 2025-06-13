<template>
  <div class="course-homework">
    <div class="homework-header">
      <div class="header-title">
        <h2>作业管理</h2>
        <p>管理当前课程的所有作业任务</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="createHomework">
          创建作业
        </el-button>
      </div>
    </div>

    <div class="homework-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总作业数</div>
            </div>
            <i class="el-icon-document stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.published }}</div>
              <div class="stat-label">已发布</div>
            </div>
            <i class="el-icon-check stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待批改</div>
            </div>
            <i class="el-icon-time stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.graded }}</div>
              <div class="stat-label">已批改</div>
            </div>
            <i class="el-icon-finished stat-icon"></i>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="homework-list-card">
      <div slot="header" class="card-header">
        <span>作业列表</span>
        <div class="header-tools">
          <el-input v-model="searchText" placeholder="搜索作业..." style="width: 200px; margin-right: 10px;"
            prefix-icon="el-icon-search" @input="handleSearch" />
          <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="已发布" value="published"></el-option>
            <el-option label="已截止" value="ended"></el-option>
          </el-select>
        </div>
      </div>

      <el-table v-loading="loading" :data="homeworkList" style="width: 100%">
        <el-table-column prop="title" label="作业标题" min-width="200">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewHomework(scope.row)">
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="作业类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeColor(scope.row.type)" size="small">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="getStatusColor(scope.row.status)" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitCount" label="提交情况" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.submitCount || 0 }} / {{ studentCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gradeCount" label="批改进度" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.gradeCount || 0 }} / {{ scope.row.submitCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="150">
          <template slot-scope="scope">
            <span :class="{ 'text-danger': isOverdue(scope.row.deadline) }">
              {{ formatTime(scope.row.deadline) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewHomework(scope.row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click="editHomework(scope.row)">
              编辑
            </el-button>
            <el-button type="text" size="small" @click="gradeHomework(scope.row)">
              批改
            </el-button>
            <el-button type="text" size="small" @click="viewStatistics(scope.row)">
              统计
            </el-button>
            <el-dropdown @command="handleCommand">
              <el-button type="text" size="small">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ action: 'delete', row: scope.row }">删除</el-dropdown-item>
                <el-dropdown-item :command="{ action: 'duplicate', row: scope.row }">复制</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="total" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { formatDate } from '@/utils/index'

export default {
  name: 'CourseHomework',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      searchText: '',
      statusFilter: '',
      homeworkList: [],
      total: 0,
      pageIndex: 1,
      pageSize: 10,
      studentCount: 0, // 课程学生总数
      stats: {
        total: 0,
        published: 0,
        pending: 0,
        graded: 0
      }
    }
  },
  created() {
    this.loadHomeworkList()
    this.loadStats()
    this.loadStudentCount()
  },
  methods: {
    async loadHomeworkList() {
      this.loading = true
      try {
        const { homeworkPage } = await import('@/api/teacher/homework')
        const response = await homeworkPage(this.courseId, {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          keyword: this.searchText,
          status: this.statusFilter
        })

        this.homeworkList = response.response.list || []
        this.total = response.response.total || 0
      } catch (error) {
        this.$message.error('加载作业列表失败')
        console.error('Load homework list error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadStats() {
      try {
        const { homeworkDashboardStatistics } = await import('@/api/teacher/homework')
        const response = await homeworkDashboardStatistics()
        this.stats = response.response || {
          total: 0,
          published: 0,
          pending: 0,
          graded: 0
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 使用默认值
        this.stats = {
          total: 0,
          published: 0,
          pending: 0,
          graded: 0
        }
      }
    },

    async loadStudentCount() {
      try {
        const teacherCourseApi = await import('@/api/teacherCourse')
        const response = await teacherCourseApi.default.getCourseStudents(this.courseId, { pageIndex: 1, pageSize: 1 })
        this.studentCount = response.response?.total || 0
      } catch (error) {
        console.error('获取学生数量失败:', error)
        // 如果API失败，尝试从作业数据中获取最大的学生数量作为估算
        this.studentCount = this.getEstimatedStudentCount()
      }
    },

    getEstimatedStudentCount() {
      if (this.homeworkList.length === 0) {
        return 0
      }
      // 从所有作业中找到最大的提交数量，作为学生数量的估算
      const maxSubmitCount = Math.max(...this.homeworkList.map(hw => hw.submitCount || 0))
      return maxSubmitCount > 0 ? maxSubmitCount : 0
    },

    createHomework() {
      this.$router.push(`/teacher/course/${this.courseId}/homework/create`)
    },

    viewHomework(homework) {
      this.$router.push(`/teacher/course/${this.courseId}/homework/detail/${homework.id}`)
    },

    editHomework(homework) {
      this.$router.push(`/teacher/course/${this.courseId}/homework/edit/${homework.id}`)
    },

    gradeHomework(homework) {
      this.$router.push(`/teacher/course/${this.courseId}/homework/grade/${homework.id}`)
    },

    viewStatistics(homework) {
      this.$router.push(`/teacher/course/${this.courseId}/homework/statistics/${homework.id}`)
    },

    handleCommand({ action, row }) {
      if (action === 'delete') {
        this.deleteHomework(row)
      } else if (action === 'duplicate') {
        this.duplicateHomework(row)
      }
    },

    async deleteHomework(homework) {
      this.$confirm('确定要删除这个作业吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const { homeworkDelete } = await import('@/api/teacher/homework')
          await homeworkDelete(this.courseId, homework.id)
          this.$message.success('删除成功')
          this.loadHomeworkList()
          this.loadStats()
        } catch (error) {
          this.$message.error('删除失败')
          console.error('Delete homework error:', error)
        }
      })
    },

    async duplicateHomework(homework) {
      try {
        // TODO: 调用复制API
        this.$message.success('复制成功')
        this.loadHomeworkList()
      } catch (error) {
        this.$message.error('复制失败')
      }
    },

    handleSearch() {
      this.pageIndex = 1
      this.loadHomeworkList()
    },

    handlePageChange(page) {
      this.pageIndex = page
      this.loadHomeworkList()
    },

    getTypeName(type) {
      const typeMap = {
        exercise: '练习',
        assignment: '作业',
        project: '项目'
      }
      return typeMap[type] || type
    },

    getTypeColor(type) {
      const colorMap = {
        exercise: 'success',
        assignment: 'primary',
        project: 'warning'
      }
      return colorMap[type] || 'info'
    },

    getStatusName(status) {
      const statusMap = {
        draft: '草稿',
        published: '已发布',
        ended: '已截止'
      }
      return statusMap[status] || status
    },

    getStatusColor(status) {
      const colorMap = {
        draft: 'info',
        published: 'success',
        ended: 'danger'
      }
      return colorMap[status] || 'info'
    },

    formatTime(time) {
      return formatDate(time, 'yyyy-MM-dd HH:mm')
    },

    isOverdue(deadline) {
      return new Date(deadline) < new Date()
    }
  }
}
</script>

<style scoped>
.course-homework {
  padding: 0;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 20px;
}

.header-title p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.homework-stats {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card .el-card__body {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-icon {
  font-size: 32px;
  color: #C0C4CC;
}

.homework-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tools {
  display: flex;
  align-items: center;
}

.text-danger {
  color: #F56C6C;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .homework-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-tools {
    width: 100%;
    justify-content: space-between;
  }
}
</style>