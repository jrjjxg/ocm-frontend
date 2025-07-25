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
                        {{ $route.params.id ? '学生提交列表' : '待批改作业列表' }}
                    </span>
                </div>

                <el-table :data="filteredSubmissions" style="width: 100%" stripe>
                    <el-table-column v-if="$route.params.id" type="selection" width="55" />
                    <el-table-column v-if="$route.params.id" prop="studentName" label="学生姓名" width="120" />
                    <el-table-column v-if="$route.params.id" prop="studentNumber" label="学号" width="120" />
                    <el-table-column v-if="!$route.params.id" prop="homeworkTitle" label="作业标题" min-width="200" />
                    <el-table-column v-if="!$route.params.id" prop="courseName" label="所属课程" width="150" />
                    <el-table-column v-if="$route.params.id" label="提交状态" width="100" align="center">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.submitted ? 'success' : 'danger'" size="small">
                                {{ scope.row.submitted ? '已提交' : '未提交' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!$route.params.id" label="待批改数量" width="120" align="center">
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
                            <el-button v-if="$route.params.id && scope.row.submitted" type="text" size="small"
                                @click="handleGradeStudent(scope.row)">
                                {{ scope.row.gradeStatus === 'pending' ? '开始批改' : '重新批改' }}
                            </el-button>
                            <el-button v-if="$route.params.id && scope.row.submitted" type="text" size="small"
                                @click="handleViewAnswers(scope.row)">
                                查看答题
                            </el-button>
                            <el-button v-if="!$route.params.id" type="primary" size="small"
                                @click="$router.push(`/teacher/homework/grade/${scope.row.id}`)">
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
                            <span class="question-score">{{ answer.questionScore }}分</span>
                        </div>
                        <div class="question-content" v-html="answer.questionTitle"></div>

                        <div class="student-answer">
                            <h4>学生答案:</h4>
                            <div class="answer-content">{{ answer.studentAnswer }}</div>
                        </div>

                        <div class="grade-section">
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
import { homeworkStudentAnswers, homeworkManualGrade } from '@/api/teacher/homework'

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
            currentAnswers: []
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
        },
        gradedCount() {
            return this.submissions.filter(item => item.gradeStatus === 'graded').length
        }
    },
    created() {
        // 如果有作业ID参数，加载该作业的批改数据
        if (this.$route.params.id) {
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
                const homeworkId = this.$route.params.id
                const courseId = this.$route.query.courseId || 1 // 从路由参数获取课程ID

                // 使用新的API获取学生提交列表
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

            } catch (error) {
                this.$message.error('加载批改数据失败')
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

                // 获取学生答题详情
                const response = await homeworkStudentAnswers(this.$route.params.id, student.studentId)
                this.currentAnswers = response.data || this.mockAnswers()

            } catch (error) {
                this.$message.error('加载学生答题失败')
                this.currentAnswers = this.mockAnswers()
            }
        },

        mockAnswers() {
            return [
                {
                    id: 1,
                    questionId: 1,
                    questionTitle: '请简述Vue.js的响应式原理',
                    questionScore: 20,
                    studentAnswer: 'Vue.js通过Object.defineProperty来劫持数据的getter和setter，从而实现数据的响应式...',
                    score: 18,
                    feedback: '回答较为完整，但缺少对依赖收集过程的描述'
                },
                {
                    id: 2,
                    questionId: 2,
                    questionTitle: '什么是虚拟DOM？它有什么优势？',
                    questionScore: 15,
                    studentAnswer: '虚拟DOM是真实DOM的JS对象表示，可以提高性能...',
                    score: null,
                    feedback: ''
                }
            ]
        },

        async handleSaveGrade() {
            try {
                this.grading = true

                // 保存每个题目的评分
                for (const answer of this.currentAnswers) {
                    if (answer.score !== null) {
                        await homeworkManualGrade(answer.id, {
                            score: answer.score,
                            feedback: answer.feedback
                        })
                    }
                }

                this.$message.success('批改保存成功')
                this.gradeDialogVisible = false
                this.loadGradeData()

            } catch (error) {
                this.$message.error('保存批改失败')
            } finally {
                this.grading = false
            }
        },

        handleViewAnswers(student) {
            // 查看学生答题详情，可以跳转到详情页面
            this.$router.push(`/teacher/homework/grade/${this.$route.params.id}/student/${student.studentId}/view`)
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
                }
            }

            .grade-section {
                border-top: 1px solid #e4e7ed;
                padding-top: 15px;
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