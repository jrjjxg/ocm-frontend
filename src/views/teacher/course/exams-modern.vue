<template>
    <div class="modern-exams-container">
        <!-- 现代化页面头部 -->
        <div class="page-header-modern">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">测验管理</h1>
                    <p class="page-subtitle">创建和管理课程测验，查看学生成绩</p>
                </div>
                <div class="header-actions">
                    <el-button type="primary" icon="el-icon-plus" @click="handleAddExam" size="medium">
                        创建新测验
                    </el-button>
                    <el-button type="success" icon="el-icon-document" @click="goToPapers" size="medium">
                        试卷管理
                    </el-button>
                    <el-button type="info" icon="el-icon-collection" @click="goToQuestionBank" size="medium">
                        题库管理
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 统计卡片区域 -->
        <div class="stats-section" v-if="examStats.length > 0">
            <div class="stats-grid">
                <div v-for="(stat, index) in examStats" :key="index" class="stat-card-modern"
                    @click="handleViewResults(stat)">，
                    <div class="stat-header">
                        <div class="stat-icon" :class="getStatusClass(stat.status)">
                            <i :class="getStatusIcon(stat.status)"></i>
                        </div>
                        <el-tag :type="getStatusType(stat.status)" size="small" class="stat-status">
                            {{ getStatusText(stat.status) }}
                        </el-tag>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-title">{{ stat.title }}</h3>
                        <div class="stat-metrics">
                            <div class="metric">
                                <span class="metric-value">{{ stat.submitCount }}</span>
                                <span class="metric-label">已参与</span>
                            </div>
                            <div class="metric-divider">/</div>
                            <div class="metric">
                                <span class="metric-value">{{ stat.totalCount }}</span>
                                <span class="metric-label">总人数</span>
                            </div>
                        </div>
                        <div class="stat-progress">
                            <el-progress :percentage="calculatePercentage(stat.submitCount, stat.totalCount)"
                                :stroke-width="6" :show-text="false"
                                :color="getProgressColor(stat.status)"></el-progress>
                        </div>
                        <div class="stat-footer">
                            <span class="stat-date">{{ formatDate(stat.endTime) }}</span>
                            <span class="stat-percentage">{{ calculatePercentage(stat.submitCount, stat.totalCount)
                                }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 测验列表 -->
        <div class="exams-list-section">
            <el-card class="list-card" shadow="hover">
                <div slot="header" class="card-header">
                    <span class="card-title">所有测验</span>
                    <el-button type="text" icon="el-icon-refresh" @click="fetchExams">刷新</el-button>
                </div>

                <div v-loading="loading" class="exams-table-container">
                    <el-table :data="exams" style="width: 100%" class="modern-table">
                        <el-table-column prop="title" label="测验标题" min-width="200">
                            <template slot-scope="scope">
                                <div class="exam-title-cell">
                                    <h4>{{ scope.row.title }}</h4>
                                    <p v-if="scope.row.description">{{ scope.row.description }}</p>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="时间安排" width="280">
                            <template slot-scope="scope">
                                <div class="time-cell">
                                    <div class="time-item">
                                        <i class="el-icon-time"></i>
                                        <span>{{ scope.row.startTime }}</span>
                                    </div>
                                    <div class="time-item">
                                        <i class="el-icon-timer"></i>
                                        <span>{{ scope.row.duration }}分钟</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="参与情况" width="120" align="center">
                            <template slot-scope="scope">
                                <div class="participation-cell">
                                    <div class="participation-number">
                                        {{ scope.row.submitCount }}/{{ scope.row.totalCount }}
                                    </div>
                                    <el-progress
                                        :percentage="calculatePercentage(scope.row.submitCount, scope.row.totalCount)"
                                        :stroke-width="4" :show-text="false"
                                        class="participation-progress"></el-progress>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="status" label="状态" width="100" align="center">
                            <template slot-scope="scope">
                                <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                                    {{ getStatusText(scope.row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="200" align="center">
                            <template slot-scope="scope">
                                <div class="action-buttons">
                                    <el-button size="mini" type="primary" icon="el-icon-view"
                                        @click="handleViewResults(scope.row)">
                                        成绩
                                    </el-button>
                                    <el-button size="mini" icon="el-icon-edit" @click="handleEditExam(scope.row)">
                                        编辑
                                    </el-button>
                                    <el-button size="mini" type="danger" icon="el-icon-delete"
                                        @click="handleDeleteExam(scope.row)">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-card>
        </div>

        <!-- 创建/编辑测验对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false"
            class="modern-dialog">
            <el-form :model="examForm" :rules="rules" ref="examForm" label-width="120px" class="modern-form">
                <el-form-item label="测验标题" prop="title">
                    <el-input v-model="examForm.title" placeholder="请输入测验标题"></el-input>
                </el-form-item>

                <el-form-item label="测验说明" prop="description">
                    <el-input type="textarea" :rows="3" v-model="examForm.description"
                        placeholder="请输入测验说明（可选）"></el-input>
                </el-form-item>

                <el-form-item label="测验类型" prop="examType">
                    <el-radio-group v-model="examForm.examType" @change="handleExamTypeChange">
                        <el-radio label="flexible">
                            <div class="exam-type-option">
                                <div class="option-title">开放式测验</div>
                                <div class="option-desc">学生可在指定时间范围内任意时间开始答题</div>
                            </div>
                        </el-radio>
                        <el-radio label="fixed">
                            <div class="exam-type-option">
                                <div class="option-title">定时测验</div>
                                <div class="option-desc">所有学生必须在指定时间统一开考</div>
                            </div>
                        </el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="时间设置" prop="timeRange">
                    <div class="time-setting-container">
                        <div class="time-input-group">
                            <label class="time-label">{{ examForm.examType === 'flexible' ? '开放时间范围' : '考试时间' }}</label>
                            <el-date-picker v-model="examForm.timeRange" type="datetimerange" range-separator="至"
                                start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"
                                style="width: 100%" @change="handleTimeRangeChange">
                            </el-date-picker>
                        </div>

                        <div class="duration-input-group">
                            <label class="time-label">考试时长</label>
                            <div class="duration-controls">
                                <el-input-number v-model="examForm.duration" :min="1" :max="300"
                                    controls-position="right" style="width: 120px" @change="handleDurationChange">
                                </el-input-number>
                                <span style="margin-left: 10px; color: #999;">分钟</span>
                                <el-button type="text" size="small" @click="autoAdjustTime" style="margin-left: 10px;"
                                    v-if="timeConflict">
                                    自动调整
                                </el-button>
                            </div>
                        </div>

                        <div v-if="timeConflict" class="time-conflict-warning">
                            <i class="el-icon-warning"></i>
                            <span>{{ timeConflictMessage }}</span>
                        </div>

                        <div v-if="timeInfo" class="time-info">
                            <i class="el-icon-info"></i>
                            <span>{{ timeInfo }}</span>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="试卷选择" prop="paperId">
                    <div class="paper-select-group">
                        <el-select v-model="examForm.paperId" placeholder="请选择试卷" style="flex: 1">
                            <el-option v-for="item in paperOptions" :key="item.id" :label="item.name"
                                :value="item.id"></el-option>
                        </el-select>
                        <el-button type="text" @click="goToCreatePaper" style="margin-left: 10px;">
                            创建新试卷
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="考试规则">
                    <div class="rules-group">
                        <el-checkbox v-model="examForm.showResult">考试后立即显示成绩</el-checkbox>
                    </div>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitExamForm" :loading="submitting">
                    {{ isEdit ? '更新' : '创建' }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import teacherExamApi from '@/api/teacherExam'
import { formatDate } from '@/utils'

export default {
    name: 'ModernExams',
    props: {
        courseId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            loading: false,
            submitting: false,
            exams: [],
            examStats: [],
            dialogVisible: false,
            dialogTitle: '创建新测验',
            isEdit: false,
            currentExamId: null,
            examForm: {
                title: '',
                description: '',
                examType: 'flexible', // 'flexible' 开放式, 'fixed' 定时
                timeRange: [],
                duration: 60,
                paperId: '',
                showResult: true
            },
            timeConflict: false,
            timeConflictMessage: '',
            timeInfo: '',
            rules: {
                title: [
                    { required: true, message: '请输入测验标题', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                timeRange: [
                    { type: 'array', required: true, message: '请选择时间范围', trigger: 'change' }
                ],
                duration: [
                    { required: true, message: '请设置考试时长', trigger: 'blur' }
                ],
                paperId: [
                    { required: true, message: '请选择试卷', trigger: 'change' }
                ]
            },
            paperOptions: []
        }
    },
    created() {
        this.fetchExams()
        this.fetchPapers()
        this.fetchRecentExamsStats()
    },
    methods: {
        formatDate,

        async fetchExams() {
            try {
                this.loading = true
                const response = await teacherExamApi.getExamList(this.courseId)
                if (response.code === 1) {
                    this.exams = response.response
                } else {
                    this.$message.error(response.message || '获取测验列表失败')
                }
            } catch (error) {
                this.$message.error('网络错误，请稍后重试')
            } finally {
                this.loading = false
            }
        },

        async fetchPapers() {
            try {
                const response = await teacherExamApi.getPaperList(this.courseId)
                if (response.code === 1) {
                    this.paperOptions = response.response
                }
            } catch (error) {
                console.error('获取试卷列表失败:', error)
            }
        },

        async fetchRecentExamsStats() {
            try {
                const response = await teacherExamApi.getExamList(this.courseId)
                if (response.code === 1) {
                    this.examStats = response.response.slice(0, 3)
                }
            } catch (error) {
                console.error('获取统计数据失败:', error)
            }
        },

        calculatePercentage(submit, total) {
            if (total === 0) return 0
            return Math.round((submit / total) * 100)
        },

        getProgressColor(status) {
            const colors = {
                0: '#909399', // 未开始
                1: '#67C23A', // 进行中
                2: '#409EFF'  // 已结束
            }
            return colors[status] || '#909399'
        },

        getStatusType(status) {
            const types = {
                0: 'info',    // 未开始
                1: 'success', // 进行中
                2: 'warning'  // 已结束
            }
            return types[status] || 'info'
        },

        getStatusText(status) {
            const texts = {
                0: '未开始',
                1: '进行中',
                2: '已结束'
            }
            return texts[status] || '未知'
        },

        getStatusClass(status) {
            const classes = {
                0: 'status-pending',
                1: 'status-active',
                2: 'status-finished'
            }
            return classes[status] || 'status-pending'
        },

        getStatusIcon(status) {
            const icons = {
                0: 'el-icon-time',
                1: 'el-icon-video-play',
                2: 'el-icon-check'
            }
            return icons[status] || 'el-icon-time'
        },

        handleAddExam() {
            this.dialogTitle = '创建新测验'
            this.isEdit = false
            this.currentExamId = null
            this.resetForm()
            this.dialogVisible = true
        },

        async handleEditExam(row) {
            this.dialogTitle = '编辑测验'
            this.isEdit = true
            this.currentExamId = row.id

            try {
                const response = await teacherExamApi.getExam(this.courseId, row.id)
                if (response.code === 1) {
                    const exam = response.response
                    this.examForm = {
                        title: exam.title,
                        description: exam.description || '',
                        timeRange: [exam.startTime, exam.endTime],
                        duration: exam.duration,
                        paperId: exam.paperId,
                        showResult: exam.showResult !== undefined ? exam.showResult : true
                    }
                } else {
                    this.$message.error(response.message || '获取测验详情失败')
                }
            } catch (error) {
                this.$message.error('网络错误，请稍后重试')
            }

            this.dialogVisible = true
        },

        handleDeleteExam(row) {
            this.$confirm('确认删除该测验吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await teacherExamApi.deleteExam(this.courseId, row.id)
                    if (response.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchExams()
                        this.fetchRecentExamsStats()
                    } else {
                        this.$message.error(response.message || '删除失败')
                    }
                } catch (error) {
                    this.$message.error('网络错误，请稍后重试')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },

        handleViewResults(row) {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exam/${row.id}/results`
            })
        },

        async submitExamForm() {
            try {
                const valid = await this.$refs.examForm.validate()
                if (!valid) return

                this.submitting = true
                const formData = {
                    title: this.examForm.title,
                    description: this.examForm.description,
                    startTime: this.examForm.timeRange[0],
                    endTime: this.examForm.timeRange[1],
                    duration: this.examForm.duration,
                    paperId: this.examForm.paperId,
                    showResult: this.examForm.showResult,
                    courseId: this.courseId
                }

                let response
                if (this.isEdit) {
                    formData.id = this.currentExamId
                    response = await teacherExamApi.updateExam(this.courseId, this.currentExamId, formData)
                } else {
                    response = await teacherExamApi.createExam(this.courseId, formData)
                }

                if (response.code === 1) {
                    this.$message.success(this.isEdit ? '测验更新成功' : '测验创建成功')
                    this.dialogVisible = false
                    this.fetchExams()
                    this.fetchRecentExamsStats()
                } else {
                    this.$message.error(response.message || (this.isEdit ? '更新失败' : '创建失败'))
                }
            } catch (error) {
                this.$message.error('网络错误，请稍后重试')
            } finally {
                this.submitting = false
            }
        },

        resetForm() {
            this.examForm = {
                title: '',
                description: '',
                examType: 'flexible',
                timeRange: [],
                duration: 60,
                paperId: '',
                showResult: true
            }
            this.timeConflict = false
            this.timeConflictMessage = ''
            this.timeInfo = ''
        },

        handleExamTypeChange() {
            this.checkTimeConflict()
            this.updateTimeInfo()
        },

        handleTimeRangeChange() {
            this.checkTimeConflict()
            this.updateTimeInfo()
        },

        handleDurationChange() {
            this.checkTimeConflict()
            this.updateTimeInfo()
        },

        checkTimeConflict() {
            if (!this.examForm.timeRange || this.examForm.timeRange.length !== 2) {
                this.timeConflict = false
                return
            }

            const startTime = new Date(this.examForm.timeRange[0])
            const endTime = new Date(this.examForm.timeRange[1])
            const durationMs = this.examForm.duration * 60 * 1000
            const timeRangeMs = endTime.getTime() - startTime.getTime()

            if (this.examForm.examType === 'fixed') {
                // 定时测验：结束时间应该 = 开始时间 + 考试时长
                const expectedEndTime = new Date(startTime.getTime() + durationMs)
                const timeDiff = Math.abs(endTime.getTime() - expectedEndTime.getTime())

                if (timeDiff > 60000) { // 允许1分钟误差
                    this.timeConflict = true
                    this.timeConflictMessage = `定时测验的结束时间应该是开始时间后${this.examForm.duration}分钟`
                } else {
                    this.timeConflict = false
                }
            } else {
                // 开放式测验：时间范围应该大于考试时长
                if (timeRangeMs < durationMs) {
                    this.timeConflict = true
                    this.timeConflictMessage = `开放时间范围(${Math.round(timeRangeMs / 60000)}分钟)小于考试时长(${this.examForm.duration}分钟)`
                } else {
                    this.timeConflict = false
                }
            }
        },

        updateTimeInfo() {
            if (!this.examForm.timeRange || this.examForm.timeRange.length !== 2) {
                this.timeInfo = ''
                return
            }

            const startTime = new Date(this.examForm.timeRange[0])
            const endTime = new Date(this.examForm.timeRange[1])
            const timeRangeMs = endTime.getTime() - startTime.getTime()
            const timeRangeMinutes = Math.round(timeRangeMs / 60000)

            if (this.examForm.examType === 'flexible') {
                this.timeInfo = `学生可在${timeRangeMinutes}分钟的时间窗口内开始${this.examForm.duration}分钟的考试`
            } else {
                this.timeInfo = `所有学生将在指定时间统一开始${this.examForm.duration}分钟的考试`
            }
        },

        autoAdjustTime() {
            if (!this.examForm.timeRange || this.examForm.timeRange.length !== 2) return

            const startTime = new Date(this.examForm.timeRange[0])
            const durationMs = this.examForm.duration * 60 * 1000

            if (this.examForm.examType === 'fixed') {
                // 定时测验：自动调整结束时间
                const newEndTime = new Date(startTime.getTime() + durationMs)
                this.examForm.timeRange = [
                    this.examForm.timeRange[0],
                    this.formatDateTime(newEndTime)
                ]
            } else {
                // 开放式测验：自动调整结束时间，确保有足够的时间窗口
                const minEndTime = new Date(startTime.getTime() + durationMs + 60 * 60 * 1000) // 额外1小时缓冲
                this.examForm.timeRange = [
                    this.examForm.timeRange[0],
                    this.formatDateTime(minEndTime)
                ]
            }

            this.checkTimeConflict()
            this.updateTimeInfo()
            this.$message.success('时间已自动调整')
        },

        formatDateTime(date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },

        goToCreatePaper() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/paper/edit`,
                query: { returnPath: this.$route.fullPath }
            })
        },

        goToPapers() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/papers`
            })
        },

        goToQuestionBank() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/questionBank`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.modern-exams-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 0;
}

// 现代化页面头部
.page-header-modern {
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
            .page-title {
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

        .header-actions {
            display: flex;
            gap: 12px;

            .el-button {
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                backdrop-filter: blur(10px);

                &:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(255, 255, 255, 0.5);
                }

                &.el-button--primary {
                    background: rgba(255, 255, 255, 0.2);

                    &:hover {
                        background: rgba(255, 255, 255, 0.3);
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
        gap: 20px;

        .stat-card-modern {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #f0f0f0;

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            }

            .stat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;

                    &.status-pending {
                        background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    }

                    &.status-active {
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                    }

                    &.status-finished {
                        background: linear-gradient(135deg, #3498db, #2980b9);
                    }
                }

                .stat-status {
                    font-weight: 600;
                }
            }

            .stat-content {
                .stat-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 16px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .stat-metrics {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;

                    .metric {
                        text-align: center;

                        .metric-value {
                            display: block;
                            font-size: 24px;
                            font-weight: 700;
                            color: #2c3e50;
                            line-height: 1;
                        }

                        .metric-label {
                            font-size: 12px;
                            color: #7f8c8d;
                            margin-top: 4px;
                        }
                    }

                    .metric-divider {
                        font-size: 20px;
                        color: #bdc3c7;
                        margin: 0 16px;
                    }
                }

                .stat-progress {
                    margin-bottom: 16px;
                }

                .stat-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .stat-date {
                        font-size: 12px;
                        color: #7f8c8d;
                    }

                    .stat-percentage {
                        font-size: 14px;
                        font-weight: 600;
                        color: #667eea;
                    }
                }
            }
        }
    }
}

// 测验列表区域
.exams-list-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px 30px 30px;

    .list-card {
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

        .exams-table-container {
            .modern-table {
                .exam-title-cell {
                    h4 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin: 0 0 4px 0;
                    }

                    p {
                        font-size: 14px;
                        color: #7f8c8d;
                        margin: 0;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                }

                .time-cell {
                    .time-item {
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

                .participation-cell {
                    .participation-number {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 8px;
                    }

                    .participation-progress {
                        width: 80px;
                        margin: 0 auto;
                    }
                }

                .action-buttons {
                    display: flex;
                    gap: 4px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
            }
        }
    }
}

// 现代化对话框样式
.modern-dialog {
    .el-dialog {
        border-radius: 16px;

        .el-dialog__header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px 24px;
            border-radius: 16px 16px 0 0;

            .el-dialog__title {
                font-size: 18px;
                font-weight: 600;
            }

            .el-dialog__close {
                color: white;

                &:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }

        .el-dialog__body {
            padding: 30px 24px;
        }

        .el-dialog__footer {
            padding: 20px 24px;
            border-top: 1px solid #f0f0f0;
        }
    }
}

.modern-form {
    .el-form-item {
        margin-bottom: 24px;

        .el-form-item__label {
            font-weight: 600;
            color: #2c3e50;
        }

        .paper-select-group {
            display: flex;
            align-items: center;
        }

        .rules-group {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .el-checkbox {
                margin-right: 0;
            }
        }
    }
}

// 测验类型选择样式
.exam-type-option {
    margin-left: 8px;

    .option-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
    }

    .option-desc {
        font-size: 12px;
        color: #7f8c8d;
        line-height: 1.4;
    }
}

// 时间设置容器样式
.time-setting-container {

    .time-input-group,
    .duration-input-group {
        margin-bottom: 16px;

        .time-label {
            display: block;
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            font-weight: 500;
        }
    }

    .duration-controls {
        display: flex;
        align-items: center;
    }

    .time-conflict-warning {
        background: #fef0f0;
        border: 1px solid #fbc4c4;
        border-radius: 4px;
        padding: 12px;
        color: #f56c6c;
        font-size: 14px;
        margin-top: 8px;

        i {
            margin-right: 8px;
        }
    }

    .time-info {
        background: #f0f9ff;
        border: 1px solid #b3d8ff;
        border-radius: 4px;
        padding: 12px;
        color: #409eff;
        font-size: 14px;
        margin-top: 8px;

        i {
            margin-right: 8px;
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .page-header-modern {
        .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;

            .header-actions {
                justify-content: center;
                flex-wrap: wrap;
            }
        }
    }

    .stats-section {
        padding: 0 20px;

        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    .exams-list-section {
        padding: 0 20px 30px 20px;
    }
}

@media (max-width: 768px) {
    .page-header-modern {
        padding: 30px 0;

        .header-content {
            padding: 0 20px;

            .page-title {
                font-size: 28px;
            }

            .page-subtitle {
                font-size: 14px;
            }

            .header-actions {
                .el-button {
                    padding: 8px 16px;
                    font-size: 14px;
                }
            }
        }
    }

    .stats-section {
        .stats-grid {
            .stat-card-modern {
                padding: 20px;

                .stat-header {
                    .stat-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }
                }

                .stat-content {
                    .stat-title {
                        font-size: 16px;
                    }

                    .stat-metrics {
                        .metric {
                            .metric-value {
                                font-size: 20px;
                            }
                        }
                    }
                }
            }
        }
    }

    .exams-list-section {
        .list-card {
            .exams-table-container {
                overflow-x: auto;

                .modern-table {
                    min-width: 800px;

                    .action-buttons {
                        flex-direction: column;
                        gap: 2px;

                        .el-button {
                            width: 60px;
                            padding: 4px 8px;
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }

    .modern-dialog {
        .el-dialog {
            width: 95% !important;
            margin: 20px auto !important;

            .el-dialog__body {
                padding: 20px;
            }
        }
    }

    .modern-form {
        .paper-select-group {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
        }

        .rules-group {
            .el-checkbox {
                margin-bottom: 8px;
            }
        }
    }
}

@media (max-width: 480px) {
    .page-header-modern {
        .header-content {
            .header-actions {
                flex-direction: column;
                width: 100%;

                .el-button {
                    width: 100%;
                    justify-content: center;
                }
            }
        }
    }

    .stats-section {
        .stats-grid {
            .stat-card-modern {
                .stat-content {
                    .stat-metrics {
                        .metric-divider {
                            margin: 0 12px;
                        }
                    }
                }
            }
        }
    }
}
</style>
