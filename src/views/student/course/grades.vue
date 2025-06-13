<template>
    <div class="student-grades">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-info">
                <h2>我的成绩</h2>
                <p class="course-name">{{ courseName }}</p>
            </div>
            <div class="overall-grade">
                <div class="grade-circle">
                    <div class="circle-content">
                        <span class="grade-value">{{ overallGrade }}</span>
                        <span class="grade-unit">分</span>
                    </div>
                </div>
                <div class="grade-info">
                    <h3>总评成绩</h3>
                    <p>{{ getGradeLevel(overallGrade) }}</p>
                </div>
            </div>
        </div>

        <!-- 成绩统计卡片 -->
        <div class="stats-cards">
            <el-card class="stat-card">
                <div class="stat-content">
                    <div class="stat-icon homework-icon">
                        <i class="el-icon-edit"></i>
                    </div>
                    <div class="stat-info">
                        <h4>作业成绩</h4>
                        <p class="stat-value">{{ homeworkStats.average || 0 }}分</p>
                        <p class="stat-desc">已完成 {{ homeworkStats.completed || 0 }}/{{ homeworkStats.total || 0 }}</p>
                    </div>
                </div>
            </el-card>

            <el-card class="stat-card">
                <div class="stat-content">
                    <div class="stat-icon exam-icon">
                        <i class="el-icon-document"></i>
                    </div>
                    <div class="stat-info">
                        <h4>测验成绩</h4>
                        <p class="stat-value">{{ examStats.average || 0 }}分</p>
                        <p class="stat-desc">已完成 {{ examStats.completed || 0 }}/{{ examStats.total || 0 }}</p>
                    </div>
                </div>
            </el-card>

            <el-card class="stat-card">
                <div class="stat-content">
                    <div class="stat-icon attendance-icon">
                        <i class="el-icon-user"></i>
                    </div>
                    <div class="stat-info">
                        <h4>出勤率</h4>
                        <p class="stat-value">{{ attendanceStats.rate || 0 }}%</p>
                        <p class="stat-desc">{{ attendanceStats.present || 0 }}/{{ attendanceStats.total || 0 }}</p>
                    </div>
                </div>
            </el-card>

            <el-card class="stat-card">
                <div class="stat-content">
                    <div class="stat-icon rank-icon">
                        <i class="el-icon-trophy"></i>
                    </div>
                    <div class="stat-info">
                        <h4>班级排名</h4>
                        <p class="stat-value">{{ classRank.rank || '-' }}</p>
                        <p class="stat-desc">共 {{ classRank.total || 0 }} 人</p>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 成绩详情 -->
        <div class="grade-details">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <!-- 作业成绩 -->
                <el-tab-pane label="作业成绩" name="homework">
                    <div class="homework-grades">
                        <div class="filter-bar">
                            <el-select v-model="homeworkFilter" @change="loadHomeworkGrades" placeholder="筛选状态"
                                style="width: 150px;">
                                <el-option label="全部" value="" />
                                <el-option label="已完成" value="completed" />
                                <el-option label="未完成" value="pending" />
                            </el-select>
                        </div>

                        <el-table :data="homeworkGrades" border stripe>
                            <el-table-column prop="title" label="作业名称" min-width="200" show-overflow-tooltip />
                            <el-table-column prop="totalScore" label="总分" width="80" align="center">
                                <template slot-scope="scope">{{ scope.row.totalScore / 10 }}</template>
                            </el-table-column>
                            <el-table-column prop="score" label="得分" width="80" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.score !== null">{{ scope.row.score / 10 }}</span>
                                    <span v-else>-</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="得分率" width="100" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.score !== null"
                                        :class="getScoreClass(scope.row.score / scope.row.totalScore * 100)">
                                        {{ Math.round(scope.row.score / scope.row.totalScore * 100) }}%
                                    </span>
                                    <span v-else>-</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="submitTime" label="提交时间" width="160" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.submitTime">
                                        {{ scope.row.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                    </span>
                                    <span v-else>未提交</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="endTime" label="截止时间" width="160" align="center">
                                <template slot-scope="scope">
                                    {{ scope.row.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" width="100" align="center">
                                <template slot-scope="scope">
                                    <el-tag :type="getHomeworkStatusType(scope.row.status)" size="mini">
                                        {{ getHomeworkStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-tab-pane>

                <!-- 测验成绩 -->
                <el-tab-pane label="测验成绩" name="exam">
                    <div class="exam-grades">
                        <div class="filter-bar">
                            <el-select v-model="examFilter" @change="loadExamGrades" placeholder="筛选状态"
                                style="width: 150px;">
                                <el-option label="全部" value="" />
                                <el-option label="已完成" value="completed" />
                                <el-option label="未完成" value="pending" />
                            </el-select>
                        </div>

                        <el-table :data="examGrades" border stripe>
                            <el-table-column prop="title" label="测验名称" min-width="200" show-overflow-tooltip />
                            <el-table-column prop="totalScore" label="总分" width="80" align="center">
                                <template slot-scope="scope">{{ scope.row.totalScore / 10 }}</template>
                            </el-table-column>
                            <el-table-column prop="score" label="得分" width="80" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.score !== null">{{ scope.row.score / 10 }}</span>
                                    <span v-else>-</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="得分率" width="100" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.score !== null"
                                        :class="getScoreClass(scope.row.score / scope.row.totalScore * 100)">
                                        {{ Math.round(scope.row.score / scope.row.totalScore * 100) }}%
                                    </span>
                                    <span v-else>-</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="duration" label="用时" width="100" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.duration">{{ scope.row.duration }}分钟</span>
                                    <span v-else>-</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="submitTime" label="完成时间" width="160" align="center">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.submitTime">
                                        {{ scope.row.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                    </span>
                                    <span v-else>未完成</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" width="100" align="center">
                                <template slot-scope="scope">
                                    <el-tag :type="getExamStatusType(scope.row.status)" size="mini">
                                        {{ getExamStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="120" align="center">
                                <template slot-scope="scope">
                                    <el-button v-if="scope.row.status === 'completed'" size="mini" type="primary"
                                        @click="viewExamResult(scope.row)">
                                        查看详情
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-tab-pane>

                <!-- 成绩趋势 -->
                <el-tab-pane label="成绩趋势" name="trend">
                    <div class="grade-trend">
                        <div class="chart-container">
                            <div id="gradeChart" style="width: 100%; height: 400px;"></div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import { getCourse } from '@/api/studentCourse'
import { getStudentGrades, getStudentHomeworkGrades, getStudentExamGrades } from '@/api/student/grade'

export default {
    name: 'StudentCourseGrades',
    data() {
        return {
            courseId: null,
            courseName: '',
            activeTab: 'homework',
            overallGrade: 0,
            homeworkStats: {},
            examStats: {},
            attendanceStats: {},
            classRank: {},
            homeworkGrades: [],
            examGrades: [],
            homeworkFilter: '',
            examFilter: '',
            gradeChart: null
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.loadCourseInfo()
        this.loadGradeStats()
        this.loadHomeworkGrades()
    },
    mounted() {
        this.initChart()
    },
    methods: {
        async loadCourseInfo() {
            try {
                const response = await getCourse(this.courseId)
                if (response.code === 1) {
                    this.courseName = response.response.name
                }
            } catch (error) {
                console.error('加载课程信息失败:', error)
            }
        },

        async loadGradeStats() {
            try {
                const response = await getStudentGrades(this.courseId)
                if (response.code === 1) {
                    const data = response.response
                    this.overallGrade = data.overallGrade || 0
                    this.homeworkStats = data.homeworkStats || {}
                    this.examStats = data.examStats || {}
                    this.attendanceStats = data.attendanceStats || {}
                    this.classRank = data.classRank || {}
                }
            } catch (error) {
                this.$message.error('加载成绩统计失败')
            }
        },

        async loadHomeworkGrades() {
            try {
                const response = await getStudentHomeworkGrades(this.courseId, { status: this.homeworkFilter })
                if (response.code === 1) {
                    this.homeworkGrades = response.response || []
                }
            } catch (error) {
                this.$message.error('加载作业成绩失败')
            }
        },

        async loadExamGrades() {
            try {
                const response = await getStudentExamGrades(this.courseId, { status: this.examFilter })
                if (response.code === 1) {
                    this.examGrades = response.response || []
                }
            } catch (error) {
                this.$message.error('加载测验成绩失败')
            }
        },

        handleTabClick(tab) {
            if (tab.name === 'exam' && this.examGrades.length === 0) {
                this.loadExamGrades()
            } else if (tab.name === 'trend') {
                this.updateChart()
            }
        },

        viewExamResult(exam) {
            this.$router.push({
                path: `/student/exam/${exam.id}/result`,
                query: { courseId: this.courseId }
            })
        },

        getGradeLevel(grade) {
            if (grade >= 90) return '优秀'
            if (grade >= 80) return '良好'
            if (grade >= 70) return '中等'
            if (grade >= 60) return '及格'
            return '不及格'
        },

        getScoreClass(percentage) {
            if (percentage >= 90) return 'score-excellent'
            if (percentage >= 80) return 'score-good'
            if (percentage >= 70) return 'score-medium'
            if (percentage >= 60) return 'score-pass'
            return 'score-fail'
        },

        getHomeworkStatusText(status) {
            const statusMap = {
                'completed': '已完成',
                'pending': '未完成',
                'overdue': '已逾期'
            }
            return statusMap[status] || '未知'
        },

        getHomeworkStatusType(status) {
            const typeMap = {
                'completed': 'success',
                'pending': 'warning',
                'overdue': 'danger'
            }
            return typeMap[status] || 'info'
        },

        getExamStatusText(status) {
            const statusMap = {
                'completed': '已完成',
                'pending': '未完成',
                'ongoing': '进行中'
            }
            return statusMap[status] || '未知'
        },

        getExamStatusType(status) {
            const typeMap = {
                'completed': 'success',
                'pending': 'warning',
                'ongoing': 'primary'
            }
            return typeMap[status] || 'info'
        },

        initChart() {
            // 使用 ECharts 初始化图表
            const echarts = require('echarts')
            this.gradeChart = echarts.init(document.getElementById('gradeChart'))
            this.updateChart()
        },

        updateChart() {
            if (!this.gradeChart) return

            // 模拟成绩趋势数据
            const option = {
                title: {
                    text: '成绩趋势图',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['作业成绩', '测验成绩'],
                    top: '10%'
                },
                xAxis: {
                    type: 'category',
                    data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 100
                },
                series: [
                    {
                        name: '作业成绩',
                        type: 'line',
                        data: [85, 88, 82, 90, 87, 89, 92, 88],
                        smooth: true
                    },
                    {
                        name: '测验成绩',
                        type: 'line',
                        data: [78, 82, 85, 88, 86, 90, 89, 91],
                        smooth: true
                    }
                ]
            }

            this.gradeChart.setOption(option)
        }
    }
}
</script>

<style lang="scss" scoped>
.student-grades {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    color: white;

    .header-info h2 {
        margin: 0 0 5px 0;
        font-size: 28px;
    }

    .course-name {
        margin: 0;
        opacity: 0.9;
        font-size: 16px;
    }

    .overall-grade {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .grade-circle {
        width: 100px;
        height: 100px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);

        .circle-content {
            text-align: center;

            .grade-value {
                display: block;
                font-size: 32px;
                font-weight: bold;
            }

            .grade-unit {
                font-size: 14px;
                opacity: 0.8;
            }
        }
    }

    .grade-info h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
    }

    .grade-info p {
        margin: 0;
        opacity: 0.9;
    }
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
            font-size: 28px;
            color: white;
        }

        &.homework-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.exam-icon {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }

        &.attendance-icon {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }

        &.rank-icon {
            background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        }
    }

    .stat-info h4 {
        margin: 0 0 5px 0;
        color: #303133;
        font-size: 16px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        margin: 5px 0;
    }

    .stat-desc {
        font-size: 14px;
        color: #909399;
        margin: 0;
    }
}

.grade-details {
    background: white;
    border-radius: 10px;
    overflow: hidden;
}

.filter-bar {
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
}

.score-excellent {
    color: #67c23a;
    font-weight: bold;
}

.score-good {
    color: #409eff;
    font-weight: bold;
}

.score-medium {
    color: #e6a23c;
    font-weight: bold;
}

.score-pass {
    color: #909399;
}

.score-fail {
    color: #f56c6c;
    font-weight: bold;
}

.chart-container {
    padding: 20px;
}
</style>