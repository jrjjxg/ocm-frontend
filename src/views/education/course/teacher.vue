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
                <span>已分配教师</span>
            </div>
            <el-table v-loading="teacherListLoading" :data="teacherList" border fit highlight-current-row
                style="width: 100%">
                <el-table-column prop="id" label="Id" />
                <el-table-column prop="userName" label="用户名" />
                <el-table-column prop="realName" label="真实姓名" />
                <el-table-column prop="authType" label="权限类型">
                    <template slot-scope="{row}">
                        {{ authTypeFormatter(row.authType) }}
                    </template>
                </el-table-column>
                <el-table-column width="150px" label="操作" align="center">
                    <template slot-scope="{row}">
                        <el-button size="mini" type="danger" @click="removeTeacher(row)"
                            class="link-left">移除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-card class="box-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>添加教师</span>
            </div>
            <el-form :model="form" ref="form" label-width="100px" :rules="rules">
                <el-form-item label="选择教师：" prop="teacherId" required>
                    <el-select v-model="form.teacherId" filterable placeholder="请选择教师" style="width: 100%;">
                        <el-option v-for="item in availableTeachers" :key="item.id"
                            :label="item.realName + ' (' + item.userName + ')'" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="权限类型：" prop="authType" required>
                    <el-select v-model="form.authType" placeholder="请选择权限类型">
                        <el-option :value="1" label="主讲教师"></el-option>
                        <el-option :value="2" label="辅导教师"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addTeacher" :loading="addLoading">添加</el-button>
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
            teacherList: [],
            teacherListLoading: false,
            availableTeachers: [],
            form: {
                teacherId: null,
                authType: 1
            },
            addLoading: false,
            rules: {
                teacherId: [
                    { required: true, message: '请选择教师', trigger: 'change' }
                ],
                authType: [
                    { required: true, message: '请选择权限类型', trigger: 'change' }
                ]
            }
        }
    },
    created() {
        this.courseId = this.$route.query.courseId
        this.loadCourseInfo()
        this.loadTeacherList()
        this.loadAvailableTeachers()
    },
    methods: {
        loadCourseInfo() {
            this.courseLoading = true
            courseApi.getCourse(this.courseId).then(re => {
                this.course = re.response
                this.courseLoading = false
            })
        },
        loadTeacherList() {
            this.teacherListLoading = true
            courseApi.getCourseTeachers(this.courseId).then(re => {
                this.teacherList = re.response
                this.teacherListLoading = false
            })
        },
        loadAvailableTeachers() {
            const query = {
                role: 2, // 教师角色
                pageIndex: 1,
                pageSize: 100
            }
            userApi.getUserPageList(query).then(data => {
                const teachers = data.response.list
                // 过滤掉已分配的教师
                this.availableTeachers = teachers.filter(teacher => {
                    return !this.teacherList.some(assigned => assigned.id === teacher.id)
                })
            })
        },
        addTeacher() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.addLoading = true
                    const params = {
                        courseId: this.courseId,
                        teacherId: this.form.teacherId,
                        authType: this.form.authType
                    }
                    courseApi.assignTeacher(params).then(re => {
                        if (re.code === 1) {
                            this.$message.success(re.message)
                            this.loadTeacherList()
                            this.loadAvailableTeachers()
                            this.form.teacherId = null
                            this.form.authType = 1
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
        removeTeacher(row) {
            this.$confirm('确定将该教师从课程中移除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const params = {
                    courseId: this.courseId,
                    teacherId: row.id
                }
                courseApi.revokeTeacher(params).then(re => {
                    if (re.code === 1) {
                        this.$message.success(re.message)
                        this.loadTeacherList()
                        this.loadAvailableTeachers()
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
        authTypeFormatter(type) {
            return type === 1 ? '主讲教师' : '辅导教师'
        }
    }
}
</script>

<style scoped>
.box-card {
    margin-bottom: 20px;
}
</style>