<template>
    <div class="homework-grade">
        <!-- 页面头部 -->
        <div class="grade-header">
            <div class="header-left">
                <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
                <h1>作业批改</h1>
            </div>
            <div class="header-actions">
                <el-button icon="el-icon-refresh" @click="loadGradeData">刷新</el-button>
                <el-button type="primary" @click="handleBatchGrade">批量评分</el-button>
            </div>
        </div>

        <!-- 筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <div class="filter-container">
                <div class="filter-left">
                    <el-input v-model="filterKeyword" placeholder="搜索学生姓名或学号" prefix-icon="el-icon-search"
                        style="width: 250px; margin-right: 15px;" @input="handleFilter" />
                    <el-select v-model="filterStatus" placeholder="批改状态" style="width: 150px; margin-right: 15px;">
                        <el-option label="全部" value="" />
                        <el-option label="已批改" value="graded" />
                        <el-option label="待批改" value="pending" />
                        <el-option label="自动评分" value="auto" />
                    </el-select>
                    <el-button type="primary" @click="handleFilter">筛选</el-button>
                </div>
                <div class="filter-right">
                    <span class="grade-stats">
                        已批改: {{ gradedCount }} / {{ totalCount }}
                    </span>
                </div>
            </div>
        </el-card>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 学生作业列表 -->
        <div v-else class="grade-content">
            <el-card shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-edit"></i>
                        {{ $route.params.homeworkId ? '学生提交列表' : '待批改作业列表' }}
                    </span>
                </div>

                <el-table :data="filteredSubmissions" style="width: 100%" stripe>
                    <el-table-column v-if="$route.params.homeworkId" type="selection" width="55" />
                    <el-table-column v-if="$route.params.homeworkId" prop="studentName" label="学生姓名" width="120" />
                    <el-table-column v-if="$route.params.homeworkId" prop="studentNumber" label="学号" width="120" />
                    <el-table-column v-if="!$route.params.homeworkId" prop="homeworkTitle" label="作业标题"
                        min-width="200" />
                    <el-table-column v-if="!$route.params.homeworkId" prop="courseName" label="所属课程" width="150" />
                    <el-table-column v-if="$route.params.homeworkId" label="提交状态" width="100" align="center">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.submitted ? 'success' : 'danger'" size="small">
                                {{ scope.row.submitted ? '已提交' : '未提交' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!$route.params.homeworkId" label="待批改数量" width="120" align="center">
                        <template slot-scope="scope">
                            <el-tag type="warning" size="small">
                                {{ scope.row.pendingCount }}/{{ scope.row.totalCount }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="批改状态" width="100" align="center">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.submitted" :type="getGradeStatusType(scope.row.gradeStatus)"
                                size="small">
                                {{ getGradeStatusText(scope.row.gradeStatus) }}
                            </el-tag>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="得分" width="80" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.submitted && scope.row.score !== null">
                                {{ scope.row.score }}/{{ scope.row.totalScore }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="submitTime" label="提交时间" width="180">
                        <template slot-scope="scope">
                            <span v-if="scope.row.submitTime">
                                {{ scope.row.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="gradeTime" label="批改时间" width="180">
                        <template slot-scope="scope">
                            <span v-if="scope.row.gradeTime">
                                {{ scope.row.gradeTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button v-if="$route.params.homeworkId && scope.row.submitted" type="text" size="small"
                                @click="handleGradeStudent(scope.row)">
                                {{ scope.row.gradeStatus === 'pending' ? '开始批改' : '重新批改' }}
                            </el-button>
                            <el-button v-if="$route.params.homeworkId && scope.row.submitted" type="text" size="small"
                                @click="handleViewAnswers(scope.row)">
                                查看答题
                            </el-button>
                            <el-button v-if="!$route.params.homeworkId" type="primary" size="small"
                                @click="$router.push(`/teacher/course/${$route.params.id}/homework/grade/${scope.row.id}`)">
                                开始批改
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
                        layout="total, prev, pager, next" :total="totalSubmissions" />
                </div>
            </el-card>
        </div>

        <!-- 批改弹窗 -->
        <el-dialog title="批改作业" :visible.sync="gradeDialogVisible" width="80%" :close-on-click-modal="false">
            <div v-if="currentStudent" class="grade-dialog">
                <div class="student-info">
                    <h3>{{ currentStudent.studentName }} ({{ currentStudent.studentNumber }})</h3>
                    <p>提交时间: {{ currentStudent.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
                </div>

                <div class="grade-questions">
                    <div v-for="(answer, index) in currentAnswers" :key="answer.id" class="question-grade">
                        <div class="question-header">
                            <span class="question-number">第{{ index + 1 }}题</span>
                            <el-tag :type="getQuestionTypeTag(answer.questionType)" size="mini">
                                {{ getQuestionTypeText(answer.questionType) }}
                            </el-tag>
                            <span class="question-score">{{ answer.questionScore }}分</span>
                        </div>

                        <!-- 题目内容 -->
                        <div class="question-content">
                            <div class="question-title" v-if="answer.questionTitle" v-html="answer.questionTitle"></div>
                            <div v-else class="no-content">题目内容加载中...</div>

                            <!-- 选择题选项 -->
                            <div v-if="answer.questionContent && answer.questionContent.questionItemObjects && answer.questionContent.questionItemObjects.length > 0"
                                class="question-options">
                                <div v-for="(option, optIndex) in answer.questionContent.questionItemObjects"
                                    :key="optIndex" class="option-item">
                                    <span class="option-prefix">{{ option.prefix }}.</span>
                                    <span class="option-content" v-html="option.content"></span>
                                    <!-- 显示正确答案标识 -->
                                    <el-tag v-if="isCorrectOption(answer.questionContent.correct, option.prefix)"
                                        type="success" size="mini" class="correct-tag">正确答案</el-tag>
                                </div>
                            </div>

                            <!-- 正确答案（对于没有选项的题目） -->
                            <div v-if="answer.questionContent && answer.questionContent.correct && !answer.questionContent.questionItemObjects?.length"
                                class="correct-answer">
                                <strong>参考答案：</strong>
                                <span v-html="answer.questionContent.correct"></span>
                            </div>
                        </div>

                        <!-- 学生答案 -->
                        <div class="student-answer">
                            <h4>学生答案:</h4>
                            <div class="answer-content" :class="getAnswerClass(answer)">
                                <span v-if="answer.studentAnswer">{{ answer.studentAnswer }}</span>
                                <span v-else class="no-answer">学生未答题</span>
                                <!-- 自动判题结果 -->
                                <el-tag v-if="[2, 3].includes(answer.questionType)"
                                    :type="answer.isCorrect ? 'success' : 'danger'" size="mini" class="answer-result">
                                    {{ answer.isCorrect ? '正确' : '错误' }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 评分区域 - 只对填空题和问答题显示 -->
                        <div v-if="[4, 5].includes(answer.questionType)" class="grade-section">
                            <el-form>
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <el-form-item label="得分:">
                                            <el-input-number v-model="answer.score" :min="0" :max="answer.questionScore"
                                                size="small" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="16">
                                        <el-form-item label="评语:">
                                            <el-input v-model="answer.feedback" type="textarea" :rows="2"
                                                placeholder="请输入评语" size="small" />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                        </div>

                        <!-- 客观题自动评分显示 -->
                        <div v-else class="auto-grade-section">
                            <div class="auto-score">
                                <span class="score-label">自动评分:</span>
                                <span class="score-value" :class="answer.isCorrect ? 'correct-score' : 'wrong-score'">
                                    {{ answer.isCorrect ? answer.questionScore : 0 }}/{{ answer.questionScore }}分
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="gradeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSaveGrade" :loading="grading">保存批改</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { homeworkStudentAnswers, homeworkManualGrade, homeworkPendingPage } from '@/api/teacher/homework'

export default {
    name: 'HomeworkGrade',
    data() {
        return {
            loading: true,
            grading: false,
            filterKeyword: '',
            filterStatus: '',
            currentPage: 1,
            pageSize: 20,
            submissions: [],
            totalSubmissions: 0,
            gradeDialogVisible: false,
            currentStudent: null,
            currentAnswers: [],
            // 添加统计数据作为数据属性
            totalStudents: 0,
            submittedCount: 0,
            gradedCount: 0
        }
    },
    computed: {
        filteredSubmissions() {
            let filtered = this.submissions

            if (this.filterKeyword) {
                filtered = filtered.filter(item =>
                    item.studentName.includes(this.filterKeyword) ||
                    item.studentNumber.includes(this.filterKeyword)
                )
            }

            if (this.filterStatus) {
                filtered = filtered.filter(item => {
                    if (this.filterStatus === 'graded') {
                        return item.gradeStatus === 'graded'
                    } else if (this.filterStatus === 'pending') {
                        return item.gradeStatus === 'pending'
                    } else if (this.filterStatus === 'auto') {
                        return item.gradeStatus === 'auto'
                    }
                    return true
                })
            }

            return filtered
        },
        totalCount() {
            return this.submissions.filter(item => item.submitted).length
        }
    },
    created() {
        // 如果有作业ID参数，加载该作业的批改数据
        if (this.$route.params.homeworkId) {
            this.loadGradeData()
        } else {
            // 如果没有ID参数，显示所有待批改作业列表
            this.loadPendingHomeworkList()
        }
    },
    methods: {
        async loadGradeData() {
            try {
                this.loading = true
                const homeworkId = this.$route.params.homeworkId
                const courseId = this.$route.params.id // 从URL路径获取课程ID

                // 使用正确的RESTful API获取学生提交列表
                const { homeworkSubmissions } = await import('@/api/teacher/homework')
                const response = await homeworkSubmissions(courseId, homeworkId, {
                    pageIndex: this.currentPage,
                    pageSize: this.pageSize,
                    status: this.filterStatus,
                    keyword: this.filterKeyword
                })

                if (response && response.response) {
                    this.submissions = response.response.list || []
                    this.totalSubmissions = response.response.total || 0

                    // 设置统计信息
                    if (response.response.statistics) {
                        const stats = response.response.statistics
                        this.totalStudents = stats.totalStudents || 0
                        this.submittedCount = stats.submittedCount || 0
                        this.gradedCount = stats.gradedCount || 0
                    }
                } else {
                    this.submissions = []
                    this.totalSubmissions = 0
                }

                console.log('加载的提交数据:', this.submissions)

            } catch (error) {
                this.$message.error('加载批改数据失败: ' + error.message)
                console.error('Load grade data error:', error)
                this.submissions = []
                this.totalSubmissions = 0
            } finally {
                this.loading = false
            }
        },

        async handleGradeStudent(student) {
            try {
                this.currentStudent = student
                this.gradeDialogVisible = true

                console.log('开始获取学生答题详情:', student)

                // 获取学生答题详情
                const courseId = this.$route.params.id
                const homeworkId = this.$route.params.homeworkId
                const response = await homeworkStudentAnswers(courseId, homeworkId, student.studentId)

                console.log('API响应数据:', response)

                // 处理API返回的数据结构
                if (response && response.response) {
                    this.currentAnswers = response.response.map(answer => {
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
                } else {
                    this.currentAnswers = []
                }

                console.log('处理后的答题数据:', this.currentAnswers)

            } catch (error) {
                this.$message.error('加载学生答题失败: ' + error.message)
                console.error('Load student answers error:', error)
                this.currentAnswers = []
            }
        },

        async handleSaveGrade() {
            try {
                this.grading = true

                const courseId = this.$route.params.id
                const homeworkId = this.$route.params.homeworkId
                const studentId = this.currentStudent.studentId

                // 过滤出需要人工评分的题目（填空题和问答题）
                const manualGradeAnswers = this.currentAnswers.filter(answer =>
                    [4, 5].includes(answer.questionType) && answer.id
                )

                if (manualGradeAnswers.length === 0) {
                    this.$message.warning('没有需要批改的题目')
                    return
                }

                // 使用新的RESTful API进行批改
                const gradeData = {
                    answers: manualGradeAnswers.map(answer => ({
                        id: answer.id,
                        score: answer.score || 0,
                        feedback: answer.feedback || ''
                    }))
                }

                console.log('提交评分数据:', gradeData)

                // 调用新的批改API
                const { homeworkGradeStudent } = await import('@/api/teacher/homework')
                await homeworkGradeStudent(courseId, homeworkId, studentId, gradeData)

                this.$message.success('批改保存成功')
                this.gradeDialogVisible = false
                this.loadGradeData()

            } catch (error) {
                this.$message.error('保存批改失败: ' + error.message)
                console.error('Save grade error:', error)
            } finally {
                this.grading = false
            }
        },

        handleViewAnswers(student) {
            // 查看学生答题详情，跳转到答题查看页面
            const courseId = this.$route.params.id
            const homeworkId = this.$route.params.homeworkId
            this.$router.push(`/teacher/course/${courseId}/homework/${homeworkId}/students/${student.studentId}/answers`)
        },

        handleBatchGrade() {
            this.$message.info('批量评分功能开发中...')
        },

        handleBack() {
            this.$router.go(-1)
        },

        handleFilter() {
            // 筛选逻辑已在计算属性中实现
        },

        handlePageChange(page) {
            this.currentPage = page
            this.loadGradeData()
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

        loadPendingHomeworkList() {
            // 加载所有待批改作业列表
            this.loading = true
            this.submissions = []

            // 如果没有作业ID，显示作业列表而不是学生列表
            // 实际应该调用API获取待批改作业列表
            setTimeout(() => {
                this.submissions = [
                    {
                        id: 1,
                        homeworkTitle: '第一章练习题',
                        courseName: '高等数学',
                        pendingCount: 15,
                        totalCount: 30,
                        dueTime: '2024-01-15 23:59:59'
                    }
                ]
                this.loading = false
            }, 500)
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

        isCorrectOption(correctAnswer, optionPrefix) {
            if (!correctAnswer || !optionPrefix) return false
            return correctAnswer.includes(optionPrefix)
        },

        getAnswerClass(answer) {
            if ([2, 3].includes(answer.questionType)) {
                return answer.isCorrect ? 'correct-answer' : 'wrong-answer'
            }
            return ''
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-grade {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.grade-header {
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

.filter-card {
    margin-bottom: 20px;

    .filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .filter-left {
            display: flex;
            align-items: center;
        }

        .filter-right {
            .grade-stats {
                color: #606266;
                font-size: 14px;
            }
        }
    }
}

.loading-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.grade-content {
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

    .pagination-container {
        display: flex;
        justify-content: center;
        padding: 20px 0;
    }
}

.grade-dialog {
    .student-info {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;

        h3 {
            margin: 0 0 5px 0;
            color: #303133;
        }

        p {
            margin: 0;
            color: #606266;
            font-size: 14px;
        }
    }

    .grade-questions {
        max-height: 60vh;
        overflow-y: auto;

        .question-grade {
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
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
                line-height: 1.6;
            }

            .student-answer {
                margin-bottom: 15px;

                h4 {
                    margin: 0 0 10px 0;
                    color: #606266;
                    font-size: 14px;
                }

                .answer-content {
                    padding: 10px;
                    background: #fff8e1;
                    border-radius: 4px;
                    border-left: 3px solid #E6A23C;
                    line-height: 1.6;

                    .no-answer {
                        color: #C0C4CC;
                        font-style: italic;
                    }
                }
            }

            .question-content {
                .no-content {
                    color: #909399;
                    font-style: italic;
                }

                .question-title {
                    margin-bottom: 15px;
                    font-size: 16px;
                    line-height: 1.6;
                }

                .question-options {
                    margin-top: 15px;

                    .option-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 10px;
                        padding: 8px 12px;
                        background: #fafafa;
                        border-radius: 4px;

                        .option-prefix {
                            font-weight: bold;
                            margin-right: 8px;
                            min-width: 20px;
                        }

                        .option-content {
                            flex: 1;
                            margin-right: 10px;
                        }

                        .correct-tag {
                            margin-left: auto;
                        }
                    }
                }

                .correct-answer {
                    margin-top: 15px;
                    padding: 10px;
                    background: #f0f9ff;
                    border-left: 3px solid #409EFF;
                    border-radius: 4px;
                }
            }

            .student-answer {
                .answer-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    &.correct-answer {
                        background: #f0f9ff;
                        border-left-color: #67C23A;
                    }

                    &.wrong-answer {
                        background: #fef0f0;
                        border-left-color: #F56C6C;
                    }

                    .answer-result {
                        margin-left: auto;
                    }
                }
            }

            .grade-section {
                border-top: 1px solid #e4e7ed;
                padding-top: 15px;
            }

            .auto-grade-section {
                border-top: 1px solid #e4e7ed;
                padding-top: 15px;

                .auto-score {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .score-label {
                        color: #606266;
                        font-size: 14px;
                    }

                    .score-value {
                        font-weight: bold;
                        font-size: 16px;

                        &.correct-score {
                            color: #67C23A;
                        }

                        &.wrong-score {
                            color: #F56C6C;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .homework-grade {
        padding: 15px;
    }

    .grade-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .filter-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}
</style>