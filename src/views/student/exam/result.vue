<template>
    <div class="app-container">
        <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
                <span>测验结果</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">返回课程</el-button>
            </div>
            <div v-loading="loading">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <div class="result-header">
                            <h2>{{ examResult.paperName }}</h2>
                            <div class="result-info">
                                <div class="info-item">
                                    <span class="label">测验状态：</span>
                                    <el-tag :type="getStatusType(examResult.status)">{{ getStatusText(examResult.status)
                                    }}</el-tag>
                                </div>
                                <div class="info-item">
                                    <span class="label">开始时间：</span>
                                    <span>{{ formatDate(examResult.createTime) }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">用时：</span>
                                    <span>{{ formatSeconds(examResult.doTime) }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">得分：</span>
                                    <span class="score">{{ examResult.userScore }}</span>/{{ examResult.paperScore }}
                                </div>
                                <div class="info-item">
                                    <span class="label">正确题数：</span>
                                    <span>{{ examResult.questionCorrect }}/{{ examResult.questionCount }}</span>
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>

                <el-divider content-position="center">答题详情</el-divider>

                <div v-if="answerDetails.length > 0">
                    <div v-for="(item, index) in answerDetails" :key="index" class="question-item">
                        <div class="question-header">
                            <span class="question-number">{{ index + 1 }}. </span>
                            <span class="question-type">[{{ getQuestionType(item.questionType) }}]</span>
                            <span v-html="item.title"></span>
                            <span class="question-score">（{{ item.score }}分）</span>
                        </div>

                        <div class="question-content" v-html="item.content"></div>

                        <div class="answer-section">
                            <div class="correct-answer">
                                <span class="label">正确答案：</span>
                                <span v-html="item.correct"></span>
                            </div>
                            <div class="your-answer">
                                <span class="label">你的答案：</span>
                                <span v-html="item.answer"
                                    :class="{ 'correct': item.doRight, 'wrong': !item.doRight }"></span>
                            </div>
                            <div class="result">
                                <span class="label">得分：</span>
                                <span>{{ item.customerScore }}</span>
                            </div>
                        </div>

                        <div class="analysis" v-if="item.analyze">
                            <span class="label">解析：</span>
                            <span v-html="item.analyze"></span>
                        </div>

                        <el-divider></el-divider>
                    </div>
                </div>
                <div v-else class="empty-data">
                    暂无答题详情
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { formatSeconds, formatDate } from '@/utils'
import examPaperAnswerApi from '@/api/examPaperAnswer'

export default {
    data() {
        return {
            loading: false,
            answerId: null,
            courseId: null,
            examResult: {
                id: null,
                paperId: null,
                paperName: '',
                userScore: 0,
                paperScore: 0,
                questionCorrect: 0,
                questionCount: 0,
                doTime: 0,
                status: 0,
                createTime: null
            },
            answerDetails: []
        }
    },
    created() {
        this.answerId = this.$route.query.id
        this.courseId = this.$route.query.courseId
        if (this.answerId) {
            this.loadExamResult()
        }
    },
    methods: {
        loadExamResult() {
            this.loading = true
            examPaperAnswerApi.answerRead(this.answerId).then(res => {
                if (res.code === 1) {
                    this.examResult = {
                        id: res.response.id,
                        paperId: res.response.examPaperId,
                        paperName: res.response.paperName,
                        userScore: res.response.userScore,
                        paperScore: res.response.paperScore,
                        questionCorrect: res.response.questionCorrect,
                        questionCount: res.response.questionCount,
                        doTime: res.response.doTime,
                        status: res.response.status,
                        createTime: res.response.createTime
                    }
                    this.answerDetails = res.response.answerItems || []
                } else {
                    this.$message.error(res.message)
                }
                this.loading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取测验结果失败')
                this.loading = false
            })
        },
        formatSeconds(seconds) {
            return formatSeconds(seconds)
        },
        formatDate(time) {
            return formatDate(time)
        },
        getStatusType(status) {
            switch (status) {
                case 1: return 'warning' // 待批改
                case 2: return 'success' // 完成
                default: return 'info'
            }
        },
        getStatusText(status) {
            switch (status) {
                case 1: return '待批改'
                case 2: return '已完成'
                default: return '未知'
            }
        },
        getQuestionType(type) {
            switch (type) {
                case 1: return '单选题'
                case 2: return '多选题'
                case 3: return '判断题'
                case 4: return '填空题'
                case 5: return '简答题'
                default: return '未知'
            }
        },
        goBack() {
            if (this.courseId) {
                this.$router.push(`/student/course/${this.courseId}`)
            } else {
                this.$router.push('/student/course/list')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.result-header {
    text-align: center;
    margin-bottom: 20px;

    h2 {
        margin-bottom: 15px;
    }

    .result-info {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        .info-item {
            margin: 0 15px 10px;

            .label {
                color: #606266;
            }

            .score {
                font-size: 18px;
                font-weight: bold;
                color: #f56c6c;
            }
        }
    }
}

.question-item {
    margin-bottom: 20px;

    .question-header {
        font-weight: bold;
        margin-bottom: 10px;

        .question-type {
            margin-right: 8px;
            color: #409EFF;
        }

        .question-score {
            color: #909399;
            margin-left: 5px;
        }
    }

    .question-content {
        margin-bottom: 15px;
        padding-left: 20px;
    }

    .answer-section {
        margin-bottom: 15px;
        padding-left: 20px;

        .correct-answer,
        .your-answer,
        .result {
            margin-bottom: 8px;

            .label {
                font-weight: bold;
                color: #606266;
            }

            .correct {
                color: #67C23A;
            }

            .wrong {
                color: #F56C6C;
            }
        }
    }

    .analysis {
        padding-left: 20px;
        color: #909399;

        .label {
            font-weight: bold;
        }
    }
}

.empty-data {
    text-align: center;
    color: #909399;
    padding: 30px 0;
}
</style>