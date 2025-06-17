<template>
    <div class="student-exams-modern">
        <!-- 现代化页面头部 -->
        <div class="modern-header">
            <div class="header-background">
                <div class="header-content">
                    <div class="header-left">
                        <div class="course-info">
                            <h1 class="course-title">{{ courseName }}</h1>
                            <p class="course-subtitle">在线测验中心</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="stats-grid">
                            <div class="stat-card total">
                                <div class="stat-icon">
                                    <i class="el-icon-document-copy"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-number">{{ totalExams }}</div>
                                    <div class="stat-label">总测验</div>
                                </div>
                            </div>
                            <div class="stat-card completed">
                                <div class="stat-icon">
                                    <i class="el-icon-circle-check"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-number">{{ completedExams }}</div>
                                    <div class="stat-label">已完成</div>
                                </div>
                            </div>
                            <div class="stat-card average">
                                <div class="stat-icon">
                                    <i class="el-icon-trophy"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-number">{{ averageScore }}%</div>
                                    <div class="stat-label">平均分</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 现代化筛选区域 -->
        <div class="filter-section">
            <el-card class="filter-card-modern" shadow="hover">
                <div class="filter-content">
                    <div class="filter-left">
                        <div class="filter-group">
                            <label class="filter-label">状态筛选</label>
                            <el-select v-model="filterStatus" @change="handleFilter" placeholder="选择状态"
                                class="filter-select">
                                <el-option label="全部测验" value="" />
                                <el-option label="未开始" value="not_started" />
                                <el-option label="进行中" value="ongoing" />
                                <el-option label="已完成" value="completed" />
                                <el-option label="已过期" value="expired" />
                            </el-select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">搜索测验</label>
                            <el-input v-model="searchKeyword" placeholder="输入测验名称..." @keyup.enter.native="handleFilter"
                                clearable class="search-input">
                                <i slot="prefix" class="el-input__icon el-icon-search"></i>
                            </el-input>
                        </div>
                    </div>
                    <div class="filter-right">
                        <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
                        <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 现代化测验列表 -->
        <div v-loading="loading" class="exams-container-modern">
            <!-- 空状态 -->
            <div v-if="!loading && exams.length === 0" class="empty-state-modern">
                <div class="empty-content">
                    <div class="empty-icon">
                        <i class="el-icon-document-copy"></i>
                    </div>
                    <h3>暂无测验</h3>
                    <p>当前课程还没有发布测验，请稍后再来查看</p>
                    <el-button type="primary" icon="el-icon-refresh" @click="refreshExams">刷新列表</el-button>
                </div>
            </div>

            <!-- 现代化测验卡片 -->
            <div v-else class="exams-grid-modern">
                <div v-for="exam in exams" :key="exam.id" class="exam-card-modern"
                    :class="getExamStatusClass(exam.statusName)">
                    <!-- 卡片头部 -->
                    <div class="card-header" @click="viewExamDetail(exam)" style="cursor: pointer;">
                        <div class="header-left">
                            <h3 class="exam-title-modern">{{ exam.title }}</h3>
                            <p class="exam-description-modern" v-if="exam.description">{{ exam.description }}</p>
                        </div>
                        <div class="header-right">
                            <el-tag :type="getStatusTagType(exam.statusName)" class="status-tag" effect="dark">
                                {{ getStatusText(exam.statusName) }}
                            </el-tag>
                        </div>
                    </div>

                    <!-- 卡片内容 -->
                    <div class="card-content">
                        <div class="exam-details">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <div class="detail-icon questions">
                                        <i class="el-icon-document"></i>
                                    </div>
                                    <div class="detail-text">
                                        <span class="detail-label">题目数量</span>
                                        <span class="detail-value">{{ exam.questionCount }}题</span>
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-icon score">
                                        <i class="el-icon-star-on"></i>
                                    </div>
                                    <div class="detail-text">
                                        <span class="detail-label">总分</span>
                                        <span class="detail-value">{{ exam.totalScore / 10 }}分</span>
                                    </div>
                                </div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <div class="detail-icon time">
                                        <i class="el-icon-time"></i>
                                    </div>
                                    <div class="detail-text">
                                        <span class="detail-label">考试时长</span>
                                        <span class="detail-value">{{ exam.duration }}分钟</span>
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-icon date">
                                        <i class="el-icon-date"></i>
                                    </div>
                                    <div class="detail-text">
                                        <span class="detail-label">开始时间</span>
                                        <span class="detail-value">{{ exam.startTime | parseTime('{m}-{d} {h}:{i}')
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 成绩信息 -->
                        <div v-if="exam.statusName === 'completed' && exam.score !== null" class="score-section">
                            <div class="score-card">
                                <div class="score-icon">
                                    <i class="el-icon-trophy"></i>
                                </div>
                                <div class="score-content">
                                    <div class="score-main">
                                        <span class="score-number">{{ exam.score / 10 }}</span>
                                        <span class="score-total">/ {{ exam.totalScore / 10 }}</span>
                                    </div>
                                    <div class="score-percentage">{{ Math.round(exam.score / exam.totalScore * 100) }}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 倒计时 -->
                        <div v-if="exam.statusName === 'ongoing'" class="countdown-section">
                            <div class="countdown-card">
                                <div class="countdown-icon">
                                    <i class="el-icon-timer"></i>
                                </div>
                                <div class="countdown-content">
                                    <span class="countdown-label">剩余时间</span>
                                    <span class="countdown-time">{{ getCountdown(exam.endTime) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 卡片底部操作 -->
                    <div class="card-footer">
                        <div class="action-buttons">
                            <el-button @click="viewExamDetail(exam)" type="text" class="detail-btn">
                                <i class="el-icon-info"></i>
                                查看详情
                            </el-button>
                            
                            <el-button v-if="exam.statusName === 'not_started'" type="info" disabled class="action-btn">
                                <i class="el-icon-time"></i>
                                未开始
                            </el-button>
                            <el-button v-else-if="exam.statusName === 'ongoing'" type="primary" @click="startExam(exam)"
                                class="action-btn primary">
                                <i class="el-icon-video-play"></i>
                                开始考试
                            </el-button>
                            <el-button v-else-if="exam.statusName === 'completed'" type="success" @click="viewResult(exam)"
                                class="action-btn success">
                                <i class="el-icon-view"></i>
                                查看成绩
                            </el-button>
                            <el-button v-else-if="exam.statusName === 'expired'" type="info" disabled class="action-btn">
                                <i class="el-icon-close"></i>
                                已过期
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="total > 0" class="pagination-container">
            <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
                layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <!-- 考试须知对话框 -->
        <el-dialog title="考试须知" :visible.sync="examNoticeDialog.visible" width="500px" :close-on-click-modal="false">
            <div class="exam-notice">
                <div class="notice-item">
                    <h4>考试信息</h4>
                    <p>考试名称：{{ examNoticeDialog.exam.title }}</p>
                    <p>考试时长：{{ examNoticeDialog.exam.duration }}分钟</p>
                    <p>题目数量：{{ examNoticeDialog.exam.questionCount }}题</p>
                    <p>总分：{{ examNoticeDialog.exam.totalScore / 10 }}分</p>
                </div>
                <div class="notice-item">
                    <h4>注意事项</h4>
                    <ul>
                        <li>考试开始后不能暂停，请确保有足够的时间</li>
                        <li>考试过程中请勿刷新或关闭页面</li>
                        <li>考试时间到后将自动提交</li>
                        <li>请保持网络连接稳定</li>
                        <li>考试过程中如遇技术问题，请及时联系老师</li>
                    </ul>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="examNoticeDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="confirmStartExam">开始考试</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getStudentExams } from '@/api/student/exam'
import { getCourse } from '@/api/studentCourse'

export default {
    name: 'StudentCourseExams',
    data() {
        return {
            courseId: null,
            courseName: '',
            loading: false,
            exams: [],
            totalExams: 0,
            completedExams: 0,
            averageScore: 0,
            total: 0,
            pageIndex: 1,
            pageSize: 12,
            filterStatus: '',
            searchKeyword: '',
            examNoticeDialog: {
                visible: false,
                exam: {}
            },
            countdownTimer: null
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.loadCourseInfo()
        this.loadExams()
        this.startCountdownTimer()
    },
    beforeDestroy() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer)
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

        async loadExams() {
            try {
                this.loading = true
                const params = {
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize,
                    status: this.filterStatus,
                    keyword: this.searchKeyword
                }

                const response = await getStudentExams(this.courseId, params)
                if (response.code === 1) {
                    this.exams = response.response.list || []
                    this.total = response.response.total || 0
                    this.totalExams = response.response.totalExams || 0
                    this.completedExams = response.response.completedExams || 0
                    this.averageScore = response.response.averageScore || 0
                } else {
                    this.$message.error('加载测验失败')
                }
            } catch (error) {
                this.$message.error('加载测验失败')
            } finally {
                this.loading = false
            }
        },

        handleFilter() {
            this.pageIndex = 1
            this.loadExams()
        },

        resetFilter() {
            this.filterStatus = ''
            this.searchKeyword = ''
            this.pageIndex = 1
            this.loadExams()
        },

        handlePageChange(page) {
            this.pageIndex = page
            this.loadExams()
        },

        refreshExams() {
            this.loadExams()
        },

        startExam(exam) {
            // 检查考试状态
            if (exam.statusName === 'completed') {
                this.$message.warning('您已经完成这次考试，请查看成绩')
                return
            }
            if (exam.statusName === 'not_started') {
                this.$message.warning('考试还未开始')
                return
            }
            if (exam.statusName === 'expired') {
                this.$message.warning('考试已过期')
                return
            }

            this.examNoticeDialog.exam = exam
            this.examNoticeDialog.visible = true
        },

        confirmStartExam() {
            const exam = this.examNoticeDialog.exam
            this.examNoticeDialog.visible = false

            // 跳转到考试页面，使用正确的路径参数
            this.$router.push({
                path: `/student/exam/${exam.id}/do`,
                query: {
                    courseId: this.courseId,
                    examId: exam.id,
                    id: exam.id  // 保持兼容性
                }
            })
        },

        viewResult(exam) {
            // 跳转到成绩查看页面
            this.$router.push({
                path: `/student/exam/${exam.id}/result`,
                query: { courseId: this.courseId }
            })
        },

        viewExamDetail(exam) {
            // 跳转到考试详情页面
            this.$router.push({
                path: `/student/exam/${exam.id}/detail`,
                query: { courseId: this.courseId }
            })
        },

        getExamStatusClass(status) {
            return `exam-status-${status}`
        },

        getStatusText(status) {
            const statusMap = {
                'not_started': '未开始',
                'ongoing': '进行中',
                'completed': '已完成',
                'expired': '已过期'
            }
            return statusMap[status] || '未知'
        },

        getStatusTagType(status) {
            const typeMap = {
                'not_started': 'info',
                'ongoing': 'warning',
                'completed': 'success',
                'expired': 'danger'
            }
            return typeMap[status] || 'info'
        },

        getCountdown(endTime) {
            if (!endTime) return ''

            const now = new Date().getTime()
            const end = new Date(endTime).getTime()
            const diff = end - now

            if (diff <= 0) return '已结束'

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (hours > 0) {
                return `${hours}时${minutes}分${seconds}秒`
            } else if (minutes > 0) {
                return `${minutes}分${seconds}秒`
            } else {
                return `${seconds}秒`
            }
        },

        startCountdownTimer() {
            this.countdownTimer = setInterval(() => {
                // 强制更新倒计时显示
                this.$forceUpdate()
            }, 1000)
        }
    }
}
</script>

<style lang="scss" scoped>
.student-exams-modern {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 0;
}

// 现代化头部样式
.modern-header {
    margin-bottom: 30px;

    .header-background {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        border-radius: 0 0 30px 30px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 30px;
        }

        .header-left {
            .course-info {
                .course-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 8px 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .course-subtitle {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                }
            }
        }

        .header-right {
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;

                .stat-card {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(255, 255, 255, 0.2);
                        transform: translateY(-2px);
                    }

                    .stat-icon {
                        width: 50px;
                        height: 50px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: white;

                        &.total {
                            background: rgba(52, 152, 219, 0.8);
                        }

                        &.completed {
                            background: rgba(46, 204, 113, 0.8);
                        }

                        &.average {
                            background: rgba(241, 196, 15, 0.8);
                        }
                    }

                    .stat-content {
                        .stat-number {
                            font-size: 24px;
                            font-weight: 700;
                            color: white;
                            line-height: 1;
                            margin-bottom: 4px;
                        }

                        .stat-label {
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.8);
                            line-height: 1;
                        }
                    }
                }
            }
        }
    }
}

// 现代化筛选区域
.filter-section {
    max-width: 1200px;
    margin: 0 auto 30px auto;
    padding: 0 30px;

    .filter-card-modern {
        border-radius: 16px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        .filter-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 20px;

            .filter-left {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;

                .filter-group {
                    .filter-label {
                        display: block;
                        font-size: 14px;
                        font-weight: 600;
                        color: #606266;
                        margin-bottom: 8px;
                    }

                    .filter-select,
                    .search-input {
                        width: 200px;
                    }
                }
            }

            .filter-right {
                display: flex;
                gap: 10px;
            }
        }
    }
}

// 现代化测验容器
.exams-container-modern {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
    min-height: 400px;
}

// 空状态样式
.empty-state-modern {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;

    .empty-content {
        text-align: center;

        .empty-icon {
            font-size: 80px;
            color: #c0c4cc;
            margin-bottom: 20px;
        }

        h3 {
            font-size: 20px;
            color: #606266;
            margin: 0 0 10px 0;
        }

        p {
            color: #909399;
            margin: 0 0 30px 0;
        }
    }
}

// 现代化测验网格
.exams-grid-modern {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
}

// 现代化测验卡片
.exam-card-modern {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #f0f0f0;
    position: relative;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    // 状态指示器
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: #e4e7ed;
    }

    &.exam-status-ongoing::before {
        background: linear-gradient(90deg, #f39c12, #e67e22);
    }

    &.exam-status-completed::before {
        background: linear-gradient(90deg, #27ae60, #2ecc71);
    }

    &.exam-status-expired::before {
        background: linear-gradient(90deg, #e74c3c, #c0392b);
    }

    &.exam-status-not_started::before {
        background: linear-gradient(90deg, #95a5a6, #7f8c8d);
    }

    // 卡片头部
    .card-header {
        padding: 24px 24px 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;

        .header-left {
            flex: 1;

            .exam-title-modern {
                font-size: 20px;
                font-weight: 700;
                color: #2c3e50;
                margin: 0 0 8px 0;
                line-height: 1.3;
            }

            .exam-description-modern {
                font-size: 14px;
                color: #7f8c8d;
                margin: 0;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        }

        .header-right {
            .status-tag {
                border-radius: 20px;
                font-weight: 600;
                font-size: 12px;
                padding: 6px 12px;
            }
        }
    }

    // 卡片内容
    .card-content {
        padding: 0 24px 16px 24px;

        .exam-details {
            .detail-row {
                display: flex;
                gap: 16px;
                margin-bottom: 16px;

                &:last-child {
                    margin-bottom: 0;
                }

                .detail-item {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 12px;

                    .detail-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        color: white;

                        &.questions {
                            background: linear-gradient(135deg, #3498db, #2980b9);
                        }

                        &.score {
                            background: linear-gradient(135deg, #f39c12, #e67e22);
                        }

                        &.time {
                            background: linear-gradient(135deg, #9b59b6, #8e44ad);
                        }

                        &.date {
                            background: linear-gradient(135deg, #1abc9c, #16a085);
                        }
                    }

                    .detail-text {
                        .detail-label {
                            display: block;
                            font-size: 12px;
                            color: #7f8c8d;
                            margin-bottom: 2px;
                        }

                        .detail-value {
                            font-size: 14px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                    }
                }
            }
        }

        // 成绩区域
        .score-section {
            margin-top: 20px;

            .score-card {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                border-radius: 16px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                color: white;

                .score-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .score-content {
                    .score-main {
                        .score-number {
                            font-size: 28px;
                            font-weight: 700;
                        }

                        .score-total {
                            font-size: 16px;
                            opacity: 0.8;
                        }
                    }

                    .score-percentage {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-top: 4px;
                    }
                }
            }
        }

        // 倒计时区域
        .countdown-section {
            margin-top: 20px;

            .countdown-card {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                border-radius: 16px;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;

                .countdown-icon {
                    font-size: 20px;
                }

                .countdown-content {
                    .countdown-label {
                        display: block;
                        font-size: 12px;
                        opacity: 0.9;
                        margin-bottom: 2px;
                    }

                    .countdown-time {
                        font-size: 16px;
                        font-weight: 700;
                    }
                }
            }
        }
    }

    // 卡片底部
    .card-footer {
        padding: 16px 24px 24px 24px;

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .detail-btn {
                color: #667eea;
                font-weight: 600;
                padding: 8px 16px;
                border-radius: 8px;
                transition: all 0.3s ease;
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.2);

                &:hover {
                    background: rgba(102, 126, 234, 0.2);
                    color: #5a67d8;
                }

                i {
                    margin-right: 6px;
                }
            }

            .action-btn {
                width: 100%;
                height: 44px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 14px;

                &.primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;

                    &:hover {
                        background: linear-gradient(135deg, #5a6fd8, #6a4190);
                    }
                }

                &.success {
                    background: linear-gradient(135deg, #27ae60, #2ecc71);
                    border: none;

                    &:hover {
                        background: linear-gradient(135deg, #229954, #28b463);
                    }
                }
            }
        }
    }
}

// 分页容器
.pagination-container {
    display: flex;
    justify-content: center;
    margin: 40px auto 30px auto;
    max-width: 1200px;
    padding: 0 30px;
}

// 考试须知对话框
.exam-notice {
    .notice-item {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        h4 {
            margin: 0 0 12px 0;
            color: #2c3e50;
            font-size: 16px;
            font-weight: 600;
        }

        p {
            margin: 8px 0;
            color: #606266;
            line-height: 1.6;
        }

        ul {
            margin: 12px 0;
            padding-left: 20px;

            li {
                color: #606266;
                margin-bottom: 8px;
                line-height: 1.6;
                position: relative;

                &::marker {
                    color: #667eea;
                }
            }
        }
    }
}

.dialog-footer {
    text-align: center;
    padding-top: 20px;
}

// 响应式设计
@media (max-width: 768px) {
    .student-exams-modern {
        .modern-header {
            .header-background {
                padding: 30px 20px;
                border-radius: 0 0 20px 20px;

                .header-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 20px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                    width: 100%;
                    max-width: 300px;
                }
            }
        }

        .filter-section {
            padding: 0 20px;

            .filter-content {
                flex-direction: column;
                align-items: stretch;

                .filter-left {
                    flex-direction: column;
                    gap: 16px;

                    .filter-group {

                        .filter-select,
                        .search-input {
                            width: 100%;
                        }
                    }
                }

                .filter-right {
                    justify-content: center;
                }
            }
        }

        .exams-container-modern {
            padding: 0 20px;

            .exams-grid-modern {
                grid-template-columns: 1fr;
                gap: 16px;
            }
        }

        .pagination-container {
            padding: 0 20px;
        }
    }
}

@media (max-width: 480px) {
    .student-exams-modern {
        .modern-header {
            .header-background {
                .header-left {
                    .course-info {
                        .course-title {
                            font-size: 24px;
                        }

                        .course-subtitle {
                            font-size: 14px;
                        }
                    }
                }

                .stats-grid {
                    .stat-card {
                        padding: 16px;

                        .stat-icon {
                            width: 40px;
                            height: 40px;
                            font-size: 20px;
                        }

                        .stat-content {
                            .stat-number {
                                font-size: 20px;
                            }
                        }
                    }
                }
            }
        }

        .exam-card-modern {
            .card-header {
                padding: 20px 20px 12px 20px;

                .header-left {
                    .exam-title-modern {
                        font-size: 18px;
                    }
                }
            }

            .card-content {
                padding: 0 20px 12px 20px;

                .exam-details {
                    .detail-row {
                        flex-direction: column;
                        gap: 12px;

                        .detail-item {
                            .detail-icon {
                                width: 32px;
                                height: 32px;
                                font-size: 14px;
                            }
                        }
                    }
                }
            }

            .card-footer {
                padding: 12px 20px 20px 20px;
            }
        }
    }
}
</style>