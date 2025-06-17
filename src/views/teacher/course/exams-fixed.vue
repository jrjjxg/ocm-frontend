<template>
    <div class="exams-container">
        <div class="page-header">
            <h2>测验管理</h2>
            <div class="header-actions">
                <el-button type="primary" @click="handleAddExam">创建新测验</el-button>
                <el-button type="success" @click="goToPapers">试卷管理</el-button>
                <el-button type="info" @click="goToQuestionBank">题库管理</el-button>
            </div>
        </div>

        <el-table v-loading="loading" :data="exams" border style="width: 100%">
            <el-table-column prop="title" label="测验标题" min-width="180"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160"></el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="160"></el-table-column>
            <el-table-column prop="duration" label="时长(分钟)" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="submitCount" label="已参与/总人数" width="120">
                <template slot-scope="scope">
                    {{ scope.row.submitCount }}/{{ scope.row.totalCount }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="240" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleViewResults(scope.row)">查看成绩</el-button>
                    <el-button size="mini" type="primary" @click="handleEditExam(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDeleteExam(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加/编辑测验对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%" class="exam-dialog">
            <el-form :model="examForm" :rules="rules" ref="examForm" label-width="120px">
                <el-form-item label="测验标题" prop="title">
                    <el-input v-model="examForm.title" placeholder="请输入测验标题"></el-input>
                </el-form-item>
                <el-form-item label="测验说明" prop="description">
                    <el-input type="textarea" :rows="3" v-model="examForm.description" placeholder="请输入测验说明"></el-input>
                </el-form-item>

                <!-- 改进的时间设置 -->
                <div class="time-setting-section">
                    <el-form-item label="考试时间模式：" prop="timeMode">
                        <el-radio-group v-model="examForm.timeMode" @change="timeModeChange">
                            <div class="time-mode-options">
                                <el-radio :label="1" class="mode-radio">
                                    <div class="time-mode-card" :class="{ active: examForm.timeMode === 1 }">
                                        <div class="mode-icon">
                                            <i class="el-icon-timer"></i>
                                        </div>
                                        <div class="mode-content">
                                            <div class="mode-title">固定时间考试</div>
                                            <div class="mode-desc">所有学生在指定时间段内参加考试</div>
                                        </div>
                                    </div>
                                </el-radio>
                                <el-radio :label="2" class="mode-radio">
                                    <div class="time-mode-card" :class="{ active: examForm.timeMode === 2 }">
                                        <div class="mode-icon">
                                            <i class="el-icon-date"></i>
                                        </div>
                                        <div class="mode-content">
                                            <div class="mode-title">灵活时间考试</div>
                                            <div class="mode-desc">学生在指定期间内自主安排考试时间</div>
                                        </div>
                                    </div>
                                </el-radio>
                            </div>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 固定时间模式 -->
                    <div v-if="examForm.timeMode === 1" class="time-settings-panel">
                        <div class="panel-header">
                            <i class="el-icon-timer"></i>
                            <span>固定时间考试设置</span>
                            <el-tag type="warning" size="mini">所有学生必须在此时间段内完成考试</el-tag>
                        </div>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="考试开始时间：" prop="startTime">
                                    <el-date-picker v-model="examForm.startTime" type="datetime" placeholder="选择考试开始时间"
                                        value-format="yyyy-MM-dd HH:mm:ss" :picker-options="startTimeOptions"
                                        style="width: 100%">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="考试结束时间：" prop="endTime">
                                    <el-date-picker v-model="examForm.endTime" type="datetime" placeholder="选择考试结束时间"
                                        value-format="yyyy-MM-dd HH:mm:ss" :picker-options="endTimeOptions"
                                        style="width: 100%">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <div v-if="examForm.startTime && examForm.endTime" class="time-summary">
                            <el-alert
                                :title="`考试窗口时长：${calculateExamWindow()}分钟 | 开始时间：${examForm.startTime} | 结束时间：${examForm.endTime}`"
                                type="info" :closable="false" show-icon>
                            </el-alert>
                        </div>
                    </div>

                    <!-- 灵活时间模式 -->
                    <div v-if="examForm.timeMode === 2" class="time-settings-panel">
                        <div class="panel-header">
                            <i class="el-icon-date"></i>
                            <span>灵活时间考试设置</span>
                            <el-tag type="success" size="mini">学生可在指定期间内任选时间开始考试</el-tag>
                        </div>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="开放日期：" prop="flexibleStartDate">
                                    <el-date-picker v-model="examForm.flexibleStartDate" type="date"
                                        placeholder="选择考试开放日期" value-format="yyyy-MM-dd" style="width: 100%">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="截止日期：" prop="flexibleEndDate">
                                    <el-date-picker v-model="examForm.flexibleEndDate" type="date"
                                        placeholder="选择考试截止日期" value-format="yyyy-MM-dd"
                                        :picker-options="flexibleEndDateOptions" style="width: 100%">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item label="每日可考时间：">
                            <el-time-picker is-range v-model="examForm.dailyTimeRange" range-separator="至"
                                start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择每日可考试的时间段"
                                value-format="HH:mm:ss" style="width: 100%">
                            </el-time-picker>
                            <div class="time-tip">留空则表示全天24小时都可以考试</div>
                        </el-form-item>
                        <div v-if="examForm.flexibleStartDate && examForm.flexibleEndDate" class="time-summary">
                            <el-alert
                                :title="`考试期间：${examForm.flexibleStartDate} 至 ${examForm.flexibleEndDate}（共${calculateFlexibleDays()}天）`"
                                type="info" :closable="false" show-icon>
                            </el-alert>
                        </div>
                    </div>
                </div>

                <el-form-item label="考试时长" prop="duration">
                    <el-input-number v-model="examForm.duration" :min="1" :max="300" label="考试时长（分钟）"></el-input-number>
                    <span style="margin-left: 10px; color: #909399;">单次考试的时长限制</span>
                </el-form-item>
                <el-form-item label="试卷选择" prop="paperId">
                    <el-select v-model="examForm.paperId" placeholder="请选择试卷" style="width: 300px;">
                        <el-option v-for="item in paperOptions" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                    <el-button type="text" style="margin-left: 10px;" @click="goToCreatePaper">创建新试卷</el-button>
                </el-form-item>
                <el-form-item label="考试规则">
                    <el-checkbox v-model="examForm.showResult">考试后立即显示成绩</el-checkbox>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitExamForm" :loading="submitting">{{ submitting ? '保存中...' : '确 定'
                }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import teacherExamApi from '@/api/teacherExam'
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
            loading: false,
            submitting: false,
            exams: [],
            dialogVisible: false,
            dialogTitle: '创建新测验',
            isEdit: false,
            currentExamId: null,
            examForm: {
                title: '',
                description: '',
                timeMode: 1,
                startTime: '',
                endTime: '',
                flexibleStartDate: '',
                flexibleEndDate: '',
                dailyTimeRange: [],
                duration: 60,
                paperId: '',
                showResult: true
            },
            rules: {
                title: [
                    { required: true, message: '请输入测验标题', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请输入测验说明', trigger: 'blur' }
                ],
                timeMode: [
                    { required: true, message: '请选择考试时间模式', trigger: 'change' }
                ],
                duration: [
                    { required: true, message: '请设置考试时长', trigger: 'blur' }
                ],
                paperId: [
                    { required: true, message: '请选择试卷', trigger: 'change' }
                ]
            },
            paperOptions: [],
            startTimeOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7
                }
            },
            endTimeOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7
                }
            },
            flexibleEndDateOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7
                }
            }
        }
    },
    created() {
        this.fetchExams()
        this.fetchPapers()
    },
    methods: {
        formatDate,
        fetchExams() {
            this.loading = true
            teacherExamApi.getExamList(this.courseId).then(resp => {
                if (resp.code === 1) {
                    this.exams = resp.response
                } else {
                    this.$message.error(resp.message || '获取测验列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error('获取测验列表出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.loading = false
            })
        },
        fetchPapers() {
            teacherExamApi.getPaperList(this.courseId).then(resp => {
                if (resp.code === 1) {
                    this.paperOptions = resp.response
                } else {
                    this.$message.error(resp.message || '获取试卷列表失败')
                }
            }).catch(error => {
                console.error('获取试卷列表出错:', error)
                this.$message.error('网络错误，请稍后重试')
            })
        },
        handleAddExam() {
            this.dialogTitle = '创建新测验'
            this.isEdit = false
            this.currentExamId = null
            this.resetForm()
            this.dialogVisible = true
        },
        handleEditExam(exam) {
            this.dialogTitle = '编辑测验'
            this.isEdit = true
            this.currentExamId = exam.id
            this.examForm = {
                title: exam.title,
                description: exam.description || '',
                timeMode: exam.timeMode || 1,
                startTime: exam.startTime,
                endTime: exam.endTime,
                flexibleStartDate: exam.flexibleStartDate || '',
                flexibleEndDate: exam.flexibleEndDate || '',
                dailyTimeRange: exam.dailyTimeRange || [],
                duration: exam.duration,
                paperId: exam.paperId,
                showResult: exam.showResult
            }
            this.dialogVisible = true
        },
        submitExamForm() {
            this.$refs.examForm.validate((valid) => {
                if (valid) {
                    this.submitting = true
                    const examData = {
                        title: this.examForm.title,
                        description: this.examForm.description,
                        timeMode: this.examForm.timeMode,
                        startTime: this.examForm.startTime,
                        endTime: this.examForm.endTime,
                        flexibleStartDate: this.examForm.flexibleStartDate,
                        flexibleEndDate: this.examForm.flexibleEndDate,
                        dailyTimeRange: this.examForm.dailyTimeRange,
                        duration: this.examForm.duration,
                        paperId: this.examForm.paperId,
                        showResult: this.examForm.showResult,
                        courseId: this.courseId
                    }

                    const apiCall = this.isEdit
                        ? teacherExamApi.updateExam(this.currentExamId, examData)
                        : teacherExamApi.createExam(examData)

                    apiCall.then(resp => {
                        if (resp.code === 1) {
                            this.$message.success(this.isEdit ? '测验更新成功' : '测验创建成功')
                            this.dialogVisible = false
                            this.fetchExams()
                        } else {
                            this.$message.error(resp.message || '操作失败')
                        }
                        this.submitting = false
                    }).catch(error => {
                        console.error('提交出错:', error)
                        this.$message.error('网络错误，请稍后重试')
                        this.submitting = false
                    })
                }
            })
        },
        resetForm() {
            this.examForm = {
                title: '',
                description: '',
                timeMode: 1,
                startTime: '',
                endTime: '',
                flexibleStartDate: '',
                flexibleEndDate: '',
                dailyTimeRange: [],
                duration: 60,
                paperId: '',
                showResult: true
            }
            this.$nextTick(() => {
                this.$refs.examForm && this.$refs.examForm.clearValidate()
            })
        },
        timeModeChange() {
            // 清空其他模式的数据
            if (this.examForm.timeMode === 1) {
                this.examForm.flexibleStartDate = ''
                this.examForm.flexibleEndDate = ''
                this.examForm.dailyTimeRange = []
            } else {
                this.examForm.startTime = ''
                this.examForm.endTime = ''
            }
        },
        calculateExamWindow() {
            if (!this.examForm.startTime || !this.examForm.endTime) {
                return 0
            }
            const start = new Date(this.examForm.startTime)
            const end = new Date(this.examForm.endTime)
            return Math.round((end - start) / (1000 * 60))
        },
        calculateFlexibleDays() {
            if (!this.examForm.flexibleStartDate || !this.examForm.flexibleEndDate) {
                return 0
            }
            const start = new Date(this.examForm.flexibleStartDate)
            const end = new Date(this.examForm.flexibleEndDate)
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
        },
        getStatusType(status) {
            const statusMap = {
                1: 'info',
                2: 'warning',
                3: 'success',
                4: 'danger'
            }
            return statusMap[status] || 'info'
        },
        getStatusText(status) {
            const statusMap = {
                1: '未开始',
                2: '进行中',
                3: '已结束',
                4: '已取消'
            }
            return statusMap[status] || '未知'
        },
        handleViewResults(exam) {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exam/${exam.id}/results`
            })
        },
        handleDeleteExam(exam) {
            this.$confirm('确定要删除这个测验吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                teacherExamApi.deleteExam(exam.id).then(resp => {
                    if (resp.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchExams()
                    } else {
                        this.$message.error(resp.message || '删除失败')
                    }
                })
            })
        },
        goToPapers() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/papers`
            })
        },
        goToQuestionBank() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/questionBank`
            })
        },
        goToCreatePaper() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/papers/create`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.exams-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        margin: 0;
        color: #303133;
    }
}

.header-actions {
    .el-button+.el-button {
        margin-left: 10px;
    }
}

.exam-dialog {
    .time-setting-section {
        margin: 20px 0;

        .time-mode-options {
            display: flex;
            gap: 20px;

            .mode-radio {
                flex: 1;

                .el-radio__input {
                    display: none;
                }

                .el-radio__label {
                    padding: 0;
                }

                .time-mode-card {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    border: 2px solid #DCDFE6;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #fafafa;

                    &:hover {
                        border-color: #409EFF;
                        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
                    }

                    &.active {
                        border-color: #409EFF;
                        background: #ecf5ff;
                        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
                    }

                    .mode-icon {
                        font-size: 32px;
                        color: #409EFF;
                        margin-right: 15px;
                    }

                    .mode-content {
                        .mode-title {
                            font-size: 16px;
                            font-weight: bold;
                            color: #303133;
                            margin-bottom: 5px;
                        }

                        .mode-desc {
                            font-size: 13px;
                            color: #909399;
                            line-height: 1.4;
                        }
                    }
                }
            }
        }
    }

    .time-settings-panel {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;

        .panel-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;

            i {
                font-size: 18px;
                color: #409EFF;
                margin-right: 8px;
            }

            span {
                font-size: 16px;
                font-weight: bold;
                color: #303133;
                margin-right: 15px;
            }
        }

        .time-summary {
            margin-top: 15px;
        }

        .time-tip {
            font-size: 12px;
            color: #909399;
            margin-top: 5px;
        }
    }
}

.dialog-footer {
    text-align: right;
}
</style>