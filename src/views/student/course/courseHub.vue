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
                    <el-menu-item index="homework">
                        <i class="el-icon-edit"></i>
                        <span>课程作业</span>
                    </el-menu-item>
                    <el-menu-item index="exams">
                        <i class="el-icon-document"></i>
                        <span>课程测验</span>
                    </el-menu-item>
                    <el-menu-item index="resources">
                        <i class="el-icon-folder"></i>
                        <span>课程资源</span>
                    </el-menu-item>
                    <el-menu-item index="discussion">
                        <i class="el-icon-chat-line-round"></i>
                        <span>课程讨论</span>
                    </el-menu-item>
                    <el-menu-item index="grades">
                        <i class="el-icon-trophy"></i>
                        <span>我的成绩</span>
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
    watch: {
        '$route'(to, from) {
            // 当路由变化时，重新获取课程ID
            const newCourseId = this.getCourseIdFromRoute()
            if (newCourseId !== this.courseId) {
                this.courseId = newCourseId
                this.fetchCourseInfo()
            }
        }
    },
    created() {
        // 正确获取课程ID：从路径中解析或使用路由参数
        this.courseId = this.getCourseIdFromRoute()
        this.fetchCourseInfo()
    },
    methods: {
        getCourseIdFromRoute() {
            // 从路径中解析课程ID
            // 路径格式: /student/course/{courseId}/... 或 /student/course/{courseId}
            const pathParts = this.$route.path.split('/')
            const courseIndex = pathParts.indexOf('course')

            if (courseIndex !== -1 && courseIndex + 1 < pathParts.length) {
                const courseId = pathParts[courseIndex + 1]
                console.log('从路径解析课程ID:', courseId, '路径:', this.$route.path)
                return courseId
            }

            // 备用方案：如果是直接访问课程页面，使用路由参数
            console.log('使用路由参数获取课程ID:', this.$route.params.id)
            return this.$route.params.id
        },

        fetchCourseInfo() {
            this.loading = true
            studentCourseApi.getCourse(this.courseId).then(response => {
                if (response.code === 1) {
                    this.course = response.response
                } else {
                    // 如果课程不存在或无权限访问，显示默认信息
                    console.warn('获取课程信息失败:', response.message)
                    this.course = {
                        name: '课程信息加载失败',
                        code: '',
                        semester: ''
                    }
                }
                this.loading = false
            }).catch(error => {
                console.error('获取课程信息失败:', error)
                // 设置默认课程信息，避免页面显示异常
                this.course = {
                    name: '课程信息加载失败',
                    code: '',
                    semester: ''
                }
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