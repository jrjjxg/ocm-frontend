<template>
    <div class="homework-detail">
        <!-- 页面头部 -->
        <div class="detail-header">
            <div class="header-left">
                <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
                <h1>{{ (homework && homework.title) || '作业详情' }}</h1>
            </div>
            <div class="header-actions">
                <el-button v-if="homework && homework.status === 1" type="primary"
                    @click="handlePublish">发布作业</el-button>
                <el-button v-if="homework && homework.status === 2" type="warning" @click="handleEnd">结束作业</el-button>
                <el-button type="info" @click="handleStatistics">统计分析</el-button>
                <el-button type="success" @click="handleGrade">批改作业</el-button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 作业内容 -->
        <div v-else-if="homework && homework.id" class="detail-content">
            <!-- 基本信息卡片 -->
            <el-card class="info-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-document"></i>
                        基本信息
                    </span>
                </div>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="info-item">
                            <label>作业标题：</label>
                            <span>{{ homework && homework.title || '-' }}</span>
                        </div>
                        <div class="info-item">
                            <label>所属课程：</label>
                            <span>{{ homework && homework.courseName || '未知课程' }}</span>
                        </div>
                        <div class="info-item">
                            <label>作业总分：</label>
                            <span>{{ homework && homework.totalScore ? homework.totalScore / 10 : 0 }}分</span>
                        </div>
                        <div class="info-item">
                            <label>允许提交次数：</label>
                            <span>{{ homework && homework.attemptLimit || '无限制' }}次</span>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="info-item">
                            <label>开始时间：</label>
                            <span>{{ homework && homework.startTime ? formatTime(homework.startTime) : '-' }}</span>
                        </div>
                        <div class="info-item">
                            <label>结束时间：</label>
                            <span>{{ homework && homework.endTime ? formatTime(homework.endTime) : '-' }}</span>
                        </div>
                        <div class="info-item">
                            <label>时间限制：</label>
                            <span>{{ homework && homework.timeLimit ? homework.timeLimit + '分钟' : '无时间限制' }}</span>
                        </div>
                        <div class="info-item">
                            <label>作业状态：</label>
                            <el-tag :type="getStatusTagType(homework && homework.status)">
                                {{ getStatusText(homework && homework.status) }}
                            </el-tag>
                        </div>
                    </el-col>
                </el-row>

                <div v-if="homework.description" class="homework-description">
                    <label>作业描述：</label>
                    <div class="description-content">{{ homework.description }}</div>
                </div>
            </el-card>

            <!-- 题目列表卡片 -->
            <el-card class="questions-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-s-order"></i>
                        题目列表 ({{ questions.length }}题)
                    </span>
                </div>

                <div v-if="questionsLoading" class="questions-loading">
                    <el-skeleton :rows="3" animated />
                </div>

                <div v-else class="questions-list">
                    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                        <div class="question-header">
                            <span class="question-number">{{ index + 1 }}.</span>
                            <div class="question-info">
                                <el-tag :type="getQuestionTypeColor(question.questionType)" size="mini">
                                    {{ getQuestionTypeName(question.questionType) }}
                                </el-tag>
                                <span class="question-score">{{ question.score / 10 }}分</span>
                            </div>
                        </div>
                        <div class="question-content" v-html="question.title"></div>
                        <div v-if="question.options && question.options.length > 0" class="question-options">
                            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                                {{ option.prefix }}. {{ option.content }}
                            </div>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 错误状态 -->
        <div v-else class="error-container">
            <el-empty description="作业不存在或已被删除">
                <el-button type="primary" @click="handleBack">返回列表</el-button>
            </el-empty>
        </div>
    </div>
</template>

<script>
import { homeworkDetail, homeworkQuestions, homeworkPublish, homeworkEnd } from '@/api/teacher/homework'

export default {
    name: 'HomeworkDetail',
    data() {
        return {
            loading: true,
            questionsLoading: false,
            homework: {},
            questions: []
        }
    },
    created() {
        this.loadHomeworkDetail()
    },
    methods: {
        async loadHomeworkDetail() {
            try {
                this.loading = true
                const courseId = this.$route.params.id
                const homeworkId = this.$route.params.homeworkId

                // 获取作业详情
                const homeworkResponse = await homeworkDetail(courseId, homeworkId)
                this.homework = homeworkResponse.data

                // 获取题目列表
                this.loadQuestions(courseId, homeworkId)

            } catch (error) {
                this.$message.error('加载作业详情失败')
                console.error('Load homework detail error:', error)
            } finally {
                this.loading = false
            }
        },

        async loadQuestions(courseId, homeworkId) {
            try {
                this.questionsLoading = true
                const response = await homeworkQuestions(courseId, homeworkId)
                this.questions = response.data || []
            } catch (error) {
                this.$message.error('加载题目列表失败')
                console.error('Load questions error:', error)
            } finally {
                this.questionsLoading = false
            }
        },

        handleBack() {
            this.$router.go(-1)
        },

        handlePublish() {
            this.$confirm('确认要发布这个作业吗？', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const courseId = this.$route.params.id
                    await homeworkPublish(courseId, this.homework.id)
                    this.$message.success('发布成功')
                    this.loadHomeworkDetail()
                } catch (error) {
                    this.$message.error('发布失败')
                    console.error('Publish homework error:', error)
                }
            })
        },

        handleEnd() {
            this.$confirm('确认要结束这个作业吗？', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const courseId = this.$route.params.id
                    await homeworkEnd(courseId, this.homework.id)
                    this.$message.success('作业已结束')
                    this.loadHomeworkDetail()
                } catch (error) {
                    this.$message.error('结束失败')
                    console.error('End homework error:', error)
                }
            })
        },

        handleStatistics() {
            this.$router.push(`/teacher/course/${this.$route.params.id}/homework/statistics/${this.homework.id}`)
        },

        handleGrade() {
            this.$router.push(`/teacher/course/${this.$route.params.id}/homework/grade/${this.homework.id}`)
        },

        getStatusText(status) {
            const statusMap = {
                1: '草稿',
                2: '进行中',
                3: '已结束'
            }
            return statusMap[status] || '未知'
        },

        getStatusTagType(status) {
            const typeMap = {
                1: 'info',
                2: 'success',
                3: 'warning'
            }
            return typeMap[status] || 'info'
        },

        getQuestionTypeName(type) {
            const typeMap = {
                1: '单选题',
                2: '多选题',
                3: '填空题',
                4: '判断题',
                5: '简答题',
                6: '编程题'
            }
            return typeMap[type] || '未知'
        },

        getQuestionTypeColor(type) {
            const colorMap = {
                1: 'primary',
                2: 'success',
                3: 'warning',
                4: 'info',
                5: 'danger',
                6: ''
            }
            return colorMap[type] || 'info'
        },

        formatTime(time) {
            if (!time) return '-'
            const date = new Date(time)
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-detail {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.detail-header {
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

.loading-container,
.error-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-content {

    .info-card,
    .questions-card {
        margin-bottom: 20px;
    }

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

    .info-item {
        margin-bottom: 15px;
        display: flex;
        align-items: center;

        label {
            font-weight: 500;
            color: #606266;
            width: 100px;
            margin-right: 10px;
        }

        span {
            color: #303133;
        }
    }

    .homework-description {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;

        label {
            font-weight: 500;
            color: #606266;
            margin-bottom: 10px;
            display: block;
        }

        .description-content {
            color: #303133;
            line-height: 1.6;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
        }
    }

    .questions-loading {
        padding: 20px;
    }

    .questions-list {
        .question-item {
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            background: #fafafa;

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;

                .question-number {
                    font-size: 18px;
                    font-weight: bold;
                    color: #409EFF;
                    margin-right: 10px;
                }

                .question-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .question-score {
                        color: #E6A23C;
                        font-weight: 500;
                    }
                }
            }

            .question-content {
                color: #303133;
                line-height: 1.6;
                margin-bottom: 15px;
                font-size: 16px;
            }

            .question-options {
                .option-item {
                    margin-bottom: 8px;
                    color: #606266;
                    padding-left: 20px;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .homework-detail {
        padding: 15px;
    }

    .detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .header-actions {
        width: 100%;
        justify-content: space-between;
    }

    .info-item {
        flex-direction: column;
        align-items: flex-start;

        label {
            margin-bottom: 5px;
        }
    }
}
</style>
