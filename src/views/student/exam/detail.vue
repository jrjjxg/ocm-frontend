<template>
    <div class="exam-detail-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <el-button icon="el-icon-arrow-left" @click="goBack" class="back-btn">返回</el-button>
                    <div class="title-section">
                        <h1 class="page-title">{{ exam.title }}</h1>
                        <p class="page-subtitle">考试详情</p>
                    </div>
                </div>
                <div class="header-right">
                    <el-tag :type="getStatusTagType(exam.statusName)" class="status-tag" effect="dark" size="large">
                        {{ getStatusText(exam.statusName) }}
                    </el-tag>
                </div>
            </div>
        </div>

        <!-- 页面内容 -->
        <div v-loading="loading" class="page-content">
            <el-row :gutter="24">
                <!-- 左侧主要内容 -->
                <el-col :lg="16" :md="24">
                    <!-- 考试信息卡片 -->
                    <el-card class="info-card" shadow="hover">
                        <div slot="header" class="card-header">
                            <h3><i class="el-icon-document"></i> 考试信息</h3>
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">考试名称</span>
                                <span class="info-value">{{ exam.title }}</span>
                            </div>
                            <div class="info-item" v-if="exam.description">
                                <span class="info-label">考试说明</span>
                                <span class="info-value">{{ exam.description }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">题目数量</span>
                                <span class="info-value">{{ exam.questionCount }}题</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">考试总分</span>
                                <span class="info-value">{{ exam.totalScore / 10 }}分</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">考试时长</span>
                                <span class="info-value">{{ exam.duration }}分钟</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">开始时间</span>
                                <span class="info-value">{{ exam.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">结束时间</span>
                                <span class="info-value">{{ exam.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">最大提交次数</span>
                                <span class="info-value">{{ exam.maxAttempts }}次</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">已提交次数</span>
                                <span class="info-value">{{ exam.currentAttempts || 0 }}次</span>
                            </div>
                        </div>
                    </el-card>

                    <!-- 考试须知 -->
                    <el-card class="notice-card" shadow="hover">
                        <div slot="header" class="card-header">
                            <h3><i class="el-icon-warning"></i> 考试须知</h3>
                        </div>
                        <div class="notice-content">
                            <ul class="notice-list">
                                <li>考试开始后不能暂停，请确保有足够的时间完成考试</li>
                                <li>考试过程中请勿刷新或关闭页面，否则可能导致答案丢失</li>
                                <li>考试时间到后将自动提交，请合理安排答题时间</li>
                                <li>请保持网络连接稳定，避免因网络问题影响考试</li>
                                <li>考试过程中如遇技术问题，请及时联系老师</li>
                                <li v-if="exam.maxAttempts > 1">本次考试允许提交{{ exam.maxAttempts }}次，系统将记录最高分</li>
                            </ul>
                        </div>
                    </el-card>

                    <!-- 历史记录 -->
                    <el-card v-if="historyRecords.length > 0" class="history-card" shadow="hover">
                        <div slot="header" class="card-header">
                            <h3><i class="el-icon-time"></i> 答题历史</h3>
                        </div>
                        <el-table :data="historyRecords" style="width: 100%">
                            <el-table-column prop="attemptNumber" label="第几次" width="80" align="center">
                                <template slot-scope="scope">
                                    第{{ scope.row.attemptNumber }}次
                                </template>
                            </el-table-column>
                            <el-table-column prop="score" label="得分" width="100" align="center">
                                <template slot-scope="scope">
                                    <span class="score-text" :class="getScoreClass(scope.row.score, exam.totalScore)">
                                        {{ scope.row.score / 10 }}分
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="doTime" label="用时" width="100" align="center">
                                <template slot-scope="scope">
                                    {{ formatDuration(scope.row.doTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="createTime" label="提交时间" align="center">
                                <template slot-scope="scope">
                                    {{ scope.row.createTime | parseTime('{m}-{d} {h}:{i}') }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="100" align="center">
                                <template slot-scope="scope">
                                    <el-button type="text" size="small" @click="viewDetailResult(scope.row)">
                                        查看详情
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>

                <!-- 右侧操作面板 -->
                <el-col :lg="8" :md="24">
                    <el-card class="action-card" shadow="hover">
                        <div slot="header" class="card-header">
                            <h3><i class="el-icon-s-tools"></i> 操作面板</h3>
                        </div>

                        <!-- 当前状态显示 -->
                        <div class="status-section">
                            <div class="status-item">
                                <div class="status-icon" :class="getStatusIconClass(exam.statusName)">
                                    <i :class="getStatusIcon(exam.statusName)"></i>
                                </div>
                                <div class="status-content">
                                    <div class="status-title">{{ getStatusText(exam.statusName) }}</div>
                                    <div class="status-desc">{{ getStatusDescription(exam.statusName) }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- 倒计时 -->
                        <div v-if="exam.statusName === 'ongoing'" class="countdown-section">
                            <div class="countdown-card">
                                <div class="countdown-title">距离考试结束</div>
                                <div class="countdown-time">{{ getCountdown(exam.endTime) }}</div>
                            </div>
                        </div>

                        <!-- 成绩显示 -->
                        <div v-if="exam.statusName === 'completed' && bestScore !== null" class="score-display">
                            <div class="score-card">
                                <div class="score-title">最佳成绩</div>
                                <div class="score-main">
                                    <span class="score-number">{{ bestScore / 10 }}</span>
                                    <span class="score-total">/ {{ exam.totalScore / 10 }}</span>
                                </div>
                                <div class="score-percentage">{{ Math.round(bestScore / exam.totalScore * 100) }}%</div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="action-buttons">
                            <el-button 
                                v-if="exam.statusName === 'not_started'" 
                                type="info" 
                                size="large" 
                                disabled 
                                class="action-btn full-width">
                                <i class="el-icon-time"></i>
                                考试未开始
                            </el-button>
                            
                            <el-button 
                                v-else-if="exam.statusName === 'ongoing'" 
                                type="primary" 
                                size="large" 
                                @click="startExam" 
                                class="action-btn full-width primary-btn">
                                <i class="el-icon-video-play"></i>
                                {{ (exam.currentAttempts || 0) > 0 ? '继续考试' : '开始考试' }}
                            </el-button>
                            
                            <div v-else-if="exam.statusName === 'completed'">
                                <el-button 
                                    v-if="canRetake" 
                                    type="warning" 
                                    size="large" 
                                    @click="startExam" 
                                    class="action-btn full-width">
                                    <i class="el-icon-refresh"></i>
                                    重新考试 ({{ exam.currentAttempts }}/{{ exam.maxAttempts }})
                                </el-button>
                                
                                <el-button 
                                    type="success" 
                                    size="large" 
                                    @click="viewBestResult" 
                                    class="action-btn full-width">
                                    <i class="el-icon-view"></i>
                                    查看最佳成绩
                                </el-button>
                            </div>
                            
                            <el-button 
                                v-else-if="exam.statusName === 'expired'" 
                                type="info" 
                                size="large" 
                                disabled 
                                class="action-btn full-width">
                                <i class="el-icon-close"></i>
                                考试已过期
                            </el-button>
                        </div>

                        <!-- 提示信息 -->
                        <div class="tips-section">
                            <el-alert
                                v-if="exam.statusName === 'ongoing' && timeRemaining < 60"
                                title="考试即将结束，请抓紧时间！"
                                type="warning"
                                :closable="false"
                                show-icon>
                            </el-alert>
                            
                            <el-alert
                                v-if="exam.statusName === 'completed' && !canRetake"
                                title="已达到最大提交次数"
                                type="info"
                                :closable="false"
                                show-icon>
                            </el-alert>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 考试须知对话框 -->
        <el-dialog title="考试须知" :visible.sync="examNoticeDialog.visible" width="500px" :close-on-click-modal="false">
            <div class="exam-notice">
                <div class="notice-item">
                    <h4>考试信息确认</h4>
                    <p>考试名称：{{ exam.title }}</p>
                    <p>考试时长：{{ exam.duration }}分钟</p>
                    <p>题目数量：{{ exam.questionCount }}题</p>
                    <p>总分：{{ exam.totalScore / 10 }}分</p>
                    <p v-if="exam.currentAttempts > 0">这是您第{{ exam.currentAttempts + 1 }}次参加考试</p>
                </div>
                <div class="notice-item">
                    <h4>重要提醒</h4>
                    <ul>
                        <li>考试开始后不能暂停，请确保有足够的时间</li>
                        <li>考试过程中请勿刷新或关闭页面</li>
                        <li>考试时间到后将自动提交</li>
                        <li>请保持网络连接稳定</li>
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
import { getExamDetail, getExamHistoryRecords } from '@/api/student/exam'

export default {
    name: 'StudentExamDetail',
    data() {
        return {
            examId: null,
            courseId: null,
            loading: false,
            exam: {},
            historyRecords: [],
            bestScore: null,
            timeRemaining: 0,
            countdownTimer: null,
            examNoticeDialog: {
                visible: false
            }
        }
    },
    computed: {
        canRetake() {
            return this.exam.statusName === 'completed' && 
                   this.exam.maxAttempts > 1 && 
                   (this.exam.currentAttempts || 0) < this.exam.maxAttempts
        }
    },
    created() {
        this.examId = this.$route.params.id
        this.courseId = this.$route.query.courseId
        this.loadExamDetail()
        this.loadHistoryRecords()
        this.startCountdownTimer()
    },
    beforeDestroy() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer)
        }
    },
    methods: {
        async loadExamDetail() {
            try {
                this.loading = true
                const response = await getExamDetail(this.examId, this.courseId)
                if (response.code === 1) {
                    this.exam = response.response
                    this.calculateTimeRemaining()
                } else {
                    this.$message.error('加载考试详情失败')
                }
            } catch (error) {
                this.$message.error('加载考试详情失败')
            } finally {
                this.loading = false
            }
        },

        async loadHistoryRecords() {
            try {
                const response = await getExamHistoryRecords(this.examId, this.courseId)
                if (response.code === 1) {
                    this.historyRecords = response.response.list || []
                    if (this.historyRecords.length > 0) {
                        this.bestScore = Math.max(...this.historyRecords.map(r => r.score))
                    }
                }
            } catch (error) {
                console.error('加载历史记录失败:', error)
            }
        },

        calculateTimeRemaining() {
            if (this.exam.statusName === 'ongoing' && this.exam.endTime) {
                const endTime = new Date(this.exam.endTime).getTime()
                const now = new Date().getTime()
                this.timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000))
            }
        },

        startCountdownTimer() {
            this.countdownTimer = setInterval(() => {
                this.calculateTimeRemaining()
                if (this.timeRemaining <= 0 && this.exam.statusName === 'ongoing') {
                    this.exam.statusName = 'expired'
                    clearInterval(this.countdownTimer)
                }
            }, 1000)
        },

        startExam() {
            this.examNoticeDialog.visible = true
        },

        confirmStartExam() {
            this.examNoticeDialog.visible = false
            this.$router.push({
                path: `/student/exam/${this.examId}/do`,
                query: {
                    courseId: this.courseId
                }
            })
        },

        viewBestResult() {
            if (this.historyRecords.length > 0) {
                const bestRecord = this.historyRecords.find(r => r.score === this.bestScore)
                this.viewDetailResult(bestRecord)
            }
        },

        viewDetailResult(record) {
            this.$router.push({
                path: `/student/exam/${this.examId}/result`,
                query: {
                    courseId: this.courseId,
                    recordId: record.id
                }
            })
        },

        goBack() {
            this.$router.go(-1)
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

        getStatusDescription(status) {
            const descMap = {
                'not_started': '考试还未开始，请耐心等待',
                'ongoing': '考试正在进行中，可以开始答题',
                'completed': '您已完成此次考试',
                'expired': '考试已过期，无法参加'
            }
            return descMap[status] || ''
        },

        getStatusIcon(status) {
            const iconMap = {
                'not_started': 'el-icon-time',
                'ongoing': 'el-icon-video-play',
                'completed': 'el-icon-circle-check',
                'expired': 'el-icon-circle-close'
            }
            return iconMap[status] || 'el-icon-question'
        },

        getStatusIconClass(status) {
            return `status-${status}`
        },

        getScoreClass(score, totalScore) {
            const percentage = score / totalScore
            if (percentage >= 0.9) return 'excellent'
            if (percentage >= 0.8) return 'good'
            if (percentage >= 0.6) return 'pass'
            return 'fail'
        },

        formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60
            
            if (hours > 0) {
                return `${hours}时${minutes}分${secs}秒`
            } else if (minutes > 0) {
                return `${minutes}分${secs}秒`
            } else {
                return `${secs}秒`
            }
        },

        getCountdown(endTime) {
            const end = new Date(endTime).getTime()
            const now = new Date().getTime()
            const remaining = Math.max(0, Math.floor((end - now) / 1000))
            
            const hours = Math.floor(remaining / 3600)
            const minutes = Math.floor((remaining % 3600) / 60)
            const seconds = remaining % 60
            
            if (hours > 0) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            } else {
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            }
        }
    }
}
</script>

<style scoped>
.exam-detail-page {
    min-height: 100vh;
    background: #f5f5f5;
}

.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    margin-bottom: 2rem;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
}

.title-section h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
}

.title-section p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
}

.status-tag {
    font-size: 1rem;
    padding: 0.5rem 1rem;
}

.page-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.card-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
}

.info-value {
    color: #333;
    font-size: 1rem;
}

.notice-list {
    margin: 0;
    padding-left: 1.5rem;
}

.notice-list li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.status-section {
    margin-bottom: 1.5rem;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.status-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.status-icon.status-not_started {
    background: #909399;
}

.status-icon.status-ongoing {
    background: #e6a23c;
}

.status-icon.status-completed {
    background: #67c23a;
}

.status-icon.status-expired {
    background: #f56c6c;
}

.status-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.status-desc {
    color: #666;
    font-size: 0.9rem;
}

.countdown-section, .score-display {
    margin-bottom: 1.5rem;
}

.countdown-card, .score-card {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
    border-radius: 12px;
    color: white;
}

.score-card {
    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
}

.countdown-title, .score-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
}

.countdown-time {
    font-size: 2rem;
    font-weight: 700;
    font-family: 'Courier New', monospace;
}

.score-main {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.score-total {
    opacity: 0.8;
    font-size: 1.5rem;
}

.score-percentage {
    font-size: 1.1rem;
    opacity: 0.9;
}

.action-buttons {
    margin-bottom: 1.5rem;
}

.action-btn {
    border-radius: 8px;
    font-weight: 600;
}

.full-width {
    width: 100%;
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.tips-section {
    margin-top: 1rem;
}

.score-text.excellent {
    color: #67c23a;
    font-weight: 600;
}

.score-text.good {
    color: #409eff;
    font-weight: 600;
}

.score-text.pass {
    color: #e6a23c;
    font-weight: 600;
}

.score-text.fail {
    color: #f56c6c;
    font-weight: 600;
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .header-left {
        width: 100%;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .page-content {
        padding: 0 1rem 1rem;
    }
}
</style>