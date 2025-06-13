<template>
    <div class="modern-dashboard">
        <!-- 欢迎横幅 -->
        <div class="welcome-banner">
            <div class="banner-content">
                <div class="welcome-text">
                    <h1>欢迎回来，{{ userInfo.name }}！</h1>
                    <p>今天是学习的好日子，让我们一起努力吧！</p>
                </div>
                <div class="welcome-illustration">
                    <div class="illustration-circle">
                        <i class="el-icon-star-on"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快速统计 -->
        <div class="quick-stats">
            <div class="stats-grid">
                <div class="stat-card courses">
                    <div class="stat-icon">
                        <i class="el-icon-notebook-1"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ stats.totalCourses }}</div>
                        <div class="stat-label">我的课程</div>
                    </div>
                    <div class="stat-trend up">
                        <i class="el-icon-top"></i>
                        <span>+2</span>
                    </div>
                </div>

                <div class="stat-card exams">
                    <div class="stat-icon">
                        <i class="el-icon-document-checked"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ stats.pendingExams }}</div>
                        <div class="stat-label">待完成测验</div>
                    </div>
                    <div class="stat-trend">
                        <i class="el-icon-minus"></i>
                        <span>{{ stats.pendingExams }}</span>
                    </div>
                </div>

                <div class="stat-card homework">
                    <div class="stat-icon">
                        <i class="el-icon-edit-outline"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ stats.pendingHomework }}</div>
                        <div class="stat-label">待提交作业</div>
                    </div>
                    <div class="stat-trend">
                        <i class="el-icon-minus"></i>
                        <span>{{ stats.pendingHomework }}</span>
                    </div>
                </div>

                <div class="stat-card grade">
                    <div class="stat-icon">
                        <i class="el-icon-trophy"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ stats.averageGrade }}</div>
                        <div class="stat-label">平均成绩</div>
                    </div>
                    <div class="stat-trend up">
                        <i class="el-icon-top"></i>
                        <span>+5.2</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 左侧内容 -->
            <div class="content-left">
                <!-- 最近课程 -->
                <el-card class="recent-courses-card" shadow="hover">
                    <div slot="header" class="card-header">
                        <span class="card-title">最近课程</span>
                        <el-button type="text" @click="goToCourses">查看全部</el-button>
                    </div>
                    <div class="courses-list">
                        <div v-for="course in recentCourses" :key="course.id" class="course-item" @click="goToCourse(course.id)">
                            <div class="course-avatar">
                                <i class="el-icon-notebook-1"></i>
                            </div>
                            <div class="course-info">
                                <h4 class="course-name">{{ course.name }}</h4>
                                <p class="course-teacher">{{ course.teacherName }}</p>
                                <div class="course-progress">
                                    <el-progress :percentage="course.progress" :stroke-width="4" :show-text="false"></el-progress>
                                    <span class="progress-text">{{ course.progress }}%</span>
                                </div>
                            </div>
                            <div class="course-status">
                                <el-tag :type="getCourseStatusType(course.status)" size="small">
                                    {{ getCourseStatusText(course.status) }}
                                </el-tag>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- 待办事项 -->
                <el-card class="todo-card" shadow="hover">
                    <div slot="header" class="card-header">
                        <span class="card-title">待办事项</span>
                        <el-button type="text" @click="refreshTodos">刷新</el-button>
                    </div>
                    <div class="todo-list">
                        <div v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ 'urgent': todo.urgent }">
                            <div class="todo-icon">
                                <i :class="getTodoIcon(todo.type)"></i>
                            </div>
                            <div class="todo-content">
                                <h4 class="todo-title">{{ todo.title }}</h4>
                                <p class="todo-desc">{{ todo.description }}</p>
                                <div class="todo-meta">
                                    <span class="todo-course">{{ todo.courseName }}</span>
                                    <span class="todo-deadline">{{ todo.deadline | parseTime('{m}-{d} {h}:{i}') }}</span>
                                </div>
                            </div>
                            <div class="todo-action">
                                <el-button size="mini" type="primary" @click="handleTodo(todo)">
                                    {{ getTodoActionText(todo.type) }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 右侧内容 -->
            <div class="content-right">
                <!-- 学习进度 -->
                <el-card class="progress-card" shadow="hover">
                    <div slot="header" class="card-header">
                        <span class="card-title">学习进度</span>
                    </div>
                    <div class="progress-content">
                        <div class="progress-chart">
                            <div id="progressChart" style="width: 100%; height: 200px;"></div>
                        </div>
                        <div class="progress-summary">
                            <div class="summary-item">
                                <span class="label">本周学习时长</span>
                                <span class="value">{{ stats.weeklyStudyTime }}小时</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">完成任务数</span>
                                <span class="value">{{ stats.completedTasks }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">学习天数</span>
                                <span class="value">{{ stats.studyDays }}天</span>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- 成绩趋势 -->
                <el-card class="grade-trend-card" shadow="hover">
                    <div slot="header" class="card-header">
                        <span class="card-title">成绩趋势</span>
                        <el-button type="text" @click="goToGrades">详细分析</el-button>
                    </div>
                    <div class="grade-chart">
                        <div id="gradeChart" style="width: 100%; height: 180px;"></div>
                    </div>
                </el-card>

                <!-- 最新通知 -->
                <el-card class="notifications-card" shadow="hover">
                    <div slot="header" class="card-header">
                        <span class="card-title">最新通知</span>
                        <el-badge :value="notifications.length" :hidden="notifications.length === 0">
                            <el-button type="text" @click="goToNotifications">查看全部</el-button>
                        </el-badge>
                    </div>
                    <div class="notifications-list">
                        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
                            <div class="notification-icon" :class="notification.type">
                                <i :class="getNotificationIcon(notification.type)"></i>
                            </div>
                            <div class="notification-content">
                                <h4 class="notification-title">{{ notification.title }}</h4>
                                <p class="notification-desc">{{ notification.content }}</p>
                                <span class="notification-time">{{ notification.time | parseTime('{m}-{d} {h}:{i}') }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as echarts from 'echarts'

export default {
    name: 'ModernDashboard',
    data() {
        return {
            stats: {
                totalCourses: 6,
                pendingExams: 3,
                pendingHomework: 2,
                averageGrade: 87.5,
                weeklyStudyTime: 12.5,
                completedTasks: 15,
                studyDays: 5
            },
            recentCourses: [
                {
                    id: 1,
                    name: '高等数学',
                    teacherName: '张教授',
                    progress: 75,
                    status: 'active'
                },
                {
                    id: 2,
                    name: '计算机网络',
                    teacherName: '李老师',
                    progress: 60,
                    status: 'active'
                },
                {
                    id: 3,
                    name: '数据结构',
                    teacherName: '王老师',
                    progress: 90,
                    status: 'completed'
                }
            ],
            todoList: [
                {
                    id: 1,
                    type: 'exam',
                    title: '高等数学期中测验',
                    description: '第1-5章内容测验',
                    courseName: '高等数学',
                    deadline: '2024-01-20 14:00:00',
                    urgent: true
                },
                {
                    id: 2,
                    type: 'homework',
                    title: '网络协议分析报告',
                    description: '分析TCP/IP协议栈',
                    courseName: '计算机网络',
                    deadline: '2024-01-22 23:59:00',
                    urgent: false
                }
            ],
            notifications: [
                {
                    id: 1,
                    type: 'exam',
                    title: '测验提醒',
                    content: '高等数学期中测验将于明天开始',
                    time: '2024-01-19 10:30:00'
                },
                {
                    id: 2,
                    type: 'grade',
                    title: '成绩发布',
                    content: '数据结构作业3成绩已发布',
                    time: '2024-01-19 09:15:00'
                }
            ],
            progressChart: null,
            gradeChart: null
        }
    },
    computed: {
        ...mapGetters(['userInfo'])
    },
    mounted() {
        this.$nextTick(() => {
            this.initCharts()
        })
    },
    beforeDestroy() {
        if (this.progressChart) {
            this.progressChart.dispose()
        }
        if (this.gradeChart) {
            this.gradeChart.dispose()
        }
    },
    methods: {
        initCharts() {
            this.initProgressChart()
            this.initGradeChart()
        },

        initProgressChart() {
            const chartDom = document.getElementById('progressChart')
            if (!chartDom) return

            this.progressChart = echarts.init(chartDom)
            const option = {
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        data: [
                            { value: 75, name: '已完成', itemStyle: { color: '#67C23A' } },
                            { value: 25, name: '未完成', itemStyle: { color: '#E6E8EB' } }
                        ],
                        label: {
                            show: false
                        },
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
            this.progressChart.setOption(option)
        },

        initGradeChart() {
            const chartDom = document.getElementById('gradeChart')
            if (!chartDom) return

            this.gradeChart = echarts.init(chartDom)
            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['第1周', '第2周', '第3周', '第4周'],
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    }
                },
                series: [
                    {
                        data: [82, 85, 88, 87],
                        type: 'line',
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
                    }
                ]
            }
            this.gradeChart.setOption(option)
        },

        getCourseStatusType(status) {
            const types = {
                'active': 'success',
                'completed': 'info',
                'pending': 'warning'
            }
            return types[status] || 'info'
        },

        getCourseStatusText(status) {
            const texts = {
                'active': '进行中',
                'completed': '已完成',
                'pending': '未开始'
            }
            return texts[status] || '未知'
        },

        getTodoIcon(type) {
            const icons = {
                'exam': 'el-icon-document-checked',
                'homework': 'el-icon-edit-outline',
                'course': 'el-icon-notebook-1'
            }
            return icons[type] || 'el-icon-info'
        },

        getTodoActionText(type) {
            const texts = {
                'exam': '开始测验',
                'homework': '提交作业',
                'course': '查看课程'
            }
            return texts[type] || '查看'
        },

        getNotificationIcon(type) {
            const icons = {
                'exam': 'el-icon-document-checked',
                'grade': 'el-icon-trophy',
                'course': 'el-icon-notebook-1',
                'system': 'el-icon-bell'
            }
            return icons[type] || 'el-icon-info'
        },

        goToCourses() {
            this.$router.push('/student/courses')
        },

        goToCourse(courseId) {
            this.$router.push(`/student/course/${courseId}`)
        },

        goToGrades() {
            this.$router.push('/student/grades')
        },

        goToNotifications() {
            this.$router.push('/student/notifications')
        },

        refreshTodos() {
            this.$message.success('待办事项已刷新')
        },

        handleTodo(todo) {
            if (todo.type === 'exam') {
                this.$router.push(`/student/exam/${todo.id}`)
            } else if (todo.type === 'homework') {
                this.$router.push(`/student/homework/${todo.id}`)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.modern-dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 30px;
}

// 欢迎横幅
.welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 30px;
    color: white;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);

    .banner-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .welcome-text {
            h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            p {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
        }

        .welcome-illustration {
            .illustration-circle {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);

                i {
                    font-size: 40px;
                    color: #ffd700;
                }
            }
        }
    }
}

// 快速统计
.quick-stats {
    margin-bottom: 30px;

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;

        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            display: flex;
            align-items: center;
            gap: 16px;
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

            &.courses::before {
                background: linear-gradient(90deg, #667eea, #764ba2);
            }

            &.exams::before {
                background: linear-gradient(90deg, #f093fb, #f5576c);
            }

            &.homework::before {
                background: linear-gradient(90deg, #4facfe, #00f2fe);
            }

            &.grade::before {
                background: linear-gradient(90deg, #43e97b, #38f9d7);
            }

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            }

            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                background: linear-gradient(135deg, #667eea, #764ba2);
            }

            .stat-content {
                flex: 1;

                .stat-number {
                    font-size: 32px;
                    font-weight: 700;
                    color: #2c3e50;
                    line-height: 1;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #7f8c8d;
                }
            }

            .stat-trend {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                font-weight: 600;
                color: #7f8c8d;

                &.up {
                    color: #67c23a;
                }

                i {
                    font-size: 14px;
                }
            }
        }
    }
}

// 主要内容区域
.main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;

    .content-left,
    .content-right {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .el-card {
        border-radius: 16px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .card-title {
                font-size: 18px;
                font-weight: 600;
                color: #2c3e50;
            }
        }
    }
}

// 最近课程卡片
.recent-courses-card {
    .courses-list {
        .course-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;

            &:hover {
                background: #f8f9fa;
                border-color: #667eea;
                transform: translateY(-1px);
            }

            &:last-child {
                margin-bottom: 0;
            }

            .course-avatar {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }

            .course-info {
                flex: 1;

                .course-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 4px 0;
                }

                .course-teacher {
                    font-size: 14px;
                    color: #7f8c8d;
                    margin: 0 0 8px 0;
                }

                .course-progress {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .el-progress {
                        flex: 1;
                    }

                    .progress-text {
                        font-size: 12px;
                        color: #667eea;
                        font-weight: 600;
                        min-width: 35px;
                    }
                }
            }

            .course-status {
                // 状态标签样式已由 el-tag 提供
            }
        }
    }
}

// 待办事项卡片
.todo-card {
    .todo-list {
        .todo-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid #f0f0f0;
            transition: all 0.3s ease;

            &:hover {
                border-color: #667eea;
                background: #fafbfc;
            }

            &.urgent {
                border-color: #f56c6c;
                background: linear-gradient(135deg, #fef0f0, #fef0f0);

                .todo-icon {
                    background: linear-gradient(135deg, #f56c6c, #f78989);
                }
            }

            &:last-child {
                margin-bottom: 0;
            }

            .todo-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                flex-shrink: 0;
            }

            .todo-content {
                flex: 1;

                .todo-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 4px 0;
                }

                .todo-desc {
                    font-size: 14px;
                    color: #606266;
                    margin: 0 0 8px 0;
                }

                .todo-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 12px;

                    .todo-course {
                        color: #667eea;
                        font-weight: 600;
                    }

                    .todo-deadline {
                        color: #909399;
                    }
                }
            }

            .todo-action {
                flex-shrink: 0;
            }
        }
    }
}

// 学习进度卡片
.progress-card {
    .progress-content {
        .progress-chart {
            margin-bottom: 20px;
        }

        .progress-summary {
            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;

                &:last-child {
                    border-bottom: none;
                }

                .label {
                    font-size: 14px;
                    color: #606266;
                }

                .value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #667eea;
                }
            }
        }
    }
}

// 成绩趋势卡片
.grade-trend-card {
    .grade-chart {
        // 图表容器样式
    }
}

// 通知卡片
.notifications-card {
    .notifications-list {
        .notification-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            transition: all 0.3s ease;

            &:hover {
                background: #f8f9fa;
            }

            &:last-child {
                margin-bottom: 0;
            }

            .notification-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                flex-shrink: 0;

                &.exam {
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                }

                &.grade {
                    background: linear-gradient(135deg, #43e97b, #38f9d7);
                }

                &.course {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                &.system {
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                }
            }

            .notification-content {
                flex: 1;

                .notification-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 4px 0;
                }

                .notification-desc {
                    font-size: 13px;
                    color: #606266;
                    margin: 0 0 4px 0;
                    line-height: 1.4;
                }

                .notification-time {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .modern-dashboard {
        padding: 20px;

        .main-content {
            grid-template-columns: 1fr;
            gap: 20px;
        }
    }
}

@media (max-width: 768px) {
    .modern-dashboard {
        padding: 15px;

        .welcome-banner {
            padding: 30px 20px;

            .banner-content {
                flex-direction: column;
                gap: 20px;
                text-align: center;

                .welcome-text {
                    h1 {
                        font-size: 28px;
                    }

                    p {
                        font-size: 14px;
                    }
                }

                .welcome-illustration {
                    .illustration-circle {
                        width: 60px;
                        height: 60px;

                        i {
                            font-size: 30px;
                        }
                    }
                }
            }
        }

        .quick-stats {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;

                .stat-card {
                    padding: 20px;
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;

                    .stat-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 24px;
                    }

                    .stat-content {
                        .stat-number {
                            font-size: 28px;
                        }
                    }

                    .stat-trend {
                        justify-content: center;
                    }
                }
            }
        }

        .recent-courses-card {
            .courses-list {
                .course-item {
                    padding: 12px;

                    .course-avatar {
                        width: 40px;
                        height: 40px;
                        font-size: 18px;
                    }

                    .course-info {
                        .course-name {
                            font-size: 15px;
                        }

                        .course-teacher {
                            font-size: 13px;
                        }
                    }
                }
            }
        }

        .todo-card {
            .todo-list {
                .todo-item {
                    padding: 12px;

                    .todo-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 14px;
                    }

                    .todo-content {
                        .todo-title {
                            font-size: 15px;
                        }

                        .todo-desc {
                            font-size: 13px;
                        }

                        .todo-meta {
                            flex-direction: column;
                            gap: 4px;
                            align-items: flex-start;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .modern-dashboard {
        .quick-stats {
            .stats-grid {
                grid-template-columns: 1fr;

                .stat-card {
                    flex-direction: row;
                    text-align: left;

                    .stat-content {
                        flex: 1;
                    }
                }
            }
        }

        .recent-courses-card {
            .courses-list {
                .course-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;

                    .course-info {
                        width: 100%;

                        .course-progress {
                            margin-top: 8px;
                        }
                    }

                    .course-status {
                        align-self: flex-end;
                    }
                }
            }
        }

        .todo-card {
            .todo-list {
                .todo-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;

                    .todo-action {
                        align-self: stretch;

                        .el-button {
                            width: 100%;
                        }
                    }
                }
            }
        }
    }
}
</style>
