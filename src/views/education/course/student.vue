<template>
    <div class="app-container">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>课程信息</span>
            </div>
            <div v-loading="courseLoading">
                <div v-if="course">
                    <p><strong>课程名称：</strong>{{ course.name }}</p>
                    <p><strong>课程代码：</strong>{{ course.code }}</p>
                    <p><strong>学期：</strong>{{ course.semester }}</p>
                </div>
            </div>
        </el-card>

        <el-card class="box-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>已注册学生</span>
            </div>
            <el-table v-loading="studentListLoading" :data="studentList" border fit highlight-current-row
                style="width: 100%">
                <el-table-column prop="id" label="Id" />
                <el-table-column prop="userName" label="用户名" />
                <el-table-column prop="realName" label="真实姓名" />
                <el-table-column prop="status" label="选课状态">
                    <template slot-scope="{row}">
                        {{ statusFormatter(row.status) }}
                    </template>
                </el-table-column>
                <el-table-column prop="finalScore" label="最终成绩" />
                <el-table-column width="150px" label="操作" align="center">
                    <template slot-scope="{row}">
                        <el-button size="mini" type="danger" @click="removeStudent(row)"
                            class="link-left">退课</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-card class="box-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>添加学生</span>
            </div>
            <el-form :model="form" ref="form" label-width="100px" :rules="rules">
                <el-form-item label="选择学生：" prop="studentId" required>
                    <el-select v-model="form.studentId" filterable placeholder="请选择学生" style="width: 100%;">
                        <el-option v-for="item in availableStudents" :key="item.id"
                            :label="item.realName + ' (' + item.userName + ')'" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addStudent" :loading="addLoading">添加</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
import courseApi from '@/api/course'
import userApi from '@/api/user'

export default {
    data() {
        return {
            courseId: null,
            course: null,
            courseLoading: false,
            studentList: [],
            studentListLoading: false,
            availableStudents: [],
            form: {
                studentId: null
            },
            addLoading: false,
            rules: {
                studentId: [
                    { required: true, message: '请选择学生', trigger: 'change' }
                ]
            }
        }
    },
    created() {
        this.courseId = this.$route.query.courseId
        this.loadCourseInfo()
        this.loadStudentList()
        this.loadAvailableStudents()
    },
    methods: {
        loadCourseInfo() {
            this.courseLoading = true
            courseApi.getCourse(this.courseId).then(re => {
                this.course = re.response
                this.courseLoading = false
            })
        },
        loadStudentList() {
            this.studentListLoading = true
            courseApi.getCourseStudents(this.courseId).then(re => {
                this.studentList = re.response
                this.studentListLoading = false
            })
        },
        loadAvailableStudents() {
            const query = {
                role: 1, // 学生角色
                pageIndex: 1,
                pageSize: 100
            }
            userApi.getUserPageList(query).then(data => {
                const students = data.response.list
                // 过滤掉已注册的学生
                this.availableStudents = students.filter(student => {
                    return !this.studentList.some(enrolled => enrolled.id === student.id)
                })
            })
        },
        addStudent() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.addLoading = true
                    const params = {
                        courseId: this.courseId,
                        studentId: this.form.studentId
                    }
                    courseApi.enrollStudent(params).then(re => {
                        if (re.code === 1) {
                            this.$message.success(re.message)
                            this.loadStudentList()
                            this.loadAvailableStudents()
                            this.form.studentId = null
                        } else {
                            this.$message.error(re.message)
                        }
                        this.addLoading = false
                    }).catch(() => {
                        this.addLoading = false
                    })
                }
            })
        },
        removeStudent(row) {
            this.$confirm('确定将该学生从课程中退课?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const params = {
                    courseId: this.courseId,
                    studentId: row.id
                }
                courseApi.unenrollStudent(params).then(re => {
                    if (re.code === 1) {
                        this.$message.success(re.message)
                        this.loadStudentList()
                        this.loadAvailableStudents()
                    } else {
                        this.$message.error(re.message)
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消操作'
                })
            })
        },
        statusFormatter(status) {
            return status === 1 ? '已选' : '已退'
        }
    }
}
</script>

<style scoped>
.box-card {
    margin-bottom: 20px;
}
</style>