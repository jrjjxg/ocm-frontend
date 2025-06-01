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
            <el-table-column prop="id" label="学号" width="120"></el-table-column>
            <el-table-column prop="realName" label="姓名" width="120"></el-table-column>
            <el-table-column prop="className" label="班级" width="150"></el-table-column>
            <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
            <el-table-column prop="enrollTime" label="选课时间" width="160"></el-table-column>
            <el-table-column label="成绩" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.score || '-' }}</span>
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
                <el-form-item label="选择方式">
                    <el-radio-group v-model="addType">
                        <el-radio :label="1">按学号添加</el-radio>
                        <el-radio :label="2">按班级添加</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="addType === 1" label="学号" prop="studentIds">
                    <el-input type="textarea" :rows="4" placeholder="请输入学号，多个学号用逗号或换行分隔" v-model="addForm.studentIds">
                    </el-input>
                </el-form-item>
                <el-form-item v-if="addType === 2" label="班级" prop="classId">
                    <el-select v-model="addForm.classId" placeholder="请选择班级">
                        <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
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
import teacherStudentApi from '@/api/teacherStudent'

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
            addType: 1, // 1: 按学号添加, 2: 按班级添加
            addForm: {
                studentIds: '',
                classId: ''
            },
            addRules: {
                studentIds: [
                    { required: true, message: '请输入学号', trigger: 'blur' }
                ],
                classId: [
                    { required: true, message: '请选择班级', trigger: 'change' }
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
            },
            classOptions: []
        }
    },
    created() {
        this.fetchStudents()
        this.fetchClassOptions()
    },
    methods: {
        fetchStudents() {
            this.loading = true
            teacherStudentApi.getStudentList(this.courseId, this.searchForm).then(res => {
                if (res.code === 1) {
                    this.students = res.response
                } else {
                    this.$message.error(res.message || '获取学生列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取学生列表失败')
                this.loading = false
            })
        },
        fetchClassOptions() {
            // 从后端API获取班级列表
            teacherCourseApi.getClassList()
                .then(response => {
                    if (response.code === 1) {
                        this.classOptions = response.response || []
                    } else {
                        console.warn('获取班级列表API返回错误:', response.message)
                        this.loadDefaultClassOptions()
                    }
                })
                .catch(error => {
                    console.error('获取班级列表失败', error)
                    this.loadDefaultClassOptions()
                })
        },
        loadDefaultClassOptions() {
            // 当班级列表API不可用时使用默认数据
            this.$message.warning('获取班级列表失败，使用默认班级数据')
            this.classOptions = [
                { id: 1, name: '计算机科学2101' },
                { id: 2, name: '计算机科学2102' },
                { id: 3, name: '软件工程2101' },
                { id: 4, name: '软件工程2102' },
                { id: 5, name: '信息安全2101' }
            ]
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
            this.addType = 1
            this.addForm = {
                studentIds: '',
                classId: ''
            }
            this.addDialogVisible = true
        },
        submitAddForm() {
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    if (this.addType === 1) {
                        // 按学号添加
                        const studentIds = this.addForm.studentIds
                            .split(/[,，\n]/)
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
                        // 按班级添加
                        const classId = this.addForm.classId
                        const className = this.classOptions.find(c => c.id === classId)?.name || '未知班级'

                        // 调用API添加班级学生
                        teacherCourseApi.addClassToCourse(this.courseId, classId)
                            .then(response => {
                                if (response.code === 1) {
                                    this.$message.success(`成功添加班级 ${className} 的学生`)
                                    this.addDialogVisible = false
                                    this.fetchStudents()
                                } else {
                                    this.$message.error(response.message || '添加班级学生失败')
                                }
                            })
                            .catch(error => {
                                console.error('添加班级学生失败', error)
                                this.$message.error('添加班级学生失败，请检查网络连接')
                            })
                    }
                } else {
                    return false
                }
            })
        },
        handleEditScore(row) {
            this.scoreForm = {
                studentId: row.id,
                studentName: row.realName,
                score: row.score || 0
            }
            this.scoreDialogVisible = true
        },
        submitScoreForm() {
            this.$refs.scoreForm.validate((valid) => {
                if (valid) {
                    // 这里应该调用API更新成绩
                    teacherCourseApi.updateStudentScore({
                        courseId: this.courseId,
                        studentId: this.scoreForm.studentId,
                        score: this.scoreForm.score
                    }).then(() => {
                        this.$message.success('成绩录入成功')
                        this.scoreDialogVisible = false
                        // 更新本地数据
                        const student = this.students.find(s => s.id === this.scoreForm.studentId)
                        if (student) {
                            student.score = this.scoreForm.score
                        }
                    }).catch(error => {
                        this.$message.error('成绩录入失败')
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