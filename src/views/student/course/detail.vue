<template>
    <div class="app-container">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="课程信息" name="info">
                <el-form :model="course" ref="form" label-width="100px" v-loading="formLoading">
                    <el-form-item label="课程名称：">
                        <el-input v-model="course.name" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="课程代码：">
                        <el-input v-model="course.code" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="学期：">
                        <el-input v-model="course.semester" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="学分：">
                        <el-input v-model="course.credit" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="课程描述：">
                        <el-input type="textarea" v-model="course.description" :disabled="true" :rows="5"></el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="课程测验" name="exams">
                <div v-loading="examsLoading">
                    <div v-if="exams.length === 0" class="empty-tip">
                        暂无测验
                    </div>
                    <el-card v-for="exam in exams" :key="exam.id" class="exam-card" shadow="hover">
                        <div class="exam-title">{{ exam.title }}</div>
                        <div class="exam-info">
                            <div>
                                <span class="info-label">开始时间：</span>
                                <span>{{ exam.startTime }}</span>
                            </div>
                            <div>
                                <span class="info-label">结束时间：</span>
                                <span>{{ exam.endTime }}</span>
                            </div>
                            <div>
                                <span class="info-label">时长：</span>
                                <span>{{ exam.duration }}分钟</span>
                            </div>
                            <div>
                                <span class="info-label">状态：</span>
                                <el-tag :type="getStatusType(exam.status)">{{ getStatusText(exam.status) }}</el-tag>
                            </div>
                        </div>
                        <div class="exam-actions">
                            <el-button type="primary" size="small" @click="startExam(exam)"
                                :disabled="exam.status !== 1">
                                开始测验
                            </el-button>
                            <el-button size="small" @click="viewResult(exam)" v-if="exam.hasSubmitted">
                                查看成绩
                            </el-button>
                        </div>
                    </el-card>
                </div>
            </el-tab-pane>
            <el-tab-pane label="课程资源" name="resources">
                <div v-loading="resourcesLoading">
                    <div v-if="resources.length === 0" class="empty-tip">
                        暂无资源
                    </div>
                    <el-table :data="resources" style="width: 100%">
                        <el-table-column prop="title" label="资源名称"></el-table-column>
                        <el-table-column prop="type" label="类型" width="120">
                            <template slot-scope="scope">
                                {{ getResourceType(scope.row.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="上传时间" width="180"></el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" @click="downloadResource(scope.row)">下载</el-button>
                                <el-button type="text" @click="previewResource(scope.row)"
                                    v-if="canPreview(scope.row.type)">预览</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="bottom-actions">
            <el-button @click="goBack">返回</el-button>
        </div>
    </div>
</template>

<script>
import studentCourseApi from '@/api/studentCourse'
import studentExamApi from '@/api/studentExam'
import studentResourceApi from '@/api/studentResource'

export default {
    data() {
        return {
            activeTab: 'info',
            courseId: null,
            formLoading: false,
            examsLoading: false,
            resourcesLoading: false,
            course: {
                id: null,
                name: '',
                code: '',
                semester: '',
                credit: '',
                description: '',
                status: 1,
                createTime: '',
                updateTime: ''
            },
            exams: [],
            resources: []
        }
    },
    created() {
        const id = this.$route.params.id || this.$route.query.id
        this.courseId = id
        if (id && parseInt(id) !== 0) {
            this.loadCourseData()
        }
    },
    methods: {
        loadCourseData() {
            this.formLoading = true
            studentCourseApi.getCourse(this.courseId).then(data => {
                const re = data.response
                this.course = re
                this.formLoading = false
                this.loadExams()
                this.loadResources()
            })
        },
        loadExams() {
            this.examsLoading = true
            studentExamApi.getExamList(this.courseId).then(data => {
                if (data.code === 1) {
                    this.exams = data.response
                }
                this.examsLoading = false
            }).catch(() => {
                this.examsLoading = false
            })
        },
        loadResources() {
            this.resourcesLoading = true
            studentResourceApi.getResourceList(this.courseId).then(data => {
                if (data.code === 1) {
                    this.resources = data.response
                }
                this.resourcesLoading = false
            }).catch(() => {
                this.resourcesLoading = false
            })
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
        getResourceType(type) {
            switch (type) {
                case 1: return '文档'
                case 2: return 'PPT'
                case 3: return '视频'
                case 4: return '音频'
                default: return '其他'
            }
        },
        canPreview(type) {
            // 只有部分类型的资源可以预览
            return [1, 2, 3].includes(type)
        },
        startExam(exam) {
            // 跳转到考试页面
            this.$router.push({
                path: `/student/exam/do`,
                query: { id: exam.paperId, examId: exam.id, courseId: this.courseId }
            })
        },
        viewResult(exam) {
            // 跳转到成绩查看页面
            this.$router.push({
                path: `/student/exam/result`,
                query: { id: exam.answerId }
            })
        },
        downloadResource(resource) {
            window.open(resource.url, '_blank')
        },
        previewResource(resource) {
            // 根据资源类型预览
            if (resource.type === 3) { // 视频
                this.$router.push({
                    path: `/student/resource/preview`,
                    query: { id: resource.id, type: 'video' }
                })
            } else {
                window.open(resource.url, '_blank')
            }
        },
        goBack() {
            this.$router.push('/student/course/list')
        }
    }
}
</script>

<style lang="scss" scoped>
.exam-card {
    margin-bottom: 15px;
}

.exam-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.exam-info {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;

    div {
        width: 50%;
        margin-bottom: 8px;
    }

    .info-label {
        color: #909399;
    }
}

.exam-actions {
    text-align: right;
}

.empty-tip {
    text-align: center;
    color: #909399;
    padding: 30px 0;
}

.bottom-actions {
    margin-top: 20px;
    text-align: center;
}
</style>