<template>
    <div>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>课程信息</span>
            </div>
            <div v-loading="loading">
                <el-form v-if="course" label-width="100px" class="course-form">
                    <el-form-item label="课程名称：">
                        <span>{{ course.name }}</span>
                    </el-form-item>
                    <el-form-item label="课程代码：">
                        <span>{{ course.code }}</span>
                    </el-form-item>
                    <el-form-item label="学期：">
                        <span>{{ course.semester }}</span>
                    </el-form-item>
                    <el-form-item label="学分：">
                        <span>{{ course.credit }}</span>
                    </el-form-item>
                    <el-form-item label="创建时间：" v-if="course.createTime">
                        <span>{{ course.createTime }}</span>
                    </el-form-item>
                    <el-form-item label="课程描述：">
                        <div class="course-description">{{ course.description || '暂无描述' }}</div>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <el-card class="box-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>课程通知</span>
            </div>
            <div class="empty-block" v-if="!hasAnnouncements">
                <el-empty description="暂无通知"></el-empty>
            </div>
            <!-- 后续可添加课程通知列表 -->
        </el-card>

        <el-card class="box-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>近期作业</span>
            </div>
            <div class="empty-block" v-if="!hasAssignments">
                <el-empty description="暂无近期作业"></el-empty>
            </div>
            <!-- 后续可添加近期作业列表 -->
        </el-card>
    </div>
</template>

<script>
import studentCourseApi from '@/api/studentCourse'

export default {
    data() {
        return {
            courseId: null,
            course: null,
            loading: false,
            hasAnnouncements: false,
            hasAssignments: false
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.fetchCourseInfo()
    },
    methods: {
        fetchCourseInfo() {
            this.loading = true
            studentCourseApi.getCourse(this.courseId).then(response => {
                if (response.code === 1) {
                    this.course = response.response
                } else {
                    this.$message.error('获取课程信息失败')
                }
                this.loading = false
            }).catch(() => {
                this.$message.error('获取课程信息失败')
                this.loading = false
            })
        }
    }
}
</script>

<style scoped>
.course-form .el-form-item {
    margin-bottom: 15px;
}

.course-description {
    white-space: pre-line;
    line-height: 1.5;
    color: #606266;
}

.empty-block {
    padding: 20px 0;
}
</style>