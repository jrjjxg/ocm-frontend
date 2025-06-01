<template>
    <div class="app-container course-hub">
        <el-card class="course-info-card">
            <div slot="header" class="clearfix">
                <span>{{ course ? course.name : '加载中...' }}</span>
            </div>
            <div v-loading="loading">
                <p v-if="course"><strong>课程代码：</strong>{{ course.code }}</p>
                <p v-if="course"><strong>学期：</strong>{{ course.semester }}</p>
            </div>
        </el-card>

        <div class="course-content">
            <div class="course-sidebar">
                <el-menu :default-active="activeMenu" class="course-menu" @select="handleMenuSelect">
                    <el-menu-item index="overview">
                        <i class="el-icon-s-home"></i>
                        <span>课程概览</span>
                    </el-menu-item>
                    <el-menu-item index="resources">
                        <i class="el-icon-document"></i>
                        <span>课程资源</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="course-main-content">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script>
import studentCourseApi from '@/api/studentCourse'

export default {
    data() {
        return {
            courseId: null,
            course: null,
            loading: false
        }
    },
    computed: {
        activeMenu() {
            const path = this.$route.path
            const lastPart = path.substring(path.lastIndexOf('/') + 1)
            return lastPart
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
        },
        handleMenuSelect(key) {
            this.$router.push(`/student/course/${this.courseId}/${key}`)
        }
    }
}
</script>

<style scoped>
.course-hub {
    display: flex;
    flex-direction: column;
}

.course-info-card {
    margin-bottom: 20px;
}

.course-content {
    display: flex;
    flex: 1;
    min-height: 600px;
}

.course-sidebar {
    width: 200px;
    margin-right: 20px;
    border-right: 1px solid #e6e6e6;
}

.course-menu {
    border-right: none;
}

.course-main-content {
    flex: 1;
}
</style>