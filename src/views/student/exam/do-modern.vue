<template>
    <div class="modern-exam-container">
        <!-- 现代化顶部导航栏 -->
        <div class="exam-header-modern">
            <div class="header-content">
                <div class="exam-info">
                    <h1 class="exam-title">{{ form.name }}</h1>
                    <div class="exam-meta">
                        <span class="meta-item">
                            <i class="el-icon-star-on"></i>
                            总分：{{ form.score }}分
                        </span>
                        <span class="meta-item">
                            <i class="el-icon-time"></i>
                            时长：{{ form.suggestTime }}分钟
                        </span>

                    </div>
                </div>
                <div class="exam-timer">
                    <div class="timer-card">
                        <div class="timer-icon">
                            <i class="el-icon-timer"></i>
                        </div>
                        <div class="timer-content">
                            <div class="timer-label">剩余时间</div>
                            <div class="timer-value" :class="{ 'timer-warning': remainTime < 300 }">
                                {{ formatSeconds(remainTime) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="exam-main-content">
            <!-- 左侧答题区域 -->
            <div class="exam-content-area">
                <div v-loading="formLoading" class="questions-container">
                    <div v-for="(titleItem, titleIndex) in form.titleItems" :key="titleIndex" class="question-section">
                        <div class="section-header">
                            <h2 class="section-title">{{ titleItem.name }}</h2>
                            <div class="section-info">
                                共{{ titleItem.questionItems.length }}题
                            </div>
                        </div>

                        <div class="questions-list">
                            <div v-for="(questionItem, questionIndex) in titleItem.questionItems" :key="questionItem.id"
                                :id="'question-' + questionItem.itemOrder" class="question-card"
                                :class="{ 'answered': isQuestionAnswered(questionItem.itemOrder) }">
                                <div class="question-header">
                                    <div class="question-number">
                                        <span class="number">{{ questionItem.itemOrder }}</span>
                                        <div class="status-indicator"
                                            :class="{ 'completed': isQuestionAnswered(questionItem.itemOrder) }">
                                            <i class="el-icon-check"
                                                v-if="isQuestionAnswered(questionItem.itemOrder)"></i>
                                        </div>
                                    </div>
                                    <div class="question-info">
                                        <span class="question-type">{{ getQuestionTypeName(questionItem.questionType)
                                            }}</span>
                                        <span class="question-score">{{ questionItem.score }}分</span>
                                    </div>
                                </div>

                                <div class="question-content">
                                    <QuestionEdit :qType="questionItem.questionType" :question="questionItem"
                                        :answer="answer.answerItems[questionItem.itemOrder - 1]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部操作区域 -->
                <div class="exam-actions">
                    <el-button size="large" @click="goBack">取消考试</el-button>
                    <el-button type="primary" size="large" @click="submitForm" :loading="formLoading"
                        :disabled="submitButtonDisabled">
                        <i class="el-icon-check"></i>
                        {{ submitButtonText }}
                    </el-button>
                </div>
            </div>

            <!-- 右侧导航面板 -->
            <div class="exam-sidebar">
                <div class="sidebar-card">
                    <div class="sidebar-header">
                        <h3>答题进度</h3>
                        <div class="progress-info">
                            {{ answeredCount }}/{{ totalQuestions }}
                        </div>
                    </div>

                    <div class="progress-bar">
                        <el-progress :percentage="progressPercentage" :stroke-width="8"
                            :show-text="false"></el-progress>
                        <span class="progress-text">{{ progressPercentage }}%</span>
                    </div>

                    <div class="questions-nav">
                        <div class="nav-legend">
                            <div class="legend-item">
                                <span class="legend-dot answered"></span>
                                <span>已答</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot unanswered"></span>
                                <span>未答</span>
                            </div>
                        </div>

                        <div class="questions-grid">
                            <div v-for="item in answer.answerItems" :key="item.itemOrder" class="nav-question" :class="{
                                'answered': item.completed,
                                'current': currentQuestion === item.itemOrder
                            }" @click="goToQuestion(item.itemOrder)">
                                {{ item.itemOrder }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 提交确认对话框 -->
        <el-dialog title="提交确认" :visible.sync="submitDialogVisible" width="500px" :close-on-click-modal="false">
            <div class="submit-confirm">
                <div class="confirm-icon">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="confirm-content">
                    <h3>确认提交答卷？</h3>
                    <p>您已完成 {{ answeredCount }}/{{ totalQuestions }} 题</p>
                    <p v-if="unansweredCount > 0" class="warning-text">
                        还有 {{ unansweredCount }} 题未作答，提交后将无法修改
                    </p>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="submitDialogVisible = false">继续答题</el-button>
                <el-button type="primary" @click="confirmSubmit" :loading="submitting">确认提交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { formatSeconds } from '@/utils'
import QuestionEdit from '../components/QuestionEdit'
import { getExamDetail, startExam, submitExamAnswer, saveExamDraft } from '@/api/student/exam'
import * as examApi from '@/api/student/exam'
import examPaperApi from '@/api/examPaper'

export default {
    name: 'ModernExamDo',
    components: { QuestionEdit },
    data() {
        return {
            form: {
                titleItems: []
            },
            formLoading: false,
            answer: {
                id: null,
                examId: null,
                courseId: null,
                doTime: 0,
                answerItems: []
            },
            timer: null,
            remainTime: 0,
            currentQuestion: 1,
            submitDialogVisible: false,
            submitting: false,
            autoSaveTimer: null
        }
    },
    computed: {
        totalQuestions() {
            return this.answer.answerItems.length
        },
        answeredCount() {
            return this.answer.answerItems.filter(item => item.completed).length
        },
        unansweredCount() {
            return this.totalQuestions - this.answeredCount
        },
        progressPercentage() {
            if (this.totalQuestions === 0) return 0
            return Math.round((this.answeredCount / this.totalQuestions) * 100)
        },
        submitButtonDisabled() {
            return false;
        },
        submitButtonText() {
            return '提交答卷';
        },
        ...mapGetters('enumItem', ['enumFormat']),
        ...mapState('enumItem', {
            doCompletedTag: state => state.exam.question.answer.doCompletedTag
        })
    },
    created() {
        this.initExam()
    },
    beforeDestroy() {
        this.clearTimers()
    },
    methods: {
        async initExam() {
            const examId = this.$route.params.examId
            const courseId = this.$route.query.courseId

            if (!examId || !courseId) {
                this.$message.error('参数错误')
                this.goBack()
                return
            }

            try {
                this.formLoading = true

                // 开始考试，获取试卷信息
                const response = await getExamDetail(courseId, examId)
                if (response.code === 1) {
                    this.form = response.response
                    // 初始化答案数据
                    this.answer.courseId = courseId
                    this.answer.examId = examId
                    this.remainTime = this.form.suggestTime * 60

                    if (!this.answer.answerItems || this.answer.answerItems.length === 0) {
                        this.initAnswerItems()
                    }

                    this.startTimer()
                    this.startAutoSave()
                } else {
                    // 如果是已提交错误，显示特殊提示
                    if (response.code === 403 && response.message && response.message.includes('已经提交')) {
                        this.$alert(response.message, '考试已完成', {
                            confirmButtonText: '返回课程页面',
                            callback: () => {
                                this.goBack()
                            }
                        })
                    } else {
                        this.$message.error(response.message || '开始考试失败')
                        this.goBack()
                    }
                }
            } catch (error) {
                this.$message.error('开始考试失败')
                this.goBack()
            } finally {
                this.formLoading = false
            }
        },

        initAnswerItems() {
            let questionOrder = 1
            this.form.titleItems.forEach(titleItem => {
                titleItem.questionItems.forEach(question => {
                    this.answer.answerItems.push({
                        questionId: question.id,
                        content: null,
                        contentArray: [],
                        completed: false,
                        itemOrder: questionOrder++
                    })
                })
            })
        },

        startTimer() {
            this.timer = setInterval(() => {
                if (this.remainTime <= 0) {
                    this.timeUp()
                } else {
                    this.answer.doTime++
                    this.remainTime--
                }
            }, 1000)
        },

        startAutoSave() {
            // 每30秒自动保存一次
            this.autoSaveTimer = setInterval(() => {
                this.autoSave()
            }, 30000)
        },

        async autoSave() {
            try {
                await saveExamDraft(this.answer.courseId, this.answer.examId, this.answer)
            } catch (error) {
                console.warn('自动保存失败:', error)
            }
        },

        clearTimers() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer)
                this.autoSaveTimer = null
            }
        },

        formatSeconds(seconds) {
            return formatSeconds(seconds)
        },

        isQuestionAnswered(itemOrder) {
            const answer = this.answer.answerItems[itemOrder - 1]
            return answer && answer.completed
        },

        getQuestionTypeName(type) {
            const typeMap = {
                1: '单选题',
                2: '多选题',
                3: '判断题',
                4: '填空题',
                5: '简答题'
            }
            return typeMap[type] || '未知题型'
        },

        goToQuestion(itemOrder) {
            this.currentQuestion = itemOrder
            const element = document.getElementById(`question-${itemOrder}`)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        },

        submitForm() {
            this.submitDialogVisible = true
        },

        async confirmSubmit() {
            this.submitting = true
            try {
                this.clearTimers()

                // 如果不是课程考试，先检查提交次数限制
                if (!this.answer.courseId && this.answer.id) {
                    const statusResponse = await examApi.getExamStatus(this.answer.id)
                    if (statusResponse.code === 1) {
                        const { maxAttempts, submittedCount, canSubmit } = statusResponse.response

                        if (!canSubmit) {
                            this.$alert(
                                `您已达到最大提交次数限制（${submittedCount}/${maxAttempts}）`,
                                '无法提交',
                                {
                                    confirmButtonText: '确定',
                                    callback: () => {
                                        this.goBack()
                                    }
                                }
                            )
                            return
                        }
                    }
                }

                const res = await submitExamAnswer(this.answer.courseId, this.answer.examId, this.answer)
                if (res.code === 1) {
                    this.$alert(`试卷得分：${res.response}分`, '提交成功', {
                        confirmButtonText: '返回课程主页',
                        callback: action => {
                            this.goBack()
                        }
                    })
                } else {
                    this.$message.error(res.message || '提交失败')
                    this.startTimer() // 重新开始计时器
                }
            } catch (error) {
                console.error('提交试卷出错:', error)
                this.$message.error('提交失败，请检查网络')
                this.startTimer() // 重新开始计时器
            } finally {
                this.submitting = false
                this.submitDialogVisible = false
            }
        },

        timeUp() {
            this.$alert('考试时间已到，系统将自动提交答卷', '时间到', {
                confirmButtonText: '确定',
                callback: () => {
                    this.confirmSubmit()
                }
            })
        },

        goBack() {
            this.$confirm('确定要退出考试吗？退出后答题记录将不会保存。', '确认退出', {
                confirmButtonText: '确定退出',
                cancelButtonText: '继续答题',
                type: 'warning'
            }).then(() => {
                this.clearTimers()
                this.$router.push(`/student/course/${this.answer.courseId}/exams`)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.modern-exam-container {
    min-height: 100vh;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;
}

// 现代化头部
.exam-header-modern {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 0;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    position: sticky;
    top: 0;
    z-index: 1000;

    .header-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .exam-info {
            .exam-title {
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 10px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .exam-meta {
                display: flex;
                gap: 30px;

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    opacity: 0.9;

                    i {
                        font-size: 18px;
                    }
                }
            }
        }

        .exam-timer {
            .timer-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);

                .timer-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .timer-content {
                    .timer-label {
                        font-size: 14px;
                        opacity: 0.8;
                        margin-bottom: 4px;
                    }

                    .timer-value {
                        font-size: 24px;
                        font-weight: 700;
                        font-family: 'Courier New', monospace;

                        &.timer-warning {
                            color: #ff6b6b;
                            animation: pulse 1s infinite;
                        }
                    }
                }
            }
        }
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

// 主要内容区域
.exam-main-content {
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
}

// 左侧答题区域
.exam-content-area {
    .questions-container {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        margin-bottom: 30px;

        .question-section {
            .section-header {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                padding: 25px 30px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .section-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #2c3e50;
                    margin: 0;
                }

                .section-info {
                    color: #7f8c8d;
                    font-size: 14px;
                }
            }

            .questions-list {
                .question-card {
                    padding: 30px;
                    border-bottom: 1px solid #f0f0f0;
                    transition: all 0.3s ease;

                    &:last-child {
                        border-bottom: none;
                    }

                    &:hover {
                        background: #fafbfc;
                    }

                    &.answered {
                        background: linear-gradient(135deg, #f0fff4, #f0fff4);
                        border-left: 4px solid #52c41a;
                    }

                    .question-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;

                        .question-number {
                            display: flex;
                            align-items: center;
                            gap: 12px;

                            .number {
                                width: 40px;
                                height: 40px;
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                color: white;
                                border-radius: 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                font-size: 16px;
                            }

                            .status-indicator {
                                width: 24px;
                                height: 24px;
                                border: 2px solid #d9d9d9;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.3s ease;

                                &.completed {
                                    background: #52c41a;
                                    border-color: #52c41a;
                                    color: white;
                                }
                            }
                        }

                        .question-info {
                            display: flex;
                            gap: 15px;

                            .question-type {
                                background: #e6f7ff;
                                color: #1890ff;
                                padding: 4px 12px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                            }

                            .question-score {
                                background: #fff7e6;
                                color: #fa8c16;
                                padding: 4px 12px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                            }
                        }
                    }

                    .question-content {
                        font-size: 16px;
                        line-height: 1.8;
                    }
                }
            }
        }
    }

    .exam-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        padding: 30px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        .el-button {
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 12px;
        }
    }
}

// 右侧导航面板
.exam-sidebar {
    .sidebar-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        padding: 25px;
        position: sticky;
        top: 120px;

        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            h3 {
                font-size: 18px;
                font-weight: 700;
                color: #2c3e50;
                margin: 0;
            }

            .progress-info {
                color: #7f8c8d;
                font-size: 14px;
                font-weight: 600;
            }
        }

        .progress-bar {
            position: relative;
            margin-bottom: 25px;

            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
                font-weight: 700;
                color: #667eea;
            }
        }

        .questions-nav {
            .nav-legend {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #7f8c8d;

                    .legend-dot {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;

                        &.answered {
                            background: #52c41a;
                        }

                        &.unanswered {
                            background: #d9d9d9;
                        }
                    }
                }
            }

            .questions-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;

                .nav-question {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #d9d9d9;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: white;

                    &:hover {
                        border-color: #667eea;
                        color: #667eea;
                        transform: scale(1.05);
                    }

                    &.answered {
                        background: #52c41a;
                        border-color: #52c41a;
                        color: white;
                    }

                    &.current {
                        background: #667eea;
                        border-color: #667eea;
                        color: white;
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    }
                }
            }
        }
    }
}

// 提交确认对话框
.submit-confirm {
    text-align: center;
    padding: 20px;

    .confirm-icon {
        font-size: 60px;
        color: #fa8c16;
        margin-bottom: 20px;
    }

    .confirm-content {
        h3 {
            font-size: 20px;
            color: #2c3e50;
            margin: 0 0 15px 0;
        }

        p {
            color: #7f8c8d;
            margin: 8px 0;

            &.warning-text {
                color: #fa8c16;
                font-weight: 600;
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .exam-main-content {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;

        .exam-sidebar {
            order: -1;

            .sidebar-card {
                position: static;

                .questions-nav {
                    .questions-grid {
                        grid-template-columns: repeat(8, 1fr);
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .exam-header-modern {
        .header-content {
            flex-direction: column;
            gap: 20px;
            padding: 0 20px;

            .exam-info {
                text-align: center;

                .exam-title {
                    font-size: 24px;
                }

                .exam-meta {
                    justify-content: center;
                    gap: 20px;
                }
            }

            .exam-timer {
                .timer-card {
                    padding: 15px;

                    .timer-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    .timer-content {
                        .timer-value {
                            font-size: 20px;
                        }
                    }
                }
            }
        }
    }

    .exam-main-content {
        padding: 15px;

        .exam-content-area {
            .questions-container {
                .question-section {
                    .section-header {
                        padding: 20px;
                        flex-direction: column;
                        gap: 10px;
                        text-align: center;
                    }

                    .questions-list {
                        .question-card {
                            padding: 20px;

                            .question-header {
                                flex-direction: column;
                                gap: 15px;
                                align-items: flex-start;

                                .question-info {
                                    align-self: stretch;
                                    justify-content: space-between;
                                }
                            }
                        }
                    }
                }
            }

            .exam-actions {
                padding: 20px;
                flex-direction: column;

                .el-button {
                    width: 100%;
                }
            }
        }

        .exam-sidebar {
            .sidebar-card {
                .questions-nav {
                    .questions-grid {
                        grid-template-columns: repeat(6, 1fr);

                        .nav-question {
                            width: 35px;
                            height: 35px;
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }
}
</style>
