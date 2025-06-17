<template>
    <div class="homework-create">
        <div class="create-header">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><a href="/teacher/homework/dashboard">作业管理</a></el-breadcrumb-item>
                <el-breadcrumb-item>创建作业</el-breadcrumb-item>
            </el-breadcrumb>
            <h1>创建新作业</h1>
        </div>

        <div class="create-container">
            <!-- 步骤导航 -->
            <div class="steps-container">
                <el-steps :active="currentStep" finish-status="success" align-center>
                    <el-step title="基本信息" description="设置作业标题和基本参数"></el-step>
                    <el-step title="选择题目" description="从题库中选择题目"></el-step>
                    <el-step title="发布设置" description="设置发布时间和权限"></el-step>
                </el-steps>
            </div>

            <!-- 步骤内容 -->
            <div class="step-content">
                <!-- 第一步：基本信息 -->
                <div v-show="currentStep === 0" class="step-panel">
                    <el-card class="info-card" shadow="never">
                        <div slot="header">
                            <span class="card-title">
                                <i class="el-icon-info"></i>
                                作业基本信息
                            </span>
                        </div>

                        <el-form :model="homeworkForm" :rules="homeworkRules" ref="homeworkForm" label-width="120px">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="作业标题" prop="title">
                                        <el-input v-model="homeworkForm.title" placeholder="请输入作业标题" maxlength="100"
                                            show-word-limit />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="所属课程" prop="courseId">
                                        <el-select v-model="homeworkForm.courseId" placeholder="选择课程"
                                            style="width: 100%" @change="handleCourseChange">
                                            <el-option v-for="course in courseOptions" :key="course.id"
                                                :label="course.name" :value="course.id" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="作业描述" prop="description">
                                <el-input v-model="homeworkForm.description" type="textarea" :rows="4"
                                    placeholder="请输入作业描述和要求" maxlength="500" show-word-limit />
                            </el-form-item>

                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <el-form-item label="作业总分" prop="totalScore">
                                        <el-input-number v-model="homeworkForm.totalScore" :min="1" :max="1000"
                                            style="width: 100%" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="允许多次提交" prop="maxAttempts">
                                        <el-input-number v-model="homeworkForm.maxAttempts" :min="0" :max="10"
                                            style="width: 100%" placeholder="0为不限制" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="时间限制" prop="timeLimit">
                                        <el-input-number v-model="homeworkForm.timeLimit" :min="0" :max="480"
                                            style="width: 100%" placeholder="分钟，0表示无限制" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-card>
                </div>

                <!-- 第二步：选择题目 -->
                <div v-show="currentStep === 1" class="step-panel">
                    <div class="question-selection">
                        <div class="selection-header">
                            <div class="header-left">
                                <span class="card-title">
                                    <i class="el-icon-s-order"></i>
                                    选择题目
                                </span>
                                <el-tag v-if="selectedQuestions.length > 0" type="success">
                                    已选择 {{ selectedQuestions.length }} 道题目
                                </el-tag>
                            </div>
                            <div class="header-right">
                                <el-input v-model="questionQuery.keyword" placeholder="搜索题目"
                                    prefix-icon="el-icon-search" style="width: 200px; margin-right: 10px;"
                                    @input="handleQuestionSearch" />
                                <el-select v-model="questionQuery.type" placeholder="题目类型" style="width: 120px;">
                                    <el-option label="全部" value="" />
                                    <el-option label="单选题" :value="1" />
                                    <el-option label="多选题" :value="2" />
                                    <el-option label="判断题" :value="3" />
                                    <el-option label="填空题" :value="4" />
                                    <el-option label="简答题" :value="5" />
                                    <el-option label="拍照上传" :value="6" />
                                </el-select>
                            </div>
                        </div>

                        <div class="question-content">
                            <el-row :gutter="20">
                                <!-- 题目库 -->
                                <el-col :span="16">
                                    <el-card class="question-bank" shadow="never">
                                        <div slot="header">
                                            <span>题目库</span>
                                        </div>

                                        <div class="question-list">
                                            <div v-for="question in questionList" :key="question.id"
                                                class="question-item"
                                                :class="{ selected: isQuestionSelected(question.id) }"
                                                @click="handleQuestionSelect(question)">
                                                <div class="question-header">
                                                    <div class="question-meta">
                                                        <el-tag :type="getQuestionTypeColor(question.questionType)"
                                                            size="mini">
                                                            {{ getQuestionTypeName(question.questionType) }}
                                                        </el-tag>
                                                        <span class="question-score">{{ question.score }}分</span>
                                                    </div>
                                                    <div class="question-actions">
                                                        <el-checkbox :value="isQuestionSelected(question.id)"
                                                            @change="handleQuestionSelect(question)" />
                                                    </div>
                                                </div>
                                                <div class="question-content" v-html="question.title"></div>
                                                <div v-if="question.options && question.options.length > 0"
                                                    class="question-options">
                                                    <div v-for="(option, index) in question.options.slice(0, 2)"
                                                        :key="index" class="option-preview">
                                                        {{ option.prefix }}. {{ option.content }}
                                                    </div>
                                                    <div v-if="question.options.length > 2" class="option-more">
                                                        ...还有{{ question.options.length - 2 }}个选项
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="question-pagination">
                                            <el-pagination @current-change="handleQuestionPageChange"
                                                :current-page="questionQuery.pageIndex"
                                                :page-size="questionQuery.pageSize" layout="prev, pager, next"
                                                :total="questionTotal" />
                                        </div>
                                    </el-card>
                                </el-col>

                                <!-- 已选题目 -->
                                <el-col :span="8">
                                    <el-card class="selected-questions" shadow="never">
                                        <div slot="header">
                                            <span>已选题目 ({{ selectedQuestions.length }})</span>
                                            <el-button type="text" size="small"
                                                @click="handleClearSelected">清空</el-button>
                                        </div>

                                        <div class="selected-list">
                                            <div v-for="(question, index) in selectedQuestions" :key="question.id"
                                                class="selected-item">
                                                <div class="selected-header">
                                                    <span class="selected-number">{{ index + 1 }}</span>
                                                    <el-tag :type="getQuestionTypeColor(question.questionType)"
                                                        size="mini">
                                                        {{ getQuestionTypeName(question.questionType) }}
                                                    </el-tag>
                                                    <el-button type="text" icon="el-icon-close" size="mini"
                                                        @click="handleQuestionRemove(question.id)" />
                                                </div>
                                                <div class="selected-content" v-html="question.title"></div>
                                                <div class="selected-score">
                                                    <el-input-number v-model="question.customScore" :min="1" :max="100"
                                                        size="mini" @change="updateTotalScore" />
                                                    <span>分</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="selectedQuestions.length === 0" class="empty-selected">
                                            <i class="el-icon-info"></i>
                                            <p>还未选择题目</p>
                                        </div>
                                    </el-card>
                                </el-col>
                            </el-row>
                        </div>
                    </div>
                </div>

                <!-- 第三步：发布设置 -->
                <div v-show="currentStep === 2" class="step-panel">
                    <el-card class="publish-card" shadow="never">
                        <div slot="header">
                            <span class="card-title">
                                <i class="el-icon-date"></i>
                                发布设置
                            </span>
                        </div>

                        <el-form :model="publishForm" :rules="publishRules" ref="publishForm" label-width="120px">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="开始时间" prop="startTime">
                                        <el-date-picker v-model="publishForm.startTime" type="datetime"
                                            placeholder="选择开始时间" style="width: 100%" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="结束时间" prop="endTime">
                                        <el-date-picker v-model="publishForm.endTime" type="datetime"
                                            placeholder="选择结束时间" style="width: 100%" />
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="发布方式">
                                <el-radio-group v-model="publishForm.publishType">
                                    <el-radio :label="1">立即发布</el-radio>
                                    <el-radio :label="2">保存为草稿</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="高级设置">
                                <el-switch v-model="publishForm.enableAdvanced" active-text="启用高级设置" />
                            </el-form-item>

                            <div v-if="publishForm.enableAdvanced" class="advanced-settings">
                                <el-form-item label="题目乱序">
                                    <el-switch v-model="publishForm.randomQuestion" />
                                </el-form-item>
                                <el-form-item label="选项乱序">
                                    <el-switch v-model="publishForm.randomOption" />
                                </el-form-item>
                                <el-form-item label="防切屏">
                                    <el-switch v-model="publishForm.antiCheating" />
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-card>

                    <!-- 作业预览 -->
                    <el-card class="preview-card" shadow="never">
                        <div slot="header">
                            <span class="card-title">
                                <i class="el-icon-view"></i>
                                作业预览
                            </span>
                        </div>

                        <div class="homework-preview">
                            <div class="preview-header">
                                <h3>{{ homeworkForm.title }}</h3>
                                <div class="preview-meta">
                                    <span>总分：{{ getTotalScore() }}分</span>
                                    <span>题目数：{{ selectedQuestions.length }}道</span>
                                    <span v-if="homeworkForm.timeLimit">时限：{{ homeworkForm.timeLimit }}分钟</span>
                                </div>
                            </div>
                            <div class="preview-description">{{ homeworkForm.description }}</div>
                            <div class="preview-questions">
                                <div v-for="(question, index) in selectedQuestions.slice(0, 3)" :key="question.id"
                                    class="preview-question">
                                    <span class="preview-number">{{ index + 1 }}.</span>
                                    <span class="preview-content" v-html="question.title"></span>
                                    <span class="preview-score">({{ question.customScore }}分)</span>
                                </div>
                                <div v-if="selectedQuestions.length > 3" class="preview-more">
                                    ...还有{{ selectedQuestions.length - 3 }}道题目
                                </div>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 步骤操作按钮 -->
            <div class="step-actions">
                <el-button v-if="currentStep > 0" @click="handlePrevStep">上一步</el-button>
                <el-button v-if="currentStep < 2" type="primary" @click="handleNextStep">下一步</el-button>
                <el-button v-if="currentStep === 2" type="success" @click="handleSubmit" :loading="submitting">
                    {{ publishForm.publishType === 1 ? '发布作业' : '保存草稿' }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { homeworkCreate } from '@/api/teacher/homework'
import { courseQuestionPage } from '@/api/teacher/question'
import { courseListByTeacher } from '@/api/teacher/course'

export default {
    name: 'HomeworkCreate',
    data() {
        return {
            currentStep: 0,
            submitting: false,
            courseOptions: [],
            questionList: [],
            questionTotal: 0,
            selectedQuestions: [],

            homeworkForm: {
                title: '',
                description: '',
                courseId: null,
                totalScore: 100,
                maxAttempts: 0,
                timeLimit: 0
            },

            publishForm: {
                startTime: new Date(),
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认一周后
                publishType: 1,
                enableAdvanced: false,
                randomQuestion: false,
                randomOption: false,
                antiCheating: false
            },

            questionQuery: {
                pageIndex: 1,
                pageSize: 10,
                keyword: '',
                type: ''
            },

            homeworkRules: {
                title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
                courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
                totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }]
            },

            publishRules: {
                startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
                endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
            }
        }
    },
    created() {
        this.loadCourses()
        this.loadQuestions()
    },
    methods: {
        async loadCourses() {
            try {
                const response = await courseListByTeacher()
                console.log('课程列表响应:', response) // 调试日志

                // 根据实际的响应结构处理数据
                if (response && response.code === 1 && response.response) {
                    this.courseOptions = response.response
                } else if (response && response.data) {
                    this.courseOptions = response.data
                } else if (Array.isArray(response)) {
                    this.courseOptions = response
                } else {
                    this.courseOptions = []
                    console.warn('课程数据格式异常:', response)
                }

                console.log('处理后的课程选项:', this.courseOptions)

                if (this.courseOptions.length === 0) {
                    this.$message.warning('暂无可用课程，请联系管理员分配课程权限')
                }
            } catch (error) {
                console.error('加载课程列表失败:', error)
                this.$message.error('加载课程列表失败: ' + (error.message || '未知错误'))
            }
        },

        async loadQuestions() {
            try {
                // 需要先选择课程才能加载题目
                if (!this.homeworkForm.courseId) {
                    this.questionList = []
                    this.questionTotal = 0
                    return
                }

                console.log('开始加载题目，课程ID:', this.homeworkForm.courseId, '查询参数:', this.questionQuery)
                const response = await courseQuestionPage(this.homeworkForm.courseId, this.questionQuery)
                console.log('题目API响应:', response)

                // 根据实际的API响应结构处理数据
                if (response && response.code === 1 && response.response) {
                    this.questionList = (response.response.list || []).map(question => ({
                        ...question,
                        title: question.shortTitle || question.title || '无标题',
                        customScore: Math.floor((question.score || 100) / 10) || 10
                    }))
                    this.questionTotal = response.response.total || 0
                    console.log('处理后的题目列表:', this.questionList)
                } else {
                    console.error('题目API响应格式异常:', response)
                    this.questionList = []
                    this.questionTotal = 0
                }
            } catch (error) {
                console.error('加载题目列表失败:', error)
                this.$message.error('加载题目列表失败: ' + (error.message || '网络错误'))
            }
        },

        handleCourseChange() {
            // 清空已选题目
            this.selectedQuestions = []
            // 重新加载题目
            this.questionQuery.pageIndex = 1
            this.loadQuestions()
        },

        handleQuestionSearch() {
            this.questionQuery.pageIndex = 1
            this.loadQuestions()
        },

        handleQuestionPageChange(page) {
            this.questionQuery.pageIndex = page
            this.loadQuestions()
        },

        isQuestionSelected(questionId) {
            return this.selectedQuestions.some(q => q.id === questionId)
        },

        handleQuestionSelect(question) {
            const index = this.selectedQuestions.findIndex(q => q.id === question.id)
            if (index > -1) {
                this.selectedQuestions.splice(index, 1)
            } else {
                this.selectedQuestions.push({ ...question })
            }
            this.updateTotalScore()
        },

        handleQuestionRemove(questionId) {
            const index = this.selectedQuestions.findIndex(q => q.id === questionId)
            if (index > -1) {
                this.selectedQuestions.splice(index, 1)
                this.updateTotalScore()
            }
        },

        handleClearSelected() {
            this.selectedQuestions = []
            this.updateTotalScore()
        },

        updateTotalScore() {
            const total = this.selectedQuestions.reduce((sum, q) => sum + (q.customScore || 0), 0)
            this.homeworkForm.totalScore = total
        },

        getTotalScore() {
            return this.selectedQuestions.reduce((sum, q) => sum + (q.customScore || 0), 0)
        },

        getQuestionTypeName(type) {
            const typeMap = {
                1: '单选',
                2: '多选',
                3: '判断',
                4: '填空',
                5: '简答',
                6: '拍照'
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

        async handleNextStep() {
            if (this.currentStep === 0) {
                try {
                    await this.$refs.homeworkForm.validate()
                    this.currentStep++
                } catch (error) {
                    // 验证失败
                }
            } else if (this.currentStep === 1) {
                if (this.selectedQuestions.length === 0) {
                    this.$message.warning('请至少选择一道题目')
                    return
                }
                this.currentStep++
            }
        },

        handlePrevStep() {
            if (this.currentStep > 0) {
                this.currentStep--
            }
        },

        async handleSubmit() {
            try {
                await this.$refs.publishForm.validate()

                this.submitting = true

                const submitData = {
                    ...this.homeworkForm,
                    ...this.publishForm,
                    questions: this.selectedQuestions.map(q => ({
                        questionId: q.id,
                        score: q.customScore * 10 // 转换为千分制
                    })),
                    totalScore: this.getTotalScore() * 10 // 转换为千分制
                }

                await homeworkCreate(submitData)

                this.$message.success(this.publishForm.publishType === 1 ? '作业发布成功' : '作业保存成功')
                this.$router.push('/teacher/homework/dashboard')

            } catch (error) {
                this.$message.error('操作失败')
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-create {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.create-header {
    margin-bottom: 20px;

    h1 {
        margin: 10px 0;
        color: #303133;
        font-size: 24px;
        font-weight: 600;
    }
}

.create-container {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.steps-container {
    margin-bottom: 40px;
}

.step-content {
    margin-bottom: 30px;
}

.step-panel {
    min-height: 400px;
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

.info-card {
    .el-form {
        padding: 20px 0;
    }
}

.question-selection {
    .selection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header-right {
            display: flex;
            align-items: center;
        }
    }
}

.question-bank {
    height: 600px;
    display: flex;
    flex-direction: column;

    .el-card__body {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .question-list {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 20px;
    }

    .question-item {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            border-color: #409EFF;
            box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.2);
        }

        &.selected {
            border-color: #67C23A;
            background-color: #f0f9ff;
        }

        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .question-meta {
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
            margin-bottom: 10px;
        }

        .question-options {
            font-size: 14px;
            color: #606266;

            .option-preview {
                margin-bottom: 5px;
            }

            .option-more {
                color: #909399;
                font-style: italic;
            }
        }
    }
}

.selected-questions {
    height: 600px;

    .el-card__body {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .selected-list {
        flex: 1;
        overflow-y: auto;
    }

    .selected-item {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 10px;

        .selected-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .selected-number {
                background: #409EFF;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
        }

        .selected-content {
            font-size: 14px;
            color: #303133;
            line-height: 1.4;
            margin-bottom: 8px;
        }

        .selected-score {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
        }
    }

    .empty-selected {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #909399;

        i {
            font-size: 48px;
            margin-bottom: 10px;
        }
    }
}

.publish-card,
.preview-card {
    margin-bottom: 20px;
}

.advanced-settings {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 20px;
    margin-top: 15px;
}

.homework-preview {
    .preview-header {
        margin-bottom: 15px;

        h3 {
            margin: 0 0 10px 0;
            color: #303133;
        }

        .preview-meta {
            display: flex;
            gap: 20px;
            color: #606266;
            font-size: 14px;
        }
    }

    .preview-description {
        color: #606266;
        line-height: 1.6;
        margin-bottom: 15px;
    }

    .preview-questions {
        .preview-question {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;

            .preview-number {
                margin-right: 8px;
                color: #409EFF;
                font-weight: 500;
            }

            .preview-content {
                flex: 1;
                color: #303133;
            }

            .preview-score {
                color: #E6A23C;
                font-weight: 500;
            }
        }

        .preview-more {
            color: #909399;
            font-style: italic;
            text-align: center;
            margin-top: 10px;
        }
    }
}

.step-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
    .homework-create {
        padding: 15px;
    }

    .create-container {
        padding: 20px;
    }

    .question-content .el-col {
        margin-bottom: 20px;
    }

    .selection-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}
</style>