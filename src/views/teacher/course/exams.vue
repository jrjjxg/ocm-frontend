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
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="60%">
            <el-form :model="examForm" :rules="rules" ref="examForm" label-width="100px">
                <el-form-item label="测验标题" prop="title">
                    <el-input v-model="examForm.title"></el-input>
                </el-form-item>
                <el-form-item label="测验说明" prop="description">
                    <el-input type="textarea" :rows="3" v-model="examForm.description" placeholder="请输入测验说明"></el-input>
                </el-form-item>

                <!-- 改进的时间设置 -->
                <div class="time-setting-section">
                    <el-form-item label="考试时间模式：" prop="timeMode">
                        <el-radio-group v-model="examForm.timeMode" @change="timeModeChange">
                            <el-radio :label="1">
                                <span class="time-mode-option">
                                    <i class="el-icon-timer"></i>
                                    <strong>固定时间考试</strong>
                                    <span class="mode-desc">所有学生在指定时间段内参加考试</span>
                                </span>
                            </el-radio>
                            <el-radio :label="2">
                                <span class="time-mode-option">
                                    <i class="el-icon-date"></i>
                                    <strong>灵活时间考试</strong>
                                    <span class="mode-desc">学生在指定期间内自主安排考试时间</span>
                                </span>
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 固定时间模式 -->
                    <div v-if="examForm.timeMode === 1" class="time-mode-card">
                        <div class="mode-header">
                            <i class="el-icon-timer"></i>
                            <span>固定时间考试设置</span>
                            <el-tag type="warning" size="mini">学生点击开始考试即开始计时</el-tag>
                        </div>
                        <el-form-item label="考试开始时间：" prop="startTime">
                            <el-date-picker v-model="examForm.startTime" type="datetime" placeholder="选择考试开始时间"
                                value-format="yyyy-MM-dd HH:mm:ss" :picker-options="startTimeOptions"
                                @change="updateEndTime" style="width: 100%">
                            </el-date-picker>
                            <div class="time-tip">学生可在此时间后开始考试</div>
                        </el-form-item>
                        <div v-if="examForm.startTime && examForm.duration" class="time-summary">
                            <el-alert :title="`考试安排：${examForm.startTime} 开始，单次考试时长 ${examForm.duration} 分钟`"
                                type="info" :closable="false" show-icon>
                            </el-alert>
                        </div>
                    </div>

                    <!-- 灵活时间模式 -->
                    <div v-if="examForm.timeMode === 2" class="time-mode-card">
                        <div class="mode-header">
                            <i class="el-icon-date"></i>
                            <span>灵活时间考试设置</span>
                            <el-tag type="success" size="mini">学生可在指定期间内任选时间开始考试</el-tag>
                        </div>
                        <el-form-item label="开放时间：" prop="flexibleStartDate">
                            <el-date-picker v-model="examForm.flexibleStartDate" type="date" placeholder="选择考试开放日期"
                                value-format="yyyy-MM-dd" style="width: 100%">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="截止时间：" prop="flexibleEndDate">
                            <el-date-picker v-model="examForm.flexibleEndDate" type="date" placeholder="选择考试截止日期"
                                value-format="yyyy-MM-dd" :picker-options="flexibleEndDateOptions" style="width: 100%">
                            </el-date-picker>
                        </el-form-item>
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
                    <el-input-number v-model="examForm.duration" :min="1" :max="300" @change="updateEndTime"
                        label="考试时长（分钟）"></el-input-number>
                    <span style="margin-left: 10px; color: #909399;">单次考试的时长限制</span>
                </el-form-item>
                <el-form-item label="试卷选择" prop="paperId">
                    <el-select v-model="examForm.paperId" placeholder="请选择试卷">
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
                <el-button type="primary" @click="submitExamForm">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 成绩统计信息卡片 -->
        <el-card class="dashboard-card" v-if="examStats.length > 0">
            <div slot="header" class="clearfix">
                <span>测验统计概览</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="refreshStats">刷新</el-button>
            </div>
            <el-row :gutter="20">
                <el-col :span="8" v-for="(stat, index) in examStats" :key="index">
                    <div class="stat-card" @click="handleViewResults(stat)">
                        <div class="stat-title">{{ stat.title }}</div>
                        <div class="stat-data">
                            <div class="stat-number">{{ stat.submitCount }}/{{ stat.totalCount }}</div>
                            <div class="stat-label">已参与/总人数</div>
                        </div>
                        <div class="stat-progress">
                            <el-progress :percentage="calculatePercentage(stat.submitCount, stat.totalCount)"
                                :color="getProgressColor(stat.status)">
                            </el-progress>
                        </div>
                        <div class="stat-footer">
                            <el-tag size="small" :type="getStatusType(stat.status)">
                                {{ getStatusText(stat.status) }}
                            </el-tag>
                            <span class="stat-date">{{ formatDate(stat.endTime) }}</span>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>
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
            exams: [],
            examStats: [],
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
                startTime: [
                    { required: true, message: '请选择考试开始时间', trigger: 'change' }
                ],
                duration: [
                    { required: true, message: '请设置考试时长', trigger: 'blur' }
                ],
                paperId: [
                    { required: true, message: '请选择试卷', trigger: 'change' }
                ]
            },
            paperOptions: [],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7 // 不允许选择过去的日期
                }
            },
            startTimeOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7 // 不允许选择过去的日期
                }
            },
            endTimeOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7 // 不允许选择过去的日期
                }
            },
            flexibleEndDateOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7 // 不允许选择过去的日期
                }
            }
        }
    },
    created() {
        this.fetchExams()
        this.fetchPapers()
        this.fetchRecentExamsStats()
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
        fetchRecentExamsStats() {
            // 获取最近几个测验的统计数据
            teacherExamApi.getExamList(this.courseId).then(resp => {
                if (resp.code === 1) {
                    // 只取最近的3个测验
                    this.examStats = resp.response.slice(0, 3)
                }
            }).catch(error => {
                console.error('获取测验统计数据出错:', error)
            })
        },
        refreshStats() {
            this.fetchRecentExamsStats()
            this.$message.success('统计数据已刷新')
        },
        calculatePercentage(submit, total) {
            if (total === 0) return 0
            return Math.round((submit / total) * 100)
        },
        getProgressColor(status) {
            switch (status) {
                case 0: return '#909399' // 未开始
                case 1: return '#67C23A' // 进行中
                case 2: return '#409EFF' // 已结束
                default: return '#909399'
            }
        },
        getStatusType(status) {
            switch (status) {
                case 0: return 'info'    // 未开始
                case 1: return 'success' // 进行中
                case 2: return 'danger'  // 已结束
                default: return 'info'
            }
        },
        getStatusText(status) {
            switch (status) {
                case 0: return '未开始'
                case 1: return '进行中'
                case 2: return '已结束'
                default: return '未知'
            }
        },
        handleAddExam() {
            this.dialogTitle = '创建新测验'
            this.isEdit = false
            this.currentExamId = null
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
            this.dialogVisible = true
        },
        handleEditExam(row) {
            this.dialogTitle = '编辑测验'
            this.isEdit = true
            this.currentExamId = row.id

            // 获取测验详情
            teacherExamApi.getExam(this.courseId, row.id).then(resp => {
                if (resp.code === 1) {
                    const exam = resp.response
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
                        showResult: exam.showResult !== undefined ? exam.showResult : true
                    }
                } else {
                    this.$message.error(resp.message || '获取测验详情失败')
                }
            }).catch(error => {
                console.error('获取测验详情出错:', error)
                this.$message.error('网络错误，请稍后重试')
            })

            this.dialogVisible = true
        },
        handleDeleteExam(row) {
            this.$confirm('确认删除该测验吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                teacherExamApi.deleteExam(this.courseId, row.id).then(resp => {
                    if (resp.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchExams()
                    } else {
                        this.$message.error(resp.message || '删除失败')
                    }
                }).catch(error => {
                    console.error('删除测验出错:', error)
                    this.$message.error('网络错误，请稍后重试')
                })
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handleViewResults(row) {
            // 跳转到成绩查看页面
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exam/${row.id}/results`
            })
        },
        submitExamForm() {
            this.$refs.examForm.validate((valid) => {
                if (valid) {
                    const formData = {
                        title: this.examForm.title,
                        description: this.examForm.description,
                        timeMode: this.examForm.timeMode,
                        startTime: this.examForm.startTime,
                        endTime: this.examForm.endTime, // 自动计算的结束时间
                        flexibleStartDate: this.examForm.flexibleStartDate,
                        flexibleEndDate: this.examForm.flexibleEndDate,
                        dailyTimeRange: this.examForm.dailyTimeRange,
                        duration: this.examForm.duration,
                        paperId: this.examForm.paperId,
                        showResult: this.examForm.showResult,
                        courseId: this.courseId
                    }

                    if (this.isEdit) {
                        formData.id = this.currentExamId
                        // 调用编辑API - 使用新的RESTful风格接口
                        teacherExamApi.updateExam(this.courseId, this.currentExamId, formData).then(resp => {
                            if (resp.code === 1) {
                                this.$message.success('测验更新成功')
                                this.dialogVisible = false
                                this.fetchExams()
                            } else {
                                this.$message.error(resp.message || '更新失败')
                            }
                        }).catch(error => {
                            console.error('更新测验出错:', error)
                            this.$message.error('网络错误，请稍后重试')
                        })
                    } else {
                        // 调用新增API - 使用新的RESTful风格接口
                        teacherExamApi.createExam(this.courseId, formData).then(resp => {
                            if (resp.code === 1) {
                                this.$message.success('测验创建成功')
                                this.dialogVisible = false
                                this.fetchExams()
                            } else {
                                this.$message.error(resp.message || '创建失败')
                            }
                        }).catch(error => {
                            console.error('创建测验出错:', error)
                            this.$message.error('网络错误，请稍后重试')
                        })
                    }
                } else {
                    return false
                }
            })
        },
        goToCreatePaper() {
            // 跳转到创建试卷页面
            this.$router.push({
                path: `/teacher/course/${this.courseId}/paper/edit`,
                query: { returnPath: this.$route.fullPath }
            })
        },
        goToPapers() {
            // 跳转到试卷管理页面
            this.$router.push({
                path: `/teacher/course/${this.courseId}/papers`
            })
        },
        goToQuestionBank() {
            // 跳转到题库管理页面
            this.$router.push({
                path: `/teacher/course/${this.courseId}/questionBank`
            })
        },
        timeModeChange() {
            // 清空其他模式的数据
            if (this.examForm.timeMode === 1) {
                this.examForm.flexibleStartDate = ''
                this.examForm.flexibleEndDate = ''
                this.examForm.dailyTimeRange = []
                // 如果有开始时间和时长，重新计算结束时间
                this.updateEndTime()
            } else {
                this.examForm.startTime = ''
                this.examForm.endTime = ''
            }
        },
        updateEndTime() {
            // 根据开始时间和考试时长自动计算结束时间
            if (this.examForm.startTime && this.examForm.duration) {
                const startTime = new Date(this.examForm.startTime)
                const endTime = new Date(startTime.getTime() + this.examForm.duration * 60 * 1000)
                this.examForm.endTime = this.formatDateTime(endTime)
            }
        },
        formatDateTime(date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },
        calculateExamWindow() {
            if (!this.examForm.startTime || !this.examForm.endTime) {
                return 0
            }
            const start = new Date(this.examForm.startTime)
            const end = new Date(this.examForm.endTime)
            return Math.round((end - start) / (1000 * 60)) // 转换为分钟
        },
        calculateFlexibleDays() {
            if (!this.examForm.flexibleStartDate || !this.examForm.flexibleEndDate) {
                return 0
            }
            const start = new Date(this.examForm.flexibleStartDate)
            const end = new Date(this.examForm.flexibleEndDate)
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 // 包含开始和结束日期
        }
    }
}
</script>

<style lang="scss" scoped>
.exams-container {
    padding: 20px;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            color: #303133;
        }

        .header-actions {
            display: flex;
            gap: 10px;
        }
    }

    // 时间模式选择的样式
    .time-setting-section {
        margin: 20px 0;

        .time-mode-options {
            display: flex;
            gap: 20px;
            margin-top: 15px;

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

.dashboard-card {
    margin-top: 30px;

    .stat-card {
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        padding: 15px;
        margin-bottom: 20px;
        cursor: pointer;
        transition: all .3s;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, .2);
        }

        .stat-title {
            font-size: 16px;
            margin-bottom: 15px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .stat-data {
            display: flex;
            align-items: baseline;
            margin-bottom: 10px;

            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #303133;
                margin-right: 10px;
            }

            .stat-label {
                font-size: 14px;
                color: #909399;
            }
        }

        .stat-progress {
            margin-bottom: 15px;
        }

        .stat-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .stat-date {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}
</style>