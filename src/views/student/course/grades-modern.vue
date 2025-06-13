<template>
    <div class="modern-grades-container">
        <!-- 现代化页面头部 -->
        <div class="grades-header-modern">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="course-title">{{ courseName }}</h1>
                    <p class="page-subtitle">我的成绩中心</p>
                </div>
                <div class="header-right">
                    <div class="overall-grade-card">
                        <div class="grade-icon">
                            <i class="el-icon-trophy"></i>
                        </div>
                        <div class="grade-content">
                            <div class="grade-number">{{ overallGrade }}</div>
                            <div class="grade-label">总评成绩</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 成绩统计卡片 -->
        <div class="stats-section">
            <div class="stats-grid">
                <!-- 作业成绩统计 -->
                <div class="stat-card homework">
                    <div class="stat-header">
                        <div class="stat-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <h3>作业成绩</h3>
                    </div>
                    <div class="stat-content">
                        <div class="main-metric">
                            <span class="metric-value">{{ homeworkStats.averageScore || 0 }}</span>
                            <span class="metric-unit">分</span>
                        </div>
                        <div class="sub-metrics">
                            <div class="sub-metric">
                                <span class="label">已完成</span>
                                <span class="value">{{ homeworkStats.completed || 0 }}/{{ homeworkStats.total || 0 }}</span>
                            </div>
                            <div class="sub-metric">
                                <span class="label">完成率</span>
                                <span class="value">{{ getCompletionRate(homeworkStats.completed, homeworkStats.total) }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 测验成绩统计 -->
                <div class="stat-card exam">
                    <div class="stat-header">
                        <div class="stat-icon">
                            <i class="el-icon-document-checked"></i>
                        </div>
                        <h3>测验成绩</h3>
                    </div>
                    <div class="stat-content">
                        <div class="main-metric">
                            <span class="metric-value">{{ examStats.averageScore || 0 }}</span>
                            <span class="metric-unit">分</span>
                        </div>
                        <div class="sub-metrics">
                            <div class="sub-metric">
                                <span class="label">已参与</span>
                                <span class="value">{{ examStats.completed || 0 }}/{{ examStats.total || 0 }}</span>
                            </div>
                            <div class="sub-metric">
                                <span class="label">参与率</span>
                                <span class="value">{{ getCompletionRate(examStats.completed, examStats.total) }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 班级排名 -->
                <div class="stat-card ranking">
                    <div class="stat-header">
                        <div class="stat-icon">
                            <i class="el-icon-medal"></i>
                        </div>
                        <h3>班级排名</h3>
                    </div>
                    <div class="stat-content">
                        <div class="main-metric">
                            <span class="metric-value">{{ classRank.rank || '-' }}</span>
                            <span class="metric-unit">名</span>
                        </div>
                        <div class="sub-metrics">
                            <div class="sub-metric">
                                <span class="label">总人数</span>
                                <span class="value">{{ classRank.total || 0 }}</span>
                            </div>
                            <div class="sub-metric">
                                <span class="label">超越</span>
                                <span class="value">{{ getExceedRate() }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详细成绩列表 -->
        <div class="grades-detail-section">
            <el-card class="detail-card" shadow="hover">
                <div slot="header" class="card-header">
                    <span class="card-title">详细成绩</span>
                    <div class="header-actions">
                        <el-button type="text" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
                    </div>
                </div>

                <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="modern-tabs">
                    <!-- 作业成绩 -->
                    <el-tab-pane label="作业成绩" name="homework">
                        <div class="filter-bar">
                            <el-select v-model="homeworkFilter" @change="loadHomeworkGrades" placeholder="筛选状态">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="已完成" value="completed"></el-option>
                                <el-option label="未完成" value="pending"></el-option>
                                <el-option label="已过期" value="expired"></el-option>
                            </el-select>
                        </div>
                        
                        <div class="grades-list">
                            <div v-for="item in homeworkGrades" :key="item.id" class="grade-item">
                                <div class="item-header">
                                    <h4 class="item-title">{{ item.title }}</h4>
                                    <el-tag :type="getHomeworkStatusType(item.status)" size="small">
                                        {{ getHomeworkStatusText(item.status) }}
                                    </el-tag>
                                </div>
                                <div class="item-content">
                                    <div class="item-info">
                                        <div class="info-item">
                                            <i class="el-icon-time"></i>
                                            <span>截止时间：{{ item.deadline | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                        </div>
                                        <div class="info-item" v-if="item.submitTime">
                                            <i class="el-icon-check"></i>
                                            <span>提交时间：{{ item.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                        </div>
                                    </div>
                                    <div class="item-score" v-if="item.score !== null">
                                        <div class="score-display">
                                            <span class="score-number">{{ item.score }}</span>
                                            <span class="score-total">/ {{ item.totalScore }}</span>
                                        </div>
                                        <div class="score-percentage">{{ Math.round(item.score / item.totalScore * 100) }}%</div>
                                    </div>
                                </div>
                                <div class="item-actions" v-if="item.status === 'completed'">
                                    <el-button size="mini" type="primary" @click="viewHomeworkDetail(item)">查看详情</el-button>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- 测验成绩 -->
                    <el-tab-pane label="测验成绩" name="exam">
                        <div class="filter-bar">
                            <el-select v-model="examFilter" @change="loadExamGrades" placeholder="筛选状态">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="已完成" value="completed"></el-option>
                                <el-option label="未参与" value="pending"></el-option>
                                <el-option label="已过期" value="expired"></el-option>
                            </el-select>
                        </div>
                        
                        <div class="grades-list">
                            <div v-for="item in examGrades" :key="item.id" class="grade-item">
                                <div class="item-header">
                                    <h4 class="item-title">{{ item.title }}</h4>
                                    <el-tag :type="getExamStatusType(item.status)" size="small">
                                        {{ getExamStatusText(item.status) }}
                                    </el-tag>
                                </div>
                                <div class="item-content">
                                    <div class="item-info">
                                        <div class="info-item">
                                            <i class="el-icon-time"></i>
                                            <span>考试时间：{{ item.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="el-icon-timer"></i>
                                            <span>考试时长：{{ item.duration }}分钟</span>
                                        </div>
                                        <div class="info-item" v-if="item.submitTime">
                                            <i class="el-icon-check"></i>
                                            <span>提交时间：{{ item.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                        </div>
                                    </div>
                                    <div class="item-score" v-if="item.score !== null">
                                        <div class="score-display">
                                            <span class="score-number">{{ item.score }}</span>
                                            <span class="score-total">/ {{ item.totalScore }}</span>
                                        </div>
                                        <div class="score-percentage">{{ Math.round(item.score / item.totalScore * 100) }}%</div>
                                    </div>
                                </div>
                                <div class="item-actions" v-if="item.status === 'completed'">
                                    <el-button size="mini" type="primary" @click="viewExamResult(item)">查看详情</el-button>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- 成绩趋势 -->
                    <el-tab-pane label="成绩趋势" name="trend">
                        <div class="chart-section">
                            <div class="chart-container">
                                <div id="gradeChart" style="width: 100%; height: 400px;"></div>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </div>
</template>

<script>
import { getCourse } from '@/api/studentCourse'
import { getStudentGrades, getStudentHomeworkGrades, getStudentExamGrades } from '@/api/student/grade'
import * as echarts from 'echarts'

export default {
    name: 'ModernGrades',
    props: {
        courseId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            courseName: '',
            overallGrade: 0,
            homeworkStats: {},
            examStats: {},
            classRank: {},
            activeTab: 'homework',
            homeworkFilter: '',
            examFilter: '',
            homeworkGrades: [],
            examGrades: [],
            gradeChart: null
        }
    },
    created() {
        this.loadCourseInfo()
        this.loadGradeStats()
        this.loadHomeworkGrades()
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart()
        })
    },
    beforeDestroy() {
        if (this.gradeChart) {
            this.gradeChart.dispose()
        }
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

        refreshData() {
            this.loadGradeStats()
            this.loadHomeworkGrades()
            if (this.activeTab === 'exam') {
                this.loadExamGrades()
            }
            this.$message.success('数据已刷新')
        },

        getCompletionRate(completed, total) {
            if (!total) return 0
            return Math.round((completed / total) * 100)
        },

        getExceedRate() {
            if (!this.classRank.rank || !this.classRank.total) return 0
            return Math.round(((this.classRank.total - this.classRank.rank) / this.classRank.total) * 100)
        },

        getHomeworkStatusType(status) {
            const types = {
                'completed': 'success',
                'pending': 'warning',
                'expired': 'danger'
            }
            return types[status] || 'info'
        },

        getHomeworkStatusText(status) {
            const texts = {
                'completed': '已完成',
                'pending': '未完成',
                'expired': '已过期'
            }
            return texts[status] || '未知'
        },

        getExamStatusType(status) {
            const types = {
                'completed': 'success',
                'pending': 'warning',
                'expired': 'danger'
            }
            return types[status] || 'info'
        },

        getExamStatusText(status) {
            const texts = {
                'completed': '已完成',
                'pending': '未参与',
                'expired': '已过期'
            }
            return texts[status] || '未知'
        },

        viewHomeworkDetail(item) {
            this.$router.push({
                path: `/student/homework/${item.id}/result`,
                query: { courseId: this.courseId }
            })
        },

        viewExamResult(item) {
            this.$router.push({
                path: `/student/exam/${item.id}/result`,
                query: { courseId: this.courseId }
            })
        },

        initChart() {
            const chartDom = document.getElementById('gradeChart')
            if (!chartDom) return

            this.gradeChart = echarts.init(chartDom)
            this.updateChart()
        },

        updateChart() {
            if (!this.gradeChart) return

            const option = {
                title: {
                    text: '成绩趋势图',
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 600
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ['作业成绩', '测验成绩'],
                    bottom: 10
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 100,
                    axisLabel: {
                        formatter: '{value}分'
                    }
                },
                series: [
                    {
                        name: '作业成绩',
                        type: 'line',
                        data: [85, 88, 82, 90, 87, 92],
                        smooth: true,
                        itemStyle: {
                            color: '#667eea'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: 'rgba(102, 126, 234, 0.3)'
                                }, {
                                    offset: 1, color: 'rgba(102, 126, 234, 0.1)'
                                }]
                            }
                        }
                    },
                    {
                        name: '测验成绩',
                        type: 'line',
                        data: [80, 85, 88, 86, 89, 94],
                        smooth: true,
                        itemStyle: {
                            color: '#764ba2'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: 'rgba(118, 75, 162, 0.3)'
                                }, {
                                    offset: 1, color: 'rgba(118, 75, 162, 0.1)'
                                }]
                            }
                        }
                    }
                ]
            }

            this.gradeChart.setOption(option)
        }
    }
}
</script>

<style lang="scss" scoped>
.modern-grades-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 0;
}

// 现代化页面头部
.grades-header-modern {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 0;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);

    .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-left {
            .course-title {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .page-subtitle {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
        }

        .header-right {
            .overall-grade-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 24px;
                display: flex;
                align-items: center;
                gap: 16px;
                border: 1px solid rgba(255, 255, 255, 0.2);

                .grade-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .grade-content {
                    .grade-number {
                        font-size: 32px;
                        font-weight: 700;
                        line-height: 1;
                        margin-bottom: 4px;
                    }

                    .grade-label {
                        font-size: 14px;
                        opacity: 0.8;
                    }
                }
            }
        }
    }
}

// 统计卡片区域
.stats-section {
    max-width: 1200px;
    margin: 0 auto 30px auto;
    padding: 0 30px;

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;

        .stat-card {
            background: white;
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
            }

            &.homework::before {
                background: linear-gradient(90deg, #667eea, #764ba2);
            }

            &.exam::before {
                background: linear-gradient(90deg, #f093fb, #f5576c);
            }

            &.ranking::before {
                background: linear-gradient(90deg, #4facfe, #00f2fe);
            }

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            }

            .stat-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0;
                }
            }

            .stat-content {
                .main-metric {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                    margin-bottom: 16px;

                    .metric-value {
                        font-size: 36px;
                        font-weight: 700;
                        color: #2c3e50;
                        line-height: 1;
                    }

                    .metric-unit {
                        font-size: 16px;
                        color: #7f8c8d;
                    }
                }

                .sub-metrics {
                    display: flex;
                    justify-content: space-between;

                    .sub-metric {
                        text-align: center;

                        .label {
                            display: block;
                            font-size: 12px;
                            color: #7f8c8d;
                            margin-bottom: 4px;
                        }

                        .value {
                            font-size: 16px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                    }
                }
            }
        }
    }
}

// 详细成绩区域
.grades-detail-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px 30px 30px;

    .detail-card {
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .card-title {
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
            }
        }

        .modern-tabs {
            .el-tabs__header {
                margin-bottom: 20px;

                .el-tabs__nav-wrap {
                    &::after {
                        background: #f0f0f0;
                    }
                }

                .el-tabs__item {
                    font-size: 16px;
                    font-weight: 600;
                    color: #7f8c8d;

                    &.is-active {
                        color: #667eea;
                    }
                }

                .el-tabs__active-bar {
                    background: #667eea;
                }
            }
        }

        .filter-bar {
            margin-bottom: 20px;

            .el-select {
                width: 150px;
            }
        }

        .grades-list {
            .grade-item {
                background: #fafbfc;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                border: 1px solid #f0f0f0;
                transition: all 0.3s ease;

                &:hover {
                    background: #f8f9fa;
                    border-color: #667eea;
                    transform: translateY(-1px);
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;

                    .item-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin: 0;
                    }
                }

                .item-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;

                    .item-info {
                        .info-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            margin-bottom: 4px;
                            font-size: 14px;
                            color: #606266;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            i {
                                color: #909399;
                                width: 16px;
                            }
                        }
                    }

                    .item-score {
                        text-align: right;

                        .score-display {
                            .score-number {
                                font-size: 24px;
                                font-weight: 700;
                                color: #667eea;
                            }

                            .score-total {
                                font-size: 16px;
                                color: #7f8c8d;
                            }
                        }

                        .score-percentage {
                            font-size: 12px;
                            color: #909399;
                            margin-top: 4px;
                        }
                    }
                }

                .item-actions {
                    text-align: right;
                }
            }
        }

        .chart-section {
            .chart-container {
                background: #fafbfc;
                border-radius: 12px;
                padding: 20px;
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .grades-header-modern {
        .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
        }
    }

    .stats-section {
        padding: 0 20px;

        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    .grades-detail-section {
        padding: 0 20px 30px 20px;
    }
}

@media (max-width: 768px) {
    .grades-header-modern {
        padding: 30px 0;

        .header-content {
            padding: 0 20px;

            .header-left {
                .course-title {
                    font-size: 28px;
                }

                .page-subtitle {
                    font-size: 14px;
                }
            }

            .header-right {
                .overall-grade-card {
                    padding: 20px;

                    .grade-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 24px;
                    }

                    .grade-content {
                        .grade-number {
                            font-size: 28px;
                        }
                    }
                }
            }
        }
    }

    .stats-section {
        .stats-grid {
            .stat-card {
                padding: 24px;

                .stat-header {
                    .stat-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    h3 {
                        font-size: 16px;
                    }
                }

                .stat-content {
                    .main-metric {
                        .metric-value {
                            font-size: 32px;
                        }
                    }
                }
            }
        }
    }

    .grades-detail-section {
        .detail-card {
            .grades-list {
                .grade-item {
                    padding: 16px;

                    .item-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;

                        .item-score {
                            text-align: left;
                            align-self: stretch;

                            .score-display {
                                display: flex;
                                justify-content: space-between;
                                align-items: baseline;
                            }
                        }
                    }

                    .item-actions {
                        text-align: left;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .grades-header-modern {
        .header-content {
            .header-right {
                .overall-grade-card {
                    width: 100%;
                    justify-content: center;
                }
            }
        }
    }

    .stats-section {
        .stats-grid {
            .stat-card {
                .stat-content {
                    .sub-metrics {
                        flex-direction: column;
                        gap: 12px;

                        .sub-metric {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .label,
                            .value {
                                margin: 0;
                            }
                        }
                    }
                }
            }
        }
    }

    .grades-detail-section {
        .detail-card {
            .modern-tabs {
                .el-tabs__header {
                    .el-tabs__nav {
                        .el-tabs__item {
                            font-size: 14px;
                            padding: 0 12px;
                        }
                    }
                }
            }

            .grades-list {
                .grade-item {
                    .item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            }
        }
    }
}
</style>
