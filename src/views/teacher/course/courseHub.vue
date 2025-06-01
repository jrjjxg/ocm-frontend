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
                    <el-menu-item index="assignments">
                        <i class="el-icon-s-order"></i>
                        <span>作业管理</span>
                    </el-menu-item>
                    <el-menu-item index="exams">
                        <i class="el-icon-s-claim"></i>
                        <span>测验管理</span>
                    </el-menu-item>
                    <el-menu-item index="resources">
                        <i class="el-icon-document"></i>
                        <span>课程资料</span>
                    </el-menu-item>
                    <el-menu-item index="students">
                        <i class="el-icon-user"></i>
                        <span>学生管理</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="course-main-content">
                <router-view :courseId="courseId" />
            </div>
        </div>
    </div>
</template>

<script>
import teacherCourseApi from '@/api/teacherCourse'

export default {
    data() {
        return {
            courseId: null,
            course: null,
            loading: true,
            activeMenu: 'overview'
        }
    },
    computed: {
        currentPath() {
            return this.$route.path
        }
    },
    watch: {
        $route: {
            immediate: true,
            handler(route) {
                // 从路由路径中提取当前活动的菜单项
                const pathParts = route.path.split('/')
                const lastPart = pathParts[pathParts.length - 1]
                this.activeMenu = lastPart
            }
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.fetchCourseInfo()
    },
    methods: {
        fetchCourseInfo() {
            this.loading = true
            teacherCourseApi.getCourse(this.courseId).then(res => {
                this.course = res.response
                this.loading = false
            }).catch(error => {
                this.$message.error('获取课程信息失败')
                this.loading = false
            })
        },
        handleMenuSelect(key) {
            const targetPath = `/teacher/course/${this.courseId}/${key}`
            // 只有当目标路径与当前路径不同时才进行导航
            if (this.$route.path !== targetPath) {
                this.$router.push(targetPath).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        // 如果不是导航重复错误，则抛出
                        throw err
                    }
                    // 否则忽略这个错误
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.course-hub {
    .course-info-card {
        margin-bottom: 20px;
    }

    .course-content {
        display: flex;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        min-height: 500px;

        .course-sidebar {
            width: 200px;
            border-right: 1px solid #e6e6e6;

            .course-menu {
                height: 100%;
                border-right: none;
            }
        }

        .course-main-content {
            flex: 1;
            padding: 20px;
        }
    }
}
</style>