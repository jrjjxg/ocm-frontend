<template>
    <div class="question-list-container">
        <div class="page-header">
            <h2>题库管理</h2>
            <div class="header-actions">
                <el-button type="primary" @click="handleCreateQuestion">
                    <i class="el-icon-plus"></i>
                    添加题目
                </el-button>
            </div>
        </div>

        <!-- 筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <el-form :model="queryParam" ref="queryForm" :inline="true">
                <el-form-item label="题目内容：">
                    <el-input v-model="queryParam.content" clearable style="width: 200px;"></el-input>
                </el-form-item>
                <el-form-item label="所属课程：">
                    <el-select v-model="queryParam.courseId" clearable style="width: 180px;">
                        <el-option v-for="course in courseOptions" :key="course.id" :value="course.id"
                            :label="course.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchQuestions">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 题目列表 -->
        <el-card shadow="never">
            <div v-if="courseOptions.length === 0" class="empty-courses">
                <el-empty description="暂无可管理的课程">
                    <el-button type="primary" @click="$router.push('/teacher')">去课程管理</el-button>
                </el-empty>
            </div>
            <div v-else>
                <el-table :data="allQuestions" v-loading="loading" stripe style="width: 100%">
                    <el-table-column prop="id" label="题目ID" width="80" />
                    <el-table-column label="题目内容" min-width="300">
                        <template slot-scope="scope">
                            <div class="question-title" v-html="scope.row.shortTitle || scope.row.title || '无标题'"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="所属课程" width="150">
                        <template slot-scope="scope">
                            {{ getCourseNameById(scope.row.courseId) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="180" />
                    <el-table-column label="操作" width="150" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="editQuestion(scope.row)">
                                编辑
                            </el-button>
                            <el-button type="text" size="small" @click="deleteQuestion(scope.row)"
                                style="color: #f56c6c;">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container" v-if="total > 0">
                    <el-pagination @current-change="handlePageChange" @size-change="handleSizeChange"
                        :current-page="queryParam.pageIndex" :page-sizes="[10, 20, 50]" :page-size="queryParam.pageSize"
                        layout="total, sizes, prev, pager, next" :total="total">
                    </el-pagination>
                </div>
            </div>
        </el-card>

        <!-- 课程选择弹窗 -->
        <el-dialog title="选择课程创建题目" :visible.sync="courseSelectDialog.visible" width="50%">
            <p>请选择要创建题目的课程：</p>
            <el-radio-group v-model="courseSelectDialog.selectedCourseId">
                <div v-for="course in courseOptions" :key="course.id" style="margin-bottom: 10px;">
                    <el-radio :label="course.id">{{ course.name }}</el-radio>
                </div>
            </el-radio-group>
            <div slot="footer" class="dialog-footer">
                <el-button @click="courseSelectDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmCourse">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { courseListByTeacher } from '@/api/teacher/course'
import teacherExamApi from '@/api/teacherExam'

export default {
    name: 'TeacherQuestionList',
    data() {
        return {
            loading: false,
            courseOptions: [],
            allQuestions: [],
            total: 0,
            queryParam: {
                content: '',
                courseId: null,
                pageIndex: 1,
                pageSize: 20
            },
            courseSelectDialog: {
                visible: false,
                selectedCourseId: null
            }
        }
    },
    created() {
        this.loadCourses()
    },
    methods: {
        async loadCourses() {
            try {
                const response = await courseListByTeacher()
                if (response && response.code === 1 && response.response) {
                    this.courseOptions = response.response
                    // 加载完课程后，加载题目
                    this.fetchAllQuestions()
                }
            } catch (error) {
                console.error('加载课程列表失败:', error)
                this.$message.error('加载课程列表失败')
            }
        },

        async fetchAllQuestions() {
            if (this.courseOptions.length === 0) return

            this.loading = true
            this.allQuestions = []
            let totalCount = 0

            try {
                // 如果指定了课程，只查询该课程的题目
                if (this.queryParam.courseId) {
                    const response = await teacherExamApi.getQuestionList(this.queryParam.courseId, {
                        content: this.queryParam.content,
                        pageIndex: this.queryParam.pageIndex,
                        pageSize: this.queryParam.pageSize
                    })

                    if (response.code === 1 && response.response) {
                        console.log('API响应数据:', response.response)
                        this.allQuestions = (response.response.list || []).map(q => ({
                            ...q,
                            courseId: this.queryParam.courseId
                        }))
                        totalCount = response.response.total || 0
                        console.log('处理后的题目列表:', this.allQuestions)
                        console.log('总数:', totalCount)
                    }
                } else {
                    // 查询所有课程的题目 - 简化版本，查询第一个课程的题目
                    if (this.courseOptions.length > 0) {
                        const firstCourse = this.courseOptions[0]
                        const response = await teacherExamApi.getQuestionList(firstCourse.id, {
                            content: this.queryParam.content,
                            pageIndex: this.queryParam.pageIndex,
                            pageSize: this.queryParam.pageSize
                        })

                        if (response.code === 1 && response.response) {
                            console.log('查询所有课程-API响应数据:', response.response)
                            this.allQuestions = (response.response.list || []).map(q => ({
                                ...q,
                                courseId: firstCourse.id
                            }))
                            totalCount = response.response.total || 0
                            console.log('查询所有课程-处理后的题目列表:', this.allQuestions)
                        }
                    }
                }

                this.total = totalCount
            } catch (error) {
                console.error('获取题目列表失败:', error)
                this.$message.error('获取题目列表失败')
            } finally {
                this.loading = false
            }
        },

        searchQuestions() {
            this.queryParam.pageIndex = 1
            this.fetchAllQuestions()
        },

        resetQuery() {
            this.queryParam = {
                content: '',
                courseId: null,
                pageIndex: 1,
                pageSize: 20
            }
            this.fetchAllQuestions()
        },

        handlePageChange(page) {
            this.queryParam.pageIndex = page
            this.fetchAllQuestions()
        },

        handleSizeChange(size) {
            this.queryParam.pageSize = size
            this.queryParam.pageIndex = 1
            this.fetchAllQuestions()
        },

        getCourseNameById(courseId) {
            const course = this.courseOptions.find(c => c.id === courseId)
            return course ? course.name : '-'
        },

        editQuestion(row) {
            this.$router.push(`/teacher/course/${row.courseId}/questionBank`)
        },

        deleteQuestion(row) {
            this.$confirm('确定删除该题目吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                teacherExamApi.deleteQuestion(row.courseId, row.id).then(res => {
                    if (res.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchAllQuestions()
                    } else {
                        this.$message.error(res.message || '删除失败')
                    }
                }).catch(error => {
                    console.error('删除题目出错:', error)
                    this.$message.error('网络错误，请稍后重试')
                })
            }).catch(() => {
                // 取消删除
            })
        },

        handleCreateQuestion() {
            if (this.courseOptions.length === 0) {
                this.$message.warning('请先创建课程')
                return
            }

            if (this.courseOptions.length === 1) {
                // 只有一个课程，直接跳转到该课程的题库管理
                this.$router.push(`/teacher/course/${this.courseOptions[0].id}/questionBank`)
            } else {
                // 多个课程，显示选择弹窗
                this.courseSelectDialog.visible = true
            }
        },

        handleConfirmCourse() {
            if (!this.courseSelectDialog.selectedCourseId) {
                this.$message.warning('请选择课程')
                return
            }

            this.courseSelectDialog.visible = false
            this.$router.push(`/teacher/course/${this.courseSelectDialog.selectedCourseId}/questionBank`)
        }
    }
}
</script>

<style lang="scss" scoped>
.question-list-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        margin: 0;
        color: #303133;
        font-size: 24px;
        font-weight: 600;
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }
}

.filter-card {
    margin-bottom: 20px;
}

.question-title {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.empty-courses {
    text-align: center;
    padding: 40px;
}
</style>