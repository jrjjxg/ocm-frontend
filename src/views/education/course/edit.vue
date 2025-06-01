<template>
    <div class="app-container">

        <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
            <el-form-item label="课程名称：" prop="name" required>
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="课程代码：" prop="code" required>
                <el-input v-model="form.code"></el-input>
            </el-form-item>
            <el-form-item label="学期：" prop="semester" required>
                <el-input v-model="form.semester"></el-input>
            </el-form-item>
            <el-form-item label="学分：" prop="credit" required>
                <el-input v-model="form.credit" type="number"></el-input>
            </el-form-item>
            <el-form-item label="课程描述：">
                <el-input v-model="form.description" type="textarea" :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="状态：" required>
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">提交</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import courseApi from '@/api/course'

export default {
    data() {
        return {
            form: {
                id: null,
                name: '',
                code: '',
                description: '',
                semester: '',
                credit: 0,
                status: 1
            },
            formLoading: false,
            rules: {
                name: [
                    { required: true, message: '请输入课程名称', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '请输入课程代码', trigger: 'blur' }
                ],
                semester: [
                    { required: true, message: '请输入学期', trigger: 'blur' }
                ],
                credit: [
                    { required: true, message: '请输入学分', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        let id = this.$route.query.id
        let _this = this
        if (id && parseInt(id) !== 0) {
            _this.formLoading = true
            courseApi.getCourse(id).then(re => {
                _this.form = re.response
                _this.formLoading = false
            })
        }
    },
    methods: {
        submitForm() {
            let _this = this
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.formLoading = true
                    courseApi.createCourse(this.form).then(data => {
                        if (data.code === 1) {
                            _this.$message.success(data.message)
                            _this.delCurrentView(_this).then(() => {
                                _this.$router.push('/education/course/list')
                            })
                        } else {
                            _this.$message.error(data.message)
                            _this.formLoading = false
                        }
                    }).catch(e => {
                        _this.formLoading = false
                    })
                } else {
                    return false
                }
            })
        },
        resetForm() {
            let lastId = this.form.id
            this.$refs['form'].resetFields()
            this.form = {
                id: null,
                name: '',
                code: '',
                description: '',
                semester: '',
                credit: 0,
                status: 1
            }
            this.form.id = lastId
        },
        ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
    }
}
</script>