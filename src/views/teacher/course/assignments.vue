<template>
    <div class="assignments-container">
        <div class="page-header">
            <h2>作业管理</h2>
            <el-button type="primary" @click="handleAddAssignment">发布新作业</el-button>
        </div>

        <el-table v-loading="loading" :data="assignments" border style="width: 100%">
            <el-table-column prop="title" label="作业标题" min-width="180"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160">
                <template slot-scope="scope">
                    {{ formatDateTime(scope.row.startTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="endTime" label="截止时间" width="160">
                <template slot-scope="scope">
                    {{ formatDateTime(scope.row.endTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="submitCount" label="已提交/总人数" width="120">
                <template slot-scope="scope">
                    {{ scope.row.submitCount || 0 }}/{{ scope.row.totalCount || 0 }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="240" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleViewSubmissions(scope.row)">查看提交</el-button>
                    <el-button size="mini" type="primary" @click="handleEditAssignment(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDeleteAssignment(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加/编辑作业对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
            <el-form :model="assignmentForm" :rules="rules" ref="assignmentForm" label-width="100px">
                <el-form-item label="作业标题" prop="title">
                    <el-input v-model="assignmentForm.title"></el-input>
                </el-form-item>
                <el-form-item label="作业内容" prop="description">
                    <el-input type="textarea" :rows="4" v-model="assignmentForm.description"></el-input>
                </el-form-item>
                <el-form-item label="时间范围" prop="timeRange">
                    <el-date-picker v-model="assignmentForm.timeRange" type="datetimerange" range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                </el-form-item>
                <el-form-item label="满分值" prop="totalScore">
                    <el-input-number v-model="assignmentForm.totalScore" :min="0" :max="100"
                        :step="5"></el-input-number>
                </el-form-item>
                <el-form-item label="附件">
                    <el-upload class="upload-demo" :action="uploadUrl" :on-preview="handlePreview"
                        :on-remove="handleRemove" :before-remove="beforeRemove" :on-success="handleUploadSuccess"
                        :on-error="handleUploadError" :before-upload="beforeUpload" multiple :limit="1"
                        :file-list="fileList">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png/pdf/doc/docx文件，且不超过10MB</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAssignmentForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getAssignmentsByCourse, createAssignment, updateAssignment, deleteAssignment } from '@/api/assignment'
import { formatDate } from '@/utils'

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
            assignments: [],
            dialogVisible: false,
            dialogTitle: '发布新作业',
            isEdit: false,
            currentAssignmentId: null,
            assignmentForm: {
                title: '',
                description: '',
                timeRange: [],
                totalScore: 100
            },
            rules: {
                title: [
                    { required: true, message: '请输入作业标题', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请输入作业内容', trigger: 'blur' }
                ],
                timeRange: [
                    { type: 'array', required: true, message: '请选择时间范围', trigger: 'change' }
                ],
                totalScore: [
                    { required: true, message: '请设置满分值', trigger: 'blur' }
                ]
            },
            fileList: [],
            uploadUrl: '/api/teacher/assignment/upload-attachment',
            attachmentUrl: ''
        }
    },
    created() {
        this.fetchAssignments()
    },
    methods: {
        formatDateTime(dateTime) {
            if (!dateTime) return '';
            const date = new Date(dateTime);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        },
        async fetchAssignments() {
            this.loading = true
            try {
                const response = await getAssignmentsByCourse(this.courseId)
                if (response.code === 1) {
                    this.assignments = response.response || []
                } else {
                    this.$message.error(response.message || '获取作业列表失败')
                }
            } catch (error) {
                console.error('获取作业列表失败:', error)
                this.$message.error('获取作业列表失败，请检查网络连接')
            } finally {
                this.loading = false
            }
        },
        getStatusType(status) {
            switch (status) {
                case 1: return 'info'    // 未开始
                case 2: return 'success' // 进行中
                case 3: return 'danger'  // 已结束
                default: return 'info'
            }
        },
        getStatusText(status) {
            switch (status) {
                case 1: return '未开始'
                case 2: return '进行中'
                case 3: return '已结束'
                default: return '未知'
            }
        },
        handleAddAssignment() {
            this.dialogTitle = '发布新作业'
            this.isEdit = false
            this.currentAssignmentId = null
            this.assignmentForm = {
                title: '',
                description: '',
                timeRange: [],
                totalScore: 100
            }
            this.fileList = []
            this.attachmentUrl = ''
            this.dialogVisible = true
        },
        handleEditAssignment(row) {
            this.dialogTitle = '编辑作业'
            this.isEdit = true
            this.currentAssignmentId = row.id
            this.assignmentForm = {
                title: row.title,
                description: row.description || '',
                timeRange: [row.startTime, row.endTime],
                totalScore: row.totalScore || 100
            }
            this.attachmentUrl = row.attachmentUrl || ''

            // 如果有附件，显示在文件列表中
            this.fileList = []
            if (row.attachmentUrl) {
                const fileName = row.attachmentUrl.split('/').pop()
                this.fileList = [{
                    name: fileName,
                    url: row.attachmentUrl
                }]
            }

            this.dialogVisible = true
        },
        async handleDeleteAssignment(row) {
            this.$confirm('确认删除该作业吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await deleteAssignment(row.id)
                    if (response.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchAssignments()
                    } else {
                        this.$message.error(response.message || '删除失败')
                    }
                } catch (error) {
                    console.error('删除作业失败:', error)
                    this.$message.error('删除失败，请检查网络连接')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handleViewSubmissions(row) {
            // 跳转到作业提交页面
            this.$router.push(`/teacher/course/${this.courseId}/assignment/${row.id}/submissions`)
        },
        async submitAssignmentForm() {
            this.$refs.assignmentForm.validate(async (valid) => {
                if (valid) {
                    const formData = {
                        title: this.assignmentForm.title,
                        description: this.assignmentForm.description,
                        startTime: this.assignmentForm.timeRange[0],
                        endTime: this.assignmentForm.timeRange[1],
                        courseId: parseInt(this.courseId),
                        totalScore: this.assignmentForm.totalScore,
                        attachmentUrl: this.attachmentUrl
                    }

                    try {
                        let response
                        if (this.isEdit) {
                            formData.id = this.currentAssignmentId
                            response = await updateAssignment(this.currentAssignmentId, formData)
                        } else {
                            response = await createAssignment(formData)
                        }

                        if (response.code === 1) {
                            this.$message.success(this.isEdit ? '作业更新成功' : '作业发布成功')
                            this.dialogVisible = false
                            this.fetchAssignments()
                        } else {
                            this.$message.error(response.message || (this.isEdit ? '更新失败' : '发布失败'))
                        }
                    } catch (error) {
                        console.error(this.isEdit ? '更新作业失败:' : '发布作业失败:', error)
                        this.$message.error(this.isEdit ? '更新失败，请检查网络连接' : '发布失败，请检查网络连接')
                    }
                } else {
                    return false
                }
            })
        },
        handlePreview(file) {
            window.open(file.url, '_blank')
        },
        handleRemove(file, fileList) {
            this.fileList = fileList
            if (fileList.length === 0) {
                this.attachmentUrl = ''
            }
        },
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${file.name}？`)
        },
        handleUploadSuccess(response, file, fileList) {
            if (response.code === 1) {
                this.attachmentUrl = response.response
                this.$message.success('附件上传成功')
            } else {
                this.$message.error(response.message || '附件上传失败')
                // 移除上传失败的文件
                this.fileList = []
            }
        },
        handleUploadError(err, file, fileList) {
            console.error('上传附件失败:', err)
            this.$message.error('附件上传失败，请检查网络连接')
            // 移除上传失败的文件
            this.fileList = []
        },
        beforeUpload(file) {
            const isValidType = /\.(jpg|jpeg|png|pdf|doc|docx)$/i.test(file.name)
            const isLt10M = file.size / 1024 / 1024 < 10

            if (!isValidType) {
                this.$message.error('只能上传jpg/png/pdf/doc/docx格式的文件!')
            }
            if (!isLt10M) {
                this.$message.error('文件大小不能超过10MB!')
            }
            return isValidType && isLt10M
        }
    }
}
</script>

<style lang="scss" scoped>
.assignments-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }
}
</style>