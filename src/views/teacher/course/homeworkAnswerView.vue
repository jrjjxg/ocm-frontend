<template>
    <div class="homework-answer-view">
        <!-- 页面头部 -->
        <div class="view-header">
            <div class="header-left">
                <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
                <h1>查看学生答题</h1>
            </div>
            <div class="header-actions">
                <el-button icon="el-icon-refresh" @click="loadAnswerData">刷新</el-button>
                <el-button type="primary" @click="handleStartGrade">开始批改</el-button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 内容区域 -->
        <div v-else class="view-content">
            <!-- 学生信息卡片 -->
            <el-card class="student-info-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-user"></i>
                        学生信息
                    </span>
                </div>
                <div v-if="studentInfo" class="student-details">
                    <div class="info-item">
                        <label>学生姓名：</label>
                        <span>{{ studentInfo.studentName }}</span>
                    </div>
                    <div class="info-item">
                        <label>学号：</label>
                        <span>{{ studentInfo.studentNumber }}</span>
                    </div>
                    <div class="info-item">
                        <label>提交时间：</label>
                        <span>{{ studentInfo.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                    </div>
                    <div class="info-item">
                        <label>总得分：</label>
                        <span class="score-display">{{ studentInfo.totalScore || 0 }}/{{ homeworkTotalScore }}分</span>
                    </div>
                    <div class="info-item">
                        <label>批改状态：</label>
                        <el-tag :type="getGradeStatusType(studentInfo.gradeStatus)">
                            {{ getGradeStatusText(studentInfo.gradeStatus) }}
                        </el-tag>
                    </div>
                </div>
            </el-card>

            <!-- 答题详情 -->
            <el-card class="answers-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-document"></i>
                        答题详情
                    </span>
                </div>

                <div v-if="answers && answers.length > 0" class="answers-container">
                    <div v-for="(answer, index) in answers" :key="answer.id" class="answer-item">
                        <div class="question-header">
                            <span class="question-number">第{{ index + 1 }}题</span>
                            <el-tag :type="getQuestionTypeTag(answer.questionType)" size="small">
                                {{ getQuestionTypeText(answer.questionType) }}
                            </el-tag>
                            <span class="question-score">{{ getDisplayScore(answer.questionScore) }}分</span>
                        </div>

                        <!-- 题目内容 -->
                        <div class="question-content">
                            <div class="question-title" v-html="answer.questionTitle"></div>

                            <!-- 选择题选项 -->
                            <div v-if="answer.questionContent && answer.questionContent.questionItemObjects && answer.questionContent.questionItemObjects.length > 0"
                                class="question-options">
                                <div v-for="(option, optIndex) in answer.questionContent.questionItemObjects"
                                    :key="optIndex" class="option-item" :class="getOptionClass(answer, option.prefix)">
                                    <span class="option-prefix">{{ option.prefix }}.</span>
                                    <span class="option-content">{{ option.content }}</span>
                                    <!-- 正确答案标识 -->
                                    <el-tag v-if="isCorrectOption(answer.questionContent.correct, option.prefix)"
                                        type="success" size="mini" class="correct-tag">正确答案</el-tag>
                                    <!-- 学生选择标识 -->
                                    <el-tag v-if="isStudentChoice(answer.studentAnswer, option.prefix)"
                                        :type="isCorrectOption(answer.questionContent.correct, option.prefix) ? 'success' : 'danger'"
                                        size="mini" class="student-choice-tag">学生选择</el-tag>
                                </div>
                            </div>

                            <!-- 正确答案（非选择题） -->
                            <div v-if="answer.questionContent && answer.questionContent.correct &&
                                (!answer.questionContent.questionItemObjects || answer.questionContent.questionItemObjects.length === 0)"
                                class="correct-answer-section">
                                <h4>参考答案：</h4>
                                <div class="correct-answer-content" v-html="answer.questionContent.correct"></div>
                            </div>
                        </div>

                        <!-- 学生答案 -->
                        <div class="student-answer-section">
                            <h4>学生答案：</h4>
                            <div class="student-answer-content" :class="getAnswerClass(answer)">
                                <span v-if="answer.studentAnswer">{{ answer.studentAnswer }}</span>
                                <span v-else class="no-answer">学生未答题</span>
                                <!-- 答题结果标识 -->
                                <el-tag v-if="answer.questionType <= 3 && answer.isCorrect !== null"
                                    :type="answer.isCorrect ? 'success' : 'danger'" size="small" class="answer-result">
                                    {{ answer.isCorrect ? '正确' : '错误' }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 评分信息 -->
                        <div class="score-section">
                            <div class="score-info">
                                <span class="score-label">得分：</span>
                                <span class="score-value" :class="getScoreClass(answer)">
                                    {{ answer.score || 0 }}/{{ getDisplayScore(answer.questionScore) }}分
                                </span>
                            </div>
                            <div v-if="answer.feedback" class="feedback-info">
                                <span class="feedback-label">教师评语：</span>
                                <span class="feedback-content">{{ answer.feedback }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="no-answers">
                    <el-empty description="暂无答题记录" />
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import { homeworkStudentAnswers } from '@/api/teacher/homework'

export default {
    name: 'HomeworkAnswerView',
    data() {
        return {
            loading: true,
            answers: [],
            studentInfo: null,
            homeworkTotalScore: 0
        }
    },
    created() {
        this.loadAnswerData()
    },
    methods: {
        async loadAnswerData() {
            try {
                this.loading = true
                const courseId = this.$route.params.id
                const homeworkId = this.$route.params.homeworkId
                const studentId = this.$route.params.studentId

                console.log('加载学生答题数据:', { courseId, homeworkId, studentId })

                const response = await homeworkStudentAnswers(courseId, homeworkId, studentId)

                console.log('API响应:', response)

                if (response && response.response) {
                    this.answers = response.response.map(answer => {
                        // 解析题目内容JSON
                        let questionContent = null
                        try {
                            questionContent = JSON.parse(answer.questionContent || '{}')
                        } catch (e) {
                            console.error('解析题目内容失败:', e)
                            questionContent = { titleContent: '题目内容解析失败' }
                        }

                        return {
                            id: answer.id,
                            questionId: answer.questionId,
                            questionTitle: questionContent.titleContent || '题目内容获取失败',
                            questionContent: questionContent,
                            questionScore: answer.questionScore || 10,
                            questionType: answer.questionType,
                            studentAnswer: answer.answer || '未答题',
                            score: answer.score || 0,
                            feedback: answer.feedback || '',
                            status: answer.status,
                            isCorrect: answer.isCorrect
                        }
                    })

                    // 从第一个答案记录中获取学生信息
                    if (this.answers.length > 0) {
                        const firstAnswer = response.response[0]
                        this.studentInfo = {
                            studentId: studentId,
                            studentName: firstAnswer.studentName || '未知学生',
                            studentNumber: firstAnswer.studentNumber || '未知学号',
                            submitTime: firstAnswer.submitTime,
                            totalScore: this.calculateTotalScore(),
                            gradeStatus: firstAnswer.gradeStatus || 'pending'
                        }
                    }

                    // 计算作业总分
                    this.homeworkTotalScore = this.answers.reduce((total, answer) => {
                        return total + this.getDisplayScore(answer.questionScore)
                    }, 0)

                    console.log('处理后的答题数据:', this.answers)
                    console.log('学生信息:', this.studentInfo)
                } else {
                    this.answers = []
                    this.$message.error(response?.message || '获取答题数据失败')
                }

            } catch (error) {
                this.$message.error('加载学生答题失败: ' + error.message)
                console.error('Load student answers error:', error)
                this.answers = []
            } finally {
                this.loading = false
            }
        },

        calculateTotalScore() {
            return this.answers.reduce((total, answer) => {
                return total + (answer.score || 0)
            }, 0)
        },

        handleBack() {
            this.$router.go(-1)
        },

        handleStartGrade() {
            // 跳转到批改页面
            const courseId = this.$route.params.id
            const homeworkId = this.$route.params.homeworkId
            this.$router.push(`/teacher/course/${courseId}/homework/grade/${homeworkId}`)
        },

        getQuestionTypeText(type) {
            const typeMap = {
                1: '单选题',
                2: '多选题',
                3: '判断题',
                4: '填空题',
                5: '问答题'
            }
            return typeMap[type] || '未知类型'
        },

        getQuestionTypeTag(type) {
            const tagMap = {
                1: 'primary',
                2: 'success',
                3: 'warning',
                4: 'info',
                5: 'danger'
            }
            return tagMap[type] || 'info'
        },

        getDisplayScore(score) {
            if (!score) return 0
            const numScore = typeof score === 'string' ? parseFloat(score) : score
            return numScore <= 10 ? numScore : numScore / 10
        },

        getGradeStatusText(status) {
            const statusMap = {
                'graded': '已批改',
                'pending': '待批改',
                'auto': '自动评分'
            }
            return statusMap[status] || '未知'
        },

        getGradeStatusType(status) {
            const typeMap = {
                'graded': 'success',
                'pending': 'warning',
                'auto': 'info'
            }
            return typeMap[status] || 'info'
        },

        isCorrectOption(correctAnswer, optionPrefix) {
            if (!correctAnswer || !optionPrefix) return false
            return correctAnswer.includes(optionPrefix)
        },

        isStudentChoice(studentAnswer, optionPrefix) {
            if (!studentAnswer || !optionPrefix) return false
            return studentAnswer.includes(optionPrefix)
        },

        getOptionClass(answer, optionPrefix) {
            const isCorrect = this.isCorrectOption(answer.questionContent?.correct, optionPrefix)
            const isStudentChoice = this.isStudentChoice(answer.studentAnswer, optionPrefix)

            return {
                'correct-option': isCorrect,
                'student-choice': isStudentChoice,
                'wrong-choice': isStudentChoice && !isCorrect
            }
        },

        getAnswerClass(answer) {
            if ([1, 2, 3].includes(answer.questionType)) {
                return answer.isCorrect ? 'correct-answer' : 'wrong-answer'
            }
            return ''
        },

        getScoreClass(answer) {
            const fullScore = this.getDisplayScore(answer.questionScore)
            const studentScore = answer.score || 0

            if (studentScore === fullScore) {
                return 'full-score'
            } else if (studentScore > 0) {
                return 'partial-score'
            } else {
                return 'zero-score'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-answer-view {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
        display: flex;
        align-items: center;
        gap: 15px;

        h1 {
            margin: 0;
            color: #303133;
            font-size: 24px;
            font-weight: 600;
        }
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }
}

.loading-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.view-content {
    .card-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        color: #303133;

        i {
            margin-right: 8px;
            color: #409EFF;
        }
    }
}

.student-info-card {
    margin-bottom: 20px;

    .student-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;

        .info-item {
            display: flex;
            align-items: center;

            label {
                font-weight: 600;
                color: #606266;
                min-width: 80px;
            }

            .score-display {
                font-weight: bold;
                color: #E6A23C;
                font-size: 16px;
            }
        }
    }
}

.answers-card {
    .answers-container {
        .answer-item {
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background: white;

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;

                .question-number {
                    font-size: 16px;
                    font-weight: bold;
                    color: #409EFF;
                }

                .question-score {
                    color: #E6A23C;
                    font-weight: 500;
                }
            }

            .question-content {
                margin-bottom: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 6px;

                .question-title {
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .question-options {
                    .option-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 10px;
                        padding: 8px 12px;
                        border-radius: 4px;
                        border: 1px solid transparent;
                        background: #ffffff;

                        &.correct-option {
                            background: #f0f9ff;
                            border-color: #409EFF;
                        }

                        &.student-choice {
                            background: #fff8e1;
                            border-color: #E6A23C;
                        }

                        &.wrong-choice {
                            background: #fef0f0;
                            border-color: #F56C6C;
                        }

                        .option-prefix {
                            font-weight: bold;
                            margin-right: 8px;
                            min-width: 20px;
                        }

                        .option-content {
                            flex: 1;
                            margin-right: 10px;
                        }

                        .correct-tag,
                        .student-choice-tag {
                            margin-left: auto;
                        }
                    }
                }

                .correct-answer-section {
                    margin-top: 15px;
                    padding: 10px;
                    background: #f0f9ff;
                    border-left: 3px solid #409EFF;
                    border-radius: 4px;

                    h4 {
                        margin: 0 0 10px 0;
                        color: #409EFF;
                        font-size: 14px;
                    }

                    .correct-answer-content {
                        line-height: 1.6;
                    }
                }
            }

            .student-answer-section {
                margin-bottom: 15px;

                h4 {
                    margin: 0 0 10px 0;
                    color: #606266;
                    font-size: 14px;
                }

                .student-answer-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #fff8e1;
                    border-radius: 4px;
                    border-left: 3px solid #E6A23C;
                    line-height: 1.6;

                    &.correct-answer {
                        background: #f0f9ff;
                        border-left-color: #67C23A;
                    }

                    &.wrong-answer {
                        background: #fef0f0;
                        border-left-color: #F56C6C;
                    }

                    .no-answer {
                        color: #C0C4CC;
                        font-style: italic;
                    }

                    .answer-result {
                        margin-left: auto;
                    }
                }
            }

            .score-section {
                border-top: 1px solid #e4e7ed;
                padding-top: 15px;

                .score-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;

                    .score-label {
                        color: #606266;
                        font-size: 14px;
                    }

                    .score-value {
                        font-weight: bold;
                        font-size: 16px;

                        &.full-score {
                            color: #67C23A;
                        }

                        &.partial-score {
                            color: #E6A23C;
                        }

                        &.zero-score {
                            color: #F56C6C;
                        }
                    }
                }

                .feedback-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;

                    .feedback-label {
                        color: #606266;
                        font-size: 14px;
                        min-width: 80px;
                    }

                    .feedback-content {
                        flex: 1;
                        color: #303133;
                        line-height: 1.6;
                    }
                }
            }
        }
    }

    .no-answers {
        text-align: center;
        padding: 40px;
    }
}

@media (max-width: 768px) {
    .homework-answer-view {
        padding: 15px;
    }

    .view-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .student-details {
        grid-template-columns: 1fr;
    }
}
</style>