<template>
    <div class="students-container">
        <div class="page-header">
            <h2>学生管理</h2>
            <el-button type="primary" @click="handleAddStudent">添加学生</el-button>
        </div>

        <!-- 搜索栏 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
                <el-input v-model="searchForm.keyword" placeholder="学号/姓名" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 学生列表 -->
        <el-table v-loading="loading" :data="students" border style="width: 100%">
            <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
            <el-table-column prop="realName" label="姓名" width="120"></el-table-column>
            <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
            <el-table-column prop="createTime" label="选课时间" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="成绩" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.finalScore || '-' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEditScore(scope.row)">录入成绩</el-button>
                    <el-button size="mini" type="danger" @click="handleRemoveStudent(scope.row)">移除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="pagination.total">
            </el-pagination>
        </div>

        <!-- 添加学生对话框 -->
        <el-dialog title="添加学生" :visible.sync="addDialogVisible" width="50%">
            <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="80px">
                <el-form-item label="学号" prop="studentIds">
                    <el-input type="textarea" :rows="4" placeholder="请输入学号，多个学号用逗号或换行分隔" v-model="addForm.studentIds">
                    </el-input>
                    <div style="margin-top: 8px; color: #909399; font-size: 12px;">
                        支持多种格式：逗号分隔、换行分隔或空格分隔
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAddForm">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 录入成绩对话框 -->
        <el-dialog title="录入成绩" :visible.sync="scoreDialogVisible" width="30%">
            <el-form :model="scoreForm" :rules="scoreRules" ref="scoreForm" label-width="80px">
                <el-form-item label="学生" prop="studentName">
                    <span>{{ scoreForm.studentName }}</span>
                </el-form-item>
                <el-form-item label="成绩" prop="score">
                    <el-input-number v-model="scoreForm.score" :min="0" :max="100" :precision="1"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="scoreDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitScoreForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import teacherCourseApi from '@/api/teacherCourse'
// teacherStudentApi 功能已合并到 teacherCourseApi

export default {
    props: {
        courseId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            loading: true,
            students: [],
            searchForm: {
                keyword: ''
            },
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },
            addDialogVisible: false,
            scoreDialogVisible: false,
            addForm: {
                studentIds: ''
            },
            addRules: {
                studentIds: [
                    { required: true, message: '请输入学号', trigger: 'blur' }
                ]
            },
            scoreForm: {
                studentId: '',
                studentName: '',
                score: 0
            },
            scoreRules: {
                score: [
                    { required: true, message: '请输入成绩', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.fetchStudents()
    },
    methods: {
        fetchStudents() {
            this.loading = true
            const params = {
                ...this.searchForm,
                pageIndex: this.pagination.currentPage,
                pageSize: this.pagination.pageSize
            }
            teacherCourseApi.getCourseStudents(this.courseId, params).then(res => {
                if (res.code === 1) {
                    // 处理分页数据结构
                    if (res.response && res.response.list) {
                        this.students = res.response.list
                        this.pagination.total = res.response.total || 0
                        this.pagination.currentPage = res.response.pageNum || 1
                    } else {
                        // 兼容非分页格式
                        this.students = res.response || []
                        this.pagination.total = this.students.length
                    }
                } else {
                    this.$message.error(res.message || '获取学生列表失败')
                    this.students = []
                    this.pagination.total = 0
                }
                this.loading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取学生列表失败')
                this.students = []
                this.pagination.total = 0
                this.loading = false
            })
        },

        handleSearch() {
            this.pagination.currentPage = 1
            this.fetchStudents()
        },
        resetSearch() {
            this.searchForm.keyword = ''
            this.handleSearch()
        },
        handleSizeChange(val) {
            this.pagination.pageSize = val
            this.fetchStudents()
        },
        handleCurrentChange(val) {
            this.pagination.currentPage = val
            this.fetchStudents()
        },
        handleAddStudent() {
            this.addForm = {
                studentIds: ''
            }
            this.addDialogVisible = true
        },
        submitAddForm() {
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    // 按学号添加学生
                    const studentIds = this.addForm.studentIds
                        .split(/[,，\n\s]+/)
                        .map(id => id.trim())
                        .filter(id => id)

                    if (studentIds.length === 0) {
                        this.$message.warning('请输入有效的学号')
                        return false
                    }

                    // 调用API添加学生
                    teacherCourseApi.addStudentToCourse(this.courseId, studentIds)
                        .then(response => {
                            if (response.code === 1) {
                                this.$message.success(`成功添加 ${studentIds.length} 名学生`)
                                this.addDialogVisible = false
                                this.fetchStudents()
                            } else {
                                this.$message.error(response.message || '添加学生失败')
                            }
                        })
                        .catch(error => {
                            console.error('添加学生失败', error)
                            this.$message.error('添加学生失败，请检查网络连接')
                        })
                } else {
                    return false
                }
            })
        },
        handleEditScore(row) {
            this.scoreForm = {
                studentId: row.userId,
                studentName: row.realName,
                score: row.finalScore || 0
            }
            this.scoreDialogVisible = true
        },
        submitScoreForm() {
            this.$refs.scoreForm.validate((valid) => {
                if (valid) {
                    // 调用API更新成绩
                    teacherCourseApi.updateStudentScore({
                        courseId: parseInt(this.courseId),
                        studentId: this.scoreForm.studentId,
                        finalScore: this.scoreForm.score
                    }).then(res => {
                        if (res.code === 1) {
                            this.$message.success('成绩录入成功')
                            this.scoreDialogVisible = false
                            // 更新本地数据
                            const student = this.students.find(s => s.userId === this.scoreForm.studentId)
                            if (student) {
                                student.finalScore = this.scoreForm.score
                            }
                            // 重新加载学生列表
                            this.fetchStudents()
                        } else {
                            this.$message.error(res.message || '成绩录入失败')
                        }
                    }).catch(error => {
                        console.error('成绩录入失败:', error)
                        this.$message.error('成绩录入失败，请检查网络连接')
                    })
                } else {
                    return false
                }
            })
        },
        handleRemoveStudent(row) {
            this.$confirm(`确认将学生 ${row.realName} 从课程中移除吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 调用API移除学生
                teacherCourseApi.removeStudentFromCourse(this.courseId, row.id)
                    .then(response => {
                        if (response.code === 1) {
                            this.$message.success('学生移除成功')
                            this.fetchStudents()
                        } else {
                            this.$message.error(response.message || '移除学生失败')
                        }
                    })
                    .catch(error => {
                        console.error('移除学生失败', error)
                        this.$message.error('移除学生失败，请检查网络连接')
                    })
            }).catch(() => {
                this.$message.info('已取消移除')
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.students-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .search-form {
        margin-bottom: 20px;
    }

    .pagination-container {
        margin-top: 20px;
        text-align: right;
    }
}
</style>