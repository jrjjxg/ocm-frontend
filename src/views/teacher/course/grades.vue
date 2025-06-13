<template>
  <div class="course-grades">
    <div class="grades-header">
      <div class="header-title">
        <h2>成绩统计</h2>
        <p>查看和分析课程的综合成绩数据</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-download" @click="exportGrades">
          导出成绩
        </el-button>
        <el-button icon="el-icon-refresh" @click="refreshData">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 成绩概览统计 -->
    <div class="grades-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-number">{{ overview.totalStudents }}</div>
              <div class="overview-label">总学生数</div>
            </div>
            <i class="el-icon-user-solid overview-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-number">{{ overview.avgScore }}</div>
              <div class="overview-label">平均分</div>
            </div>
            <i class="el-icon-trophy overview-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-number">{{ overview.passRate }}%</div>
              <div class="overview-label">及格率</div>
            </div>
            <i class="el-icon-check overview-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-number">{{ overview.excellentRate }}%</div>
              <div class="overview-label">优秀率</div>
            </div>
            <i class="el-icon-star-on overview-icon"></i>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 成绩分布图表 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">
            <span>成绩分布</span>
          </div>
          <div id="scoreDistributionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">
            <span>各项任务平均分</span>
          </div>
          <div id="taskScoreChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成绩列表 -->
    <el-card class="grades-table-card">
      <div slot="header" class="card-header">
        <span>学生成绩详情</span>
        <div class="header-tools">
          <el-input v-model="searchText" placeholder="搜索学生..." style="width: 200px; margin-right: 10px;"
            prefix-icon="el-icon-search" @input="handleSearch" />
          <el-select v-model="gradeFilter" placeholder="成绩筛选" style="width: 120px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="优秀" value="excellent"></el-option>
            <el-option label="良好" value="good"></el-option>
            <el-option label="及格" value="pass"></el-option>
            <el-option label="不及格" value="fail"></el-option>
          </el-select>
        </div>
      </div>

      <el-table v-loading="loading" :data="gradesList" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" fixed="left" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column v-for="task in taskColumns" :key="task.key" :prop="task.key" :label="task.label" width="80"
          align="center">
          <template slot-scope="scope">
            <span :class="getScoreClass(scope.row[task.key])">
              {{ scope.row[task.key] || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" width="80" align="center">
          <template slot-scope="scope">
            <strong :class="getScoreClass(scope.row.totalScore)">
              {{ scope.row.totalScore || 0 }}
            </strong>
          </template>
        </el-table-column>
        <el-table-column prop="gradeLevel" label="等级" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="getGradeLevelColor(scope.row.gradeLevel)" size="small">
              {{ scope.row.gradeLevel || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80" align="center" />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewStudentDetail(scope.row)">
              详情
            </el-button>
            <el-button type="text" size="small" @click="adjustScore(scope.row)">
              调分
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="total" />
      </div>
    </el-card>

    <!-- 调分对话框 -->
    <el-dialog title="成绩调整" :visible.sync="adjustDialog.visible" width="600px">
      <el-form :model="adjustDialog.form" label-width="100px">
        <el-form-item label="学生姓名">
          <span>{{ adjustDialog.form.studentName }}</span>
        </el-form-item>
        <el-form-item label="调整项目">
          <el-select v-model="adjustDialog.form.taskType" placeholder="选择调整项目">
            <el-option v-for="task in taskColumns" :key="task.key" :label="task.label" :value="task.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="原始分数">
          <span>{{ adjustDialog.form.originalScore }}</span>
        </el-form-item>
        <el-form-item label="调整后分数">
          <el-input-number v-model="adjustDialog.form.newScore" :min="0" :max="100" placeholder="请输入新分数" />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input type="textarea" v-model="adjustDialog.form.reason" placeholder="请输入调整原因" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="adjustDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdjustScore">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { formatDate } from '@/utils/index'
import teacherCourseApi from '@/api/teacherCourse'

export default {
  name: 'CourseGrades',
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
      gradeFilter: '',
      gradesList: [],
      total: 0,
      pageIndex: 1,
      pageSize: 20,
      overview: {
        totalStudents: 0,
        avgScore: 0,
        passRate: 0,
        excellentRate: 0
      },
      taskColumns: [],
      adjustDialog: {
        visible: false,
        form: {
          studentId: null,
          studentName: '',
          taskType: '',
          originalScore: 0,
          newScore: 0,
          reason: ''
        }
      },
      charts: {
        scoreDistribution: null,
        taskScore: null
      }
    }
  },
  created() {
    this.loadGradesData()
    this.loadTaskColumns()
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.charts.scoreDistribution) {
      this.charts.scoreDistribution.dispose()
    }
    if (this.charts.taskScore) {
      this.charts.taskScore.dispose()
    }
  },
  methods: {
    async loadGradesData() {
      this.loading = true
      try {
        // 调用现有的课程学生API
        const response = await teacherCourseApi.getCourseStudents(this.courseId, {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          keyword: this.searchText
        })

        this.gradesList = response.response || []
        this.total = this.gradesList.length

        // 计算统计数据
        this.calculateOverview()
      } catch (error) {
        this.$message.error('加载成绩数据失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    calculateOverview() {
      if (this.gradesList.length === 0) {
        this.overview = {
          totalStudents: 0,
          avgScore: 0,
          passRate: 0,
          excellentRate: 0
        }
        return
      }

      const totalStudents = this.gradesList.length
      const totalScore = this.gradesList.reduce((sum, student) => sum + (student.totalScore || 0), 0)
      const avgScore = (totalScore / totalStudents).toFixed(1)

      const passCount = this.gradesList.filter(student => (student.totalScore || 0) >= 60).length
      const excellentCount = this.gradesList.filter(student => (student.totalScore || 0) >= 90).length

      this.overview = {
        totalStudents,
        avgScore,
        passRate: ((passCount / totalStudents) * 100).toFixed(0),
        excellentRate: ((excellentCount / totalStudents) * 100).toFixed(0)
      }
    },

    async loadTaskColumns() {
      try {
        // TODO: 调用任务列表API获取动态列
        this.taskColumns = [
          { key: 'homework1', label: '作业1' },
          { key: 'homework2', label: '作业2' },
          { key: 'exam1', label: '测验1' },
          { key: 'exam2', label: '测验2' }
        ]
      } catch (error) {
        console.error('加载任务列失败:', error)
      }
    },

    initCharts() {
      this.initScoreDistributionChart()
      this.initTaskScoreChart()
    },

    initScoreDistributionChart() {
      const chartDom = document.getElementById('scoreDistributionChart')
      if (!chartDom) return

      this.charts.scoreDistribution = echarts.init(chartDom)
      const option = {
        title: {
          text: '成绩分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '成绩分布',
            type: 'pie',
            radius: '60%',
            data: [
              { value: 8, name: '优秀(90-100)' },
              { value: 15, name: '良好(80-89)' },
              { value: 5, name: '及格(60-79)' },
              { value: 2, name: '不及格(0-59)' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.charts.scoreDistribution.setOption(option)
    },

    initTaskScoreChart() {
      const chartDom = document.getElementById('taskScoreChart')
      if (!chartDom) return

      this.charts.taskScore = echarts.init(chartDom)
      const option = {
        title: {
          text: '各项任务平均分',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['作业1', '作业2', '测验1', '测验2']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '平均分',
            type: 'bar',
            data: [85, 88, 82, 90],
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
      this.charts.taskScore.setOption(option)
    },

    async exportGrades() {
      try {
        // TODO: 调用导出API
        this.$message.success('成绩导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      }
    },

    refreshData() {
      this.loadGradesData()
      this.loadTaskColumns()
      this.$nextTick(() => {
        this.initCharts()
      })
    },

    handleSearch() {
      this.pageIndex = 1
      this.loadGradesData()
    },

    handlePageChange(page) {
      this.pageIndex = page
      this.loadGradesData()
    },

    viewStudentDetail(student) {
      // TODO: 打开学生详情对话框或跳转到详情页
      this.$message.info(`查看学生 ${student.studentName} 的详细成绩`)
    },

    adjustScore(student) {
      this.adjustDialog.form = {
        studentId: student.studentId,
        studentName: student.studentName,
        taskType: '',
        originalScore: 0,
        newScore: 0,
        reason: ''
      }
      this.adjustDialog.visible = true
    },

    async confirmAdjustScore() {
      try {
        // TODO: 调用调分API
        this.$message.success('成绩调整成功')
        this.adjustDialog.visible = false
        this.loadGradesData()
      } catch (error) {
        this.$message.error('调整失败')
      }
    },

    getScoreClass(score) {
      if (!score) return ''
      if (score >= 90) return 'score-excellent'
      if (score >= 80) return 'score-good'
      if (score >= 60) return 'score-pass'
      return 'score-fail'
    },

    getGradeLevelColor(level) {
      const colorMap = {
        '优秀': 'success',
        '良好': 'primary',
        '及格': 'warning',
        '不及格': 'danger'
      }
      return colorMap[level] || 'info'
    }
  }
}
</script>

<style scoped>
.course-grades {
  padding: 0;
}

.grades-header {
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

.grades-overview {
  margin-bottom: 20px;
}

.overview-card {
  cursor: pointer;
  transition: all 0.3s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.overview-card .el-card__body {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-content {
  flex: 1;
}

.overview-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}

.overview-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.overview-icon {
  font-size: 32px;
  color: #C0C4CC;
}

.chart-card {
  margin-bottom: 20px;
}

.grades-table-card {
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

.score-excellent {
  color: #67C23A;
  font-weight: bold;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
}

.score-pass {
  color: #E6A23C;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grades-header {
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