<template>
    <div class="course-homework">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-info">
                <h2>课程作业</h2>
                <p class="course-name">{{ courseName }}</p>
            </div>
            <div class="header-stats">
                <div class="stat-item">
                    <span class="stat-number">{{ totalHomework }}</span>
                    <span class="stat-label">总作业数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">{{ completedHomework }}</span>
                    <span class="stat-label">已完成</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">{{ averageScore }}%</span>
                    <span class="stat-label">平均成绩</span>
                </div>
            </div>
        </div>

        <!-- 筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <div class="filter-container">
                <el-select v-model="filterStatus" @change="handleFilter" placeholder="作业状态"
                    style="width: 150px; margin-right: 15px;">
                    <el-option label="全部" value="" />
                    <el-option label="待完成" value="pending" />
                    <el-option label="已提交" value="submitted" />
                    <el-option label="已截止" value="overdue" />
                </el-select>
                <el-input v-model="searchKeyword" placeholder="搜索作业名称" style="width: 250px; margin-right: 15px;"
                    @keyup.enter.native="handleFilter" clearable>
                    <i slot="suffix" class="el-icon-search" @click="handleFilter"></i>
                </el-input>
                <el-button type="primary" @click="handleFilter">筛选</el-button>
            </div>
        </el-card>

        <!-- 作业列表 -->
        <div v-loading="loading" class="homework-container">
            <!-- 空状态 -->
            <div v-if="!loading && homeworkList.length === 0" class="empty-state">
                <el-empty description="暂无作业">
                    <el-button type="primary" @click="refreshHomework">刷新列表</el-button>
                </el-empty>
            </div>

            <!-- 作业时间线 -->
            <div v-else class="homework-timeline">
                <el-timeline>
                    <el-timeline-item v-for="homework in homeworkList" :key="homework.id"
                        :timestamp="homework.endTime | parseTime('{m}-{d} {h}:{i}')"
                        :type="getTimelineType(homework.status)" :icon="getTimelineIcon(homework.status)">

                        <el-card class="homework-card" :class="getHomeworkClass(homework)">
                            <div class="homework-header">
                                <h3 class="homework-title">{{ homework.title }}</h3>
                                <el-tag :type="getStatusTagType(homework.status)" size="small">
                                    {{ getStatusText(homework.status) }}
                                </el-tag>
                            </div>

                            <div class="homework-content">
                                <p class="homework-description" v-if="homework.description">
                                    {{ homework.description }}
                                </p>

                                <div class="homework-info">
                                    <div class="info-row">
                                        <i class="el-icon-star"></i>
                                        <span>总分：{{ homework.totalScore / 10 }}分</span>
                                    </div>
                                    <div class="info-row">
                                        <i class="el-icon-time"></i>
                                        <span>截止时间：{{ homework.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                    </div>
                                    <div class="info-row" v-if="homework.submitTime">
                                        <i class="el-icon-check"></i>
                                        <span>提交时间：{{ homework.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                    </div>
                                    <div class="info-row" v-if="homework.score !== null">
                                        <i class="el-icon-trophy"></i>
                                        <span>得分：{{ homework.score / 10 }}分 ({{ Math.round(homework.score /
                                            homework.totalScore * 100) }}%)</span>
                                    </div>

                                    <!-- 显示剩余时间或逾期时间 -->
                                    <div class="info-row" v-if="homework.status === 'pending'">
                                        <i class="el-icon-warning"></i>
                                        <span :class="getTimeRemainingClass(homework.endTime)">
                                            {{ getTimeRemaining(homework.endTime) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="homework-actions">
                                <el-button v-if="homework.status === 'pending'" type="primary"
                                    @click="doHomework(homework)" :disabled="isOverdue(homework.endTime)">
                                    {{ homework.hasStarted ? '继续作业' : '开始作业' }}
                                </el-button>
                                <el-button v-else-if="homework.status === 'submitted'" type="success"
                                    @click="viewResult(homework)">
                                    查看结果
                                </el-button>
                                <el-button v-else type="info" disabled>
                                    已截止
                                </el-button>

                                <!-- 下载附件按钮 -->
                                <el-button v-if="homework.hasAttachment" type="warning" size="small"
                                    @click="downloadAttachment(homework)" plain>
                                    <i class="el-icon-download"></i> 附件
                                </el-button>
                            </div>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="total > 0" class="pagination-container">
            <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
                layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { studentHomeworkList as getCourseHomework } from '@/api/student/homework'
import { getCourse } from '@/api/studentCourse'

export default {
    name: 'StudentCourseHomework',
    data() {
        return {
            courseId: null,
            courseName: '',
            loading: false,
            homeworkList: [],
            totalHomework: 0,
            completedHomework: 0,
            averageScore: 0,
            total: 0,
            pageIndex: 1,
            pageSize: 10,
            filterStatus: '',
            searchKeyword: ''
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.loadCourseInfo()
        this.loadHomework()
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

        async loadHomework() {
            try {
                this.loading = true
                const params = {
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize,
                    status: this.filterStatus,
                    keyword: this.searchKeyword
                }

                const response = await getCourseHomework(this.courseId, params)
                if (response.code === 1) {
                    this.homeworkList = response.response.list || []
                    this.total = response.response.total || 0
                    this.totalHomework = response.response.totalHomework || 0
                    this.completedHomework = response.response.completedHomework || 0
                    this.averageScore = response.response.averageScore || 0
                } else {
                    this.$message.error('加载作业失败')
                }
            } catch (error) {
                this.$message.error('加载作业失败')
            } finally {
                this.loading = false
            }
        },

        handleFilter() {
            this.pageIndex = 1
            this.loadHomework()
        },

        handlePageChange(page) {
            this.pageIndex = page
            this.loadHomework()
        },

        refreshHomework() {
            this.loadHomework()
        },

        doHomework(homework) {
            // 跳转到作业页面，传递课程ID
            this.$router.push({
                path: `/student/homework/answer/${homework.id}`,
                query: { courseId: this.courseId }
            })
        },

        viewResult(homework) {
            // 跳转到结果页面，传递课程ID
            this.$router.push({
                path: `/student/homework/result/${homework.id}`,
                query: { courseId: this.courseId }
            })
        },

        downloadAttachment(homework) {
            // 下载作业附件
            window.open(homework.attachmentUrl, '_blank')
        },

        getHomeworkClass(homework) {
            return {
                'homework-pending': homework.status === 'pending',
                'homework-submitted': homework.status === 'submitted',
                'homework-overdue': homework.status === 'overdue'
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

        getTimelineType(status) {
            const typeMap = {
                'pending': 'warning',
                'submitted': 'success',
                'overdue': 'danger'
            }
            return typeMap[status] || 'info'
        },

        getTimelineIcon(status) {
            const iconMap = {
                'pending': 'el-icon-time',
                'submitted': 'el-icon-check',
                'overdue': 'el-icon-close'
            }
            return iconMap[status] || 'el-icon-document'
        },

        getTimeRemaining(endTime) {
            if (!endTime) return ''

            const now = new Date().getTime()
            const end = new Date(endTime).getTime()
            const diff = end - now

            if (diff <= 0) return '已截止'

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                return `剩余 ${days} 天 ${hours} 小时`
            } else if (hours > 0) {
                return `剩余 ${hours} 小时 ${minutes} 分钟`
            } else {
                return `剩余 ${minutes} 分钟`
            }
        },

        getTimeRemainingClass(endTime) {
            const now = new Date().getTime()
            const end = new Date(endTime).getTime()
            const diff = end - now
            const hours = diff / (1000 * 60 * 60)

            if (hours <= 0) return 'time-overdue'
            if (hours <= 24) return 'time-urgent'
            if (hours <= 72) return 'time-warning'
            return 'time-normal'
        },

        isOverdue(endTime) {
            return new Date() > new Date(endTime)
        }
    }
}
</script>

<style lang="scss" scoped>
.course-homework {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    color: white;

    .header-info h2 {
        margin: 0 0 5px 0;
        font-size: 24px;
    }

    .course-name {
        margin: 0;
        opacity: 0.9;
        font-size: 14px;
    }

    .header-stats {
        display: flex;
        gap: 30px;
    }

    .stat-item {
        text-align: center;

        .stat-number {
            display: block;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 12px;
            opacity: 0.8;
        }
    }
}

.filter-card {
    margin-bottom: 20px;

    .filter-container {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }
}

.homework-container {
    min-height: 400px;
}

.homework-timeline {
    .homework-card {
        margin-bottom: 0;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.homework-pending {
            border-left: 4px solid #e6a23c;
        }

        &.homework-submitted {
            border-left: 4px solid #67c23a;
        }

        &.homework-overdue {
            border-left: 4px solid #f56c6c;
            opacity: 0.8;
        }

        .homework-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;

            .homework-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
                color: #303133;
                flex: 1;
                margin-right: 10px;
            }
        }

        .homework-description {
            color: #606266;
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.5;
        }

        .homework-info {
            .info-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 14px;
                color: #606266;

                i {
                    margin-right: 8px;
                    width: 16px;
                    color: #909399;
                }

                .time-normal {
                    color: #67c23a;
                }

                .time-warning {
                    color: #e6a23c;
                }

                .time-urgent {
                    color: #f56c6c;
                    font-weight: 600;
                }

                .time-overdue {
                    color: #f56c6c;
                    font-weight: 600;
                }
            }
        }

        .homework-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #f0f0f0;
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
}
</style>