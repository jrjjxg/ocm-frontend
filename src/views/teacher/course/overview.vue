<template>
    <div class="course-overview">
        <!-- 课程详情信息卡片 -->
        <el-card shadow="hover" class="course-info-card">
            <div slot="header" class="clearfix">
                <span>课程详情</span>
            </div>
            <el-form v-loading="courseLoading" label-width="100px" class="course-form">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="课程名称：">
                            <span>{{ course.name }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="课程代码：">
                            <span>{{ course.code }}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="学期：">
                            <span>{{ course.semester }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="学分：">
                            <span>{{ course.credit }}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="创建时间：">
                            <span>{{ course.createTime }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态：">
                            <el-tag :type="statusTagFormatter(course.status)">
                                {{ statusFormatter(course.status) }}
                            </el-tag>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="课程描述：">
                    <div class="course-description">{{ course.description || '暂无描述' }}</div>
                </el-form-item>
            </el-form>
        </el-card>








    </div>
</template>

<script>
import teacherCourseApi from '@/api/teacherCourse'

export default {
    props: {
        courseId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {



            course: {
                name: '',
                code: '',
                semester: '',
                credit: '',
                createTime: '',
                status: '',
                description: ''
            },
            courseLoading: false
        }
    },
    created() {
        this.fetchCourseInfo()
    },
    methods: {


        fetchCourseInfo() {
            this.courseLoading = true
            teacherCourseApi.getCourse(this.courseId).then(res => {
                this.course = res.response
                this.courseLoading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取课程信息失败')
                this.courseLoading = false
            })
        },

        statusFormatter(status) {
            return status === 1 ? '启用' : '禁用'
        },
        statusTagFormatter(status) {
            return status === 1 ? 'success' : 'danger'
        }
    }
}
</script>

<style lang="scss" scoped>
.course-overview {


    .course-info-card {
        margin-bottom: 20px;

        .course-form {
            .el-form-item {
                margin-bottom: 15px;
            }
        }

        .course-description {
            white-space: pre-line;
            line-height: 1.5;
            color: #606266;
        }
    }

    .empty-data {
        text-align: center;
        color: #909399;
        padding: 30px 0;
    }


}
</style>