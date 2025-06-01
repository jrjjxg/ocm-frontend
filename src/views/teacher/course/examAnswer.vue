<template>
    <div class="exam-answer-container">
        <div class="page-header">
            <h2>{{ answerInfo ? answerInfo.paperName : '答卷评阅' }}</h2>
            <div>
                <el-button @click="goBack">返回</el-button>
                <el-button type="primary" @click="submitEvaluation" :loading="submitting">提交评阅</el-button>
            </div>
        </div>

        <div v-loading="loading">
            <el-card class="student-info-card" v-if="answerInfo">
                <div class="student-info">
                    <p><strong>学生姓名：</strong>{{ answerInfo.studentName }}</p>
                    <p><strong>学号：</strong>{{ answerInfo.studentId }}</p>
                    <p><strong>提交时间：</strong>{{ answerInfo.submitTime }}</p>
                    <p><strong>得分：</strong>{{ answerInfo.score }}/{{ answerInfo.totalScore }}</p>
                </div>
            </el-card>

            <div class="questions-container" v-if="answerInfo && answerInfo.questionAnswers">
                <div v-for="(question, index) in answerInfo.questionAnswers" :key="index" class="question-item">
                    <el-card>
                        <div class="question-header">
                            <h3>{{ index + 1 }}. {{ question.questionTitle }}</h3>
                            <div class="question-meta">
                                <el-tag>{{ formatQuestionType(question.questionType) }}</el-tag>
                                <span class="question-score">{{ question.score }}分</span>
                            </div>
                        </div>

                        <div class="question-content">
                            <div v-if="[1, 3, 2].includes(question.questionType)" class="options">
                                <!-- 选择题和判断题 -->
                                <div v-if="question.questionType === 1 || question.questionType === 3">
                                    <div v-for="(option, optIndex) in question.questionOptions" :key="optIndex"
                                        class="option-item">
                                        <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}.</span>
                                        <span v-html="option.content"></span>
                                        <el-tag size="mini" type="success"
                                            v-if="question.questionCorrect.includes(option.prefix)">
                                            正确答案
                                        </el-tag>
                                    </div>
                                </div>
                                <div v-if="question.questionType === 2" class="true-false">
                                    <div>
                                        <span>正确答案：{{ question.questionCorrect === 'A' ? '正确' : '错误' }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="answer-section">
                                <h4>学生答案：</h4>
                                <div v-if="[1, 3, 2].includes(question.questionType)" class="choice-answer">
                                    <span>{{ question.studentAnswer }}</span>
                                </div>
                                <div v-else class="text-answer">
                                    <p v-html="question.studentAnswer"></p>
                                </div>
                            </div>

                            <div class="scoring-section" v-if="[4, 5].includes(question.questionType)">
                                <h4>评分：</h4>
                                <el-input-number v-model="question.teacherScore" :min="0" :max="question.score"
                                    :step="0.5" size="small">
                                </el-input-number>
                                <p class="score-hint">满分{{ question.score }}分</p>

                                <h4>评语：</h4>
                                <el-input type="textarea" v-model="question.teacherComment" :rows="3"
                                    placeholder="请输入评语">
                                </el-input>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import teacherExamApi from '@/api/teacherExam'
import { mapState } from 'vuex'

export default {
    props: {
        courseId: {
            type: [Number, String],
            required: true
        },
        examId: {
            type: [Number, String],
            required: true
        },
        answerId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            loading: false,
            submitting: false,
            answerInfo: null
        }
    },
    computed: {
        ...mapState('enumItem', {
            questionTypeEnum: state => state.exam.question.typeEnum
        })
    },
    created() {
        this.fetchAnswerInfo()
    },
    methods: {
        fetchAnswerInfo() {
            this.loading = true
            teacherExamApi.getAnswerInfo(this.courseId, this.examId, this.answerId).then(res => {
                if (res.code === 1) {
                    this.answerInfo = res.response
                    // 初始化教师评分和评语
                    if (this.answerInfo && this.answerInfo.questionAnswers) {
                        this.answerInfo.questionAnswers.forEach(question => {
                            if ([4, 5].includes(question.questionType)) {
                                question.teacherScore = question.score || 0
                                question.teacherComment = question.comment || ''
                            }
                        })
                    }
                } else {
                    this.$message.error(res.message || '获取答卷信息失败')
                }
                this.loading = false
            }).catch(error => {
                console.error('获取答卷信息出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.loading = false
            })
        },
        formatQuestionType(type) {
            const found = this.questionTypeEnum.find(item => item.key === type)
            return found ? found.value : '未知类型'
        },
        submitEvaluation() {
            if (!this.answerInfo) return

            const evaluationData = {
                answerId: this.answerId,
                questionEvaluations: this.answerInfo.questionAnswers
                    .filter(q => [4, 5].includes(q.questionType))
                    .map(q => ({
                        questionId: q.questionId,
                        score: q.teacherScore,
                        comment: q.teacherComment
                    }))
            }

            this.submitting = true
            teacherExamApi.evaluateAnswer(this.courseId, this.examId, this.answerId, evaluationData).then(res => {
                if (res.code === 1) {
                    this.$message.success('评阅提交成功')
                    setTimeout(() => {
                        this.goBack()
                    }, 1500)
                } else {
                    this.$message.error(res.message || '评阅提交失败')
                }
                this.submitting = false
            }).catch(error => {
                console.error('提交评阅出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.submitting = false
            })
        },
        goBack() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exam/${this.examId}/results`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.exam-answer-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .student-info-card {
        margin-bottom: 20px;

        .student-info {
            display: flex;
            flex-wrap: wrap;

            p {
                margin: 0 30px 10px 0;
                min-width: 200px;
            }
        }
    }

    .questions-container {
        .question-item {
            margin-bottom: 20px;

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;

                h3 {
                    margin: 0;
                }

                .question-meta {
                    display: flex;
                    align-items: center;

                    .question-score {
                        margin-left: 10px;
                        font-weight: bold;
                    }
                }
            }

            .question-content {
                .options {
                    margin-bottom: 15px;

                    .option-item {
                        margin-bottom: 10px;

                        .option-letter {
                            display: inline-block;
                            width: 25px;
                            font-weight: bold;
                        }
                    }

                    .true-false {
                        margin-bottom: 10px;
                    }
                }

                .answer-section {
                    margin-bottom: 15px;

                    h4 {
                        margin-top: 0;
                        margin-bottom: 10px;
                        border-left: 3px solid #409EFF;
                        padding-left: 10px;
                    }

                    .choice-answer {
                        font-weight: bold;
                    }

                    .text-answer {
                        background-color: #f5f7fa;
                        padding: 10px;
                        border-radius: 4px;
                    }
                }

                .scoring-section {
                    h4 {
                        margin-top: 15px;
                        margin-bottom: 10px;
                        border-left: 3px solid #E6A23C;
                        padding-left: 10px;
                    }

                    .score-hint {
                        font-size: 12px;
                        color: #909399;
                        margin-top: 5px;
                    }
                }
            }
        }
    }
}
</style>