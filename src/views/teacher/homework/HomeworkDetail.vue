<template>
    <div class="homework-detail">
        <!-- 页面头部 -->
        <div class="detail-header">
            <div class="header-left">
                <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
                <h1>{{ homework.title || '作业详情' }}</h1>
            </div>
            <div class="header-actions">
                <el-button v-if="homework.status === 1" type="primary" @click="handlePublish">发布作业</el-button>
                <el-button v-if="homework.status === 2" type="warning" @click="handleEnd">结束作业</el-button>
                <el-button type="info" @click="handleStatistics">查看统计</el-button>
                <el-button type="success" @click="handleGrade">批改作业</el-button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 作业信息 -->
        <div v-else-if="homework.id" class="detail-content">
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
                            <span>{{ homework.title }}</span>
                        </div>
                        <div class="info-item">
                            <label>所属课程：</label>
                            <span>{{ homework.courseName || '未指定' }}</span>
                        </div>
                        <div class="info-item">
                            <label>作业总分：</label>
                            <span>{{ homework.totalScore || 0 }}分</span>
                        </div>
                        <div class="info-item">
                            <label>答题次数：</label>
                            <span>{{ homework.attemptLimit || '不限' }}次</span>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="info-item">
                            <label>开始时间：</label>
                            <span>{{ homework.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                        </div>
                        <div class="info-item">
                            <label>结束时间：</label>
                            <span>{{ homework.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                        </div>
                        <div class="info-item">
                            <label>时间限制：</label>
                            <span>{{ homework.timeLimit ? homework.timeLimit + '分钟' : '无限制' }}</span>
                        </div>
                        <div class="info-item">
                            <label>作业状态：</label>
                            <el-tag :type="getStatusTagType(homework.status)">
                                {{ getStatusText(homework.status) }}
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
                        题目列表 ({{ questions.length }}道)
                    </span>
                </div>

                <div class="questions-list">
                    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                        <div class="question-header">
                            <span class="question-number">{{ index + 1 }}.</span>
                            <div class="question-info">
                                <el-tag :type="getQuestionTypeColor(question.questionType)" size="mini">
                                    {{ getQuestionTypeName(question.questionType) }}
                                </el-tag>
                                <span class="question-score">{{ question.score }}分</span>
                            </div>
                        </div>
                        <div class="question-content" v-html="question.title"></div>
                        <div v-if="question.items && question.items.length > 0" class="question-options">
                            <div v-for="(option, optIndex) in question.items" :key="optIndex" class="option-item">
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
import { homeworkDetail, homeworkPublish, homeworkEnd } from '@/api/teacher/homework'
import { parseTime } from '@/utils'

export default {
    name: 'HomeworkDetail',
    filters: {
        parseTime
    },
    data() {
        return {
            loading: true,
            homework: {},
        }
    },
    computed: {
        questions() {
            return this.homework.questions || []
        }
    },
    created() {
        this.loadHomeworkDetail()
    },
    methods: {
        async loadHomeworkDetail() {
            this.loading = true
            try {
                const courseId = this.$route.params.id
                const homeworkId = this.$route.params.homeworkId

                if (!courseId || !homeworkId) {
                    this.$message.error('URL参数不完整，缺少课程或作业ID')
                    this.loading = false
                    return
                }

                const res = await homeworkDetail(courseId, homeworkId)
                console.log('[DEBUG] API Response:', JSON.stringify(res, null, 2));

                if (res.code === 1 && res.response) {
                    this.homework = res.response
                    console.log('[DEBUG] Homework data assigned:', JSON.stringify(this.homework, null, 2));

                    // 强制Vue更新视图
                    this.$forceUpdate();

                    // 使用 $nextTick 确保在DOM更新后再进行操作
                    this.$nextTick(() => {
                        console.log('[DEBUG] DOM updated. Questions count:', this.questions.length);
                    });
                } else {
                    this.$message.error(res.message || '加载作业详情失败')
                    this.homework = {}
                }
            } catch (error) {
                this.$message.error('加载作业详情时发生网络错误')
                console.error('加载作业详情失败:', error)
                this.homework = {}
            } finally {
                this.loading = false
            }
        },

        handleBack() {
            const courseId = this.$route.params.id
            this.$router.push(`/teacher/course/${courseId}/homework`)
        },

        handlePublish() {
            this.$confirm('确定要发布这个作业吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const courseId = this.$route.params.id
                    const homeworkId = this.$route.params.homeworkId
                    await homeworkPublish(courseId, homeworkId)
                    this.$message.success('发布成功')
                    this.loadHomeworkDetail()
                } catch (error) {
                    console.error('发布失败:', error)
                    this.$message.error('发布失败')
                }
            })
        },

        handleEnd() {
            this.$confirm('确定要结束这个作业吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const courseId = this.$route.params.id
                    const homeworkId = this.$route.params.homeworkId
                    await homeworkEnd(courseId, homeworkId)
                    this.$message.success('作业已结束')
                    this.loadHomeworkDetail()
                } catch (error) {
                    console.error('结束失败:', error)
                    this.$message.error('结束失败')
                }
            })
        },

        handleStatistics() {
            const courseId = this.$route.params.id
            const homeworkId = this.$route.params.homeworkId
            this.$router.push(`/teacher/course/${courseId}/homework/statistics/${homeworkId}`)
        },

        handleGrade() {
            const courseId = this.$route.params.id
            const homeworkId = this.$route.params.homeworkId
            this.$router.push(`/teacher/course/${courseId}/homework/grade/${homeworkId}`)
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
                3: '判断题',
                4: '填空题',
                5: '简答题',
                6: '拍照上传'
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
