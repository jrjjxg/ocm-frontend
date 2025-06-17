<template>
    <div class="student-homework-list">
        <!-- 页面头部 -->
        <div class="page-header">
            <h1>我的作业</h1>
            <p class="header-desc">完成老师布置的作业任务</p>
        </div>

        <!-- 筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <div class="filter-container">
                <el-select v-model="filterStatus" placeholder="作业状态" style="width: 150px; margin-right: 15px;">
                    <el-option label="全部" value="" />
                    <el-option label="待完成" value="pending" />
                    <el-option label="已提交" value="submitted" />
                    <el-option label="已截止" value="overdue" />
                </el-select>
                <el-select v-model="filterCourse" placeholder="选择课程" style="width: 200px; margin-right: 15px;">
                    <el-option label="全部课程" value="" />
                    <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
                </el-select>
                <el-button type="primary" @click="handleFilter">筛选</el-button>
            </div>
        </el-card>

        <!-- 作业列表 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="homeworkList.length === 0" class="empty-container">
            <el-empty description="暂无作业">
                <el-button type="primary" @click="refreshList">刷新列表</el-button>
            </el-empty>
        </div>

        <div v-else class="homework-grid">
            <div v-for="homework in homeworkList" :key="homework.id" class="homework-card"
                :class="getCardClass(homework)" @click="handleHomeworkAction(homework)">
                <div class="card-header">
                    <h3 class="homework-title">{{ homework.title }}</h3>
                    <el-tag :type="getStatusTagType(homework.status)" size="small">
                        {{ getStatusText(homework.status) }}
                    </el-tag>
                </div>

                <div class="homework-info">
                    <div class="info-row">
                        <i class="el-icon-folder"></i>
                        <span>{{ homework.courseName }}</span>
                    </div>
                    <div class="info-row">
                        <i class="el-icon-star"></i>
                        <span>总分：{{ homework.totalScore }}分</span>
                    </div>
                    <div class="info-row">
                        <i class="el-icon-time"></i>
                        <span>截止：{{ homework.endTime | parseTime('{m}-{d} {h}:{i}') }}</span>
                    </div>
                    <div class="info-row" v-if="homework.submitTime">
                        <i class="el-icon-check"></i>
                        <span>提交时间：{{ homework.submitTime | parseTime('{m}-{d} {h}:{i}') }}</span>
                    </div>
                    <div class="info-row" v-if="homework.score !== null && homework.score !== undefined">
                        <i class="el-icon-trophy"></i>
                        <span>得分：{{ homework.score || 0 }}分 ({{ Math.round((homework.score || 0) / homework.totalScore *
                            100) || 0 }}%)</span>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="progress-info" v-if="homework.status === 'pending'">
                        <span class="time-remaining">{{ getTimeRemaining(homework.endTime) }}</span>
                    </div>
                    <el-button :type="getButtonType(homework.status)" size="small"
                        :disabled="homework.status === 'overdue'">
                        {{ getActionText(homework.status) }}
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
            <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
                layout="total, prev, pager, next" :total="total" />
        </div>
    </div>
</template>

<script>
import { studentHomeworkList } from '@/api/student/homework'
import { studentCourseList } from '@/api/studentCourse'

export default {
    name: 'StudentHomeworkList',
    data() {
        return {
            loading: true,
            homeworkList: [],
            courses: [],
            total: 0,
            pageIndex: 1,
            pageSize: 12,
            filterStatus: '',
            filterCourse: ''
        }
    },
    created() {
        this.loadCourses()
        this.loadHomeworkList()
    },
    methods: {
        async loadCourses() {
            try {
                const response = await studentCourseList()
                this.courses = response.data || []
            } catch (error) {
                console.error('加载课程列表失败:', error)
            }
        },

        async loadHomeworkList() {
            try {
                this.loading = true

                // 如果没有选择特定课程，获取所有课程的作业
                if (!this.filterCourse) {
                    // 获取所有课程的作业
                    let allHomework = []
                    for (const course of this.courses) {
                        try {
                            const params = {
                                pageIndex: 1,
                                pageSize: 100, // 获取更多数据
                                status: this.filterStatus
                            }
                            const response = await studentHomeworkList(course.id, params)
                            if (response.data?.list) {
                                // 为每个作业添加课程信息
                                const homeworkWithCourse = response.data.list.map(hw => ({
                                    ...hw,
                                    courseId: course.id,
                                    courseName: course.name
                                }))
                                allHomework = allHomework.concat(homeworkWithCourse)
                            }
                        } catch (error) {
                            console.warn(`获取课程 ${course.name} 的作业失败:`, error)
                        }
                    }

                    // 分页处理
                    this.total = allHomework.length
                    const startIndex = (this.pageIndex - 1) * this.pageSize
                    const endIndex = startIndex + this.pageSize
                    this.homeworkList = allHomework.slice(startIndex, endIndex)
                } else {
                    // 获取特定课程的作业
                    const params = {
                        pageIndex: this.pageIndex,
                        pageSize: this.pageSize,
                        status: this.filterStatus
                    }
                    const response = await studentHomeworkList(this.filterCourse, params)
                    this.homeworkList = response.data?.list || []
                    this.total = response.data?.total || 0

                    // 添加课程名称
                    const course = this.courses.find(c => c.id == this.filterCourse)
                    if (course) {
                        this.homeworkList = this.homeworkList.map(hw => ({
                            ...hw,
                            courseId: course.id,
                            courseName: course.name
                        }))
                    }
                }
            } catch (error) {
                this.$message.error('加载作业列表失败')
                this.homeworkList = []
            } finally {
                this.loading = false
            }
        },

        handleFilter() {
            this.pageIndex = 1
            this.loadHomeworkList()
        },

        handlePageChange(page) {
            this.pageIndex = page
            this.loadHomeworkList()
        },

        refreshList() {
            this.loadHomeworkList()
        },

        handleHomeworkAction(homework) {
            if (homework.status === 'overdue') {
                this.$message.warning('作业已截止，无法提交')
                return
            }

            if (homework.status === 'submitted') {
                // 查看已提交的作业
                this.$router.push(`/student/homework/result/${homework.id}`)
            } else {
                // 开始做作业 - 使用全屏布局
                this.$router.push({
                    path: `/fullscreen/homework/answer/${homework.id}`,
                    query: { courseId: homework.courseId }
                })
            }
        },

        getCardClass(homework) {
            return {
                'pending': homework.status === 'pending',
                'submitted': homework.status === 'submitted',
                'overdue': homework.status === 'overdue'
            }
        },

        getStatusText(status) {
            const statusMap = {
                'pending': '待完成',
                'submitted': '已提交',
                'overdue': '已截止'
            }
            return statusMap[status] || '未知'
        },

        getStatusTagType(status) {
            const typeMap = {
                'pending': 'warning',
                'submitted': 'success',
                'overdue': 'danger'
            }
            return typeMap[status] || 'info'
        },

        getButtonType(status) {
            if (status === 'pending') return 'primary'
            if (status === 'submitted') return 'success'
            return 'info'
        },

        getActionText(status) {
            if (status === 'pending') return '开始作业'
            if (status === 'submitted') return '查看结果'
            return '已截止'
        },

        getTimeRemaining(endTime) {
            const end = new Date(endTime).getTime()
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                return '已截止'
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

            if (days > 0) {
                return `剩余${days}天${hours}小时`
            } else if (hours > 0) {
                return `剩余${hours}小时`
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                return `剩余${minutes}分钟`
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.student-homework-list {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.page-header {
    margin-bottom: 20px;

    h1 {
        margin: 0 0 5px 0;
        color: #303133;
        font-size: 28px;
        font-weight: 600;
    }

    .header-desc {
        margin: 0;
        color: #606266;
        font-size: 14px;
    }
}

.filter-card {
    margin-bottom: 20px;

    .filter-container {
        display: flex;
        align-items: center;
    }
}

.loading-container,
.empty-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.homework-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .homework-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
        cursor: pointer;
        border-left: 4px solid #e4e7ed;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.15);
        }

        &.pending {
            border-left-color: #e6a23c;
        }

        &.submitted {
            border-left-color: #67c23a;
        }

        &.overdue {
            border-left-color: #f56c6c;
            opacity: 0.7;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;

            .homework-title {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                line-height: 1.4;
                margin: 0;
                flex: 1;
                margin-right: 10px;
            }
        }

        .homework-info {
            margin-bottom: 15px;

            .info-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 14px;
                color: #606266;

                i {
                    margin-right: 8px;
                    color: #909399;
                }
            }
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .progress-info {
                .time-remaining {
                    font-size: 12px;
                    color: #e6a23c;
                    font-weight: 500;
                }
            }
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .student-homework-list {
        padding: 15px;
    }

    .homework-grid {
        grid-template-columns: 1fr;
    }

    .filter-container {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;

        .el-select,
        .el-button {
            width: 100%;
        }
    }
}
</style>