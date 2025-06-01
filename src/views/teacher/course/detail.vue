<template>
    <div class="app-container course-hub">
        <el-card class="course-info-card">
            <div slot="header" class="clearfix">
                <span>{{ course.name }}</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">返回课程列表</el-button>
            </div>
            <div class="course-brief-info" v-loading="formLoading">
                <div class="info-item">
                    <strong>课程代码：</strong>{{ course.code }}
                </div>
                <div class="info-item">
                    <strong>学期：</strong>{{ course.semester }}
                </div>
                <div class="info-item">
                    <strong>学分：</strong>{{ course.credit }}
                </div>
                <div class="info-item">
                    <strong>状态：</strong>
                    <el-tag :type="statusTagFormatter(course.status)">
                        {{ statusFormatter(course.status) }}
                    </el-tag>
                </div>
            </div>
        </el-card>

        <!-- 移动设备显示的菜单 -->
        <div class="mobile-menu-bar" v-show="isMobileView">
            <el-button type="text" @click="showMobileMenu = true">
                <i class="el-icon-menu"></i> 课程菜单
            </el-button>
            <span class="current-section">{{ menuLabels[activeMenu] }}</span>
        </div>

        <!-- 移动设备的抽屉菜单 -->
        <el-drawer title="课程菜单" :visible.sync="showMobileMenu" direction="ltr" size="80%">
            <el-menu :default-active="activeMenu" class="mobile-drawer-menu" @select="handleMenuSelect">
                <el-menu-item v-for="(label, key) in menuLabels" :key="key" :index="key">
                    <i :class="menuIcons[key]"></i>
                    <span>{{ label }}</span>
                </el-menu-item>
            </el-menu>
        </el-drawer>

        <div class="course-content" ref="courseContent" @touchstart="touchStart" @touchmove="touchMove"
            @touchend="touchEnd">
            <div class="course-sidebar" v-show="!isMobileView">
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
            <div class="course-main-content" :class="{ 'sliding': isSliding }" :style="slideStyle">
                <!-- 滑动指示器 -->
                <div class="slide-indicator" v-show="isMobileView">
                    <div v-for="(label, index) in Object.keys(menuLabels)" :key="index"
                        :class="['indicator-dot', { active: activeMenu === Object.keys(menuLabels)[index] }]"></div>
                </div>

                <!-- 课程概览 -->
                <div v-if="activeMenu === 'overview'">
                    <course-overview :course-id="course.id" />
                </div>

                <!-- 作业管理 -->
                <div v-else-if="activeMenu === 'assignments'">
                    <course-assignments :course-id="course.id" />
                </div>

                <!-- 测验管理 -->
                <div v-else-if="activeMenu === 'exams'">
                    <course-exams :course-id="course.id" />
                </div>

                <!-- 课程资料 -->
                <div v-else-if="activeMenu === 'resources'">
                    <course-resources :course-id="course.id" />
                </div>

                <!-- 学生管理 -->
                <div v-else-if="activeMenu === 'students'">
                    <course-students :course-id="course.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import teacherCourseApi from '@/api/teacherCourse'
import CourseOverview from './overview'
import CourseAssignments from './assignments'
import CourseExams from './exams'
import CourseResources from './resources'
import CourseStudents from './students'

export default {
    components: {
        CourseOverview,
        CourseAssignments,
        CourseExams,
        CourseResources,
        CourseStudents
    },
    data() {
        return {
            formLoading: false,
            activeMenu: 'overview',
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
            // 新增的响应式和滑动相关数据
            isMobileView: false,
            showMobileMenu: false,
            menuLabels: {
                'overview': '课程概览',
                'assignments': '作业管理',
                'exams': '测验管理',
                'resources': '课程资料',
                'students': '学生管理'
            },
            menuIcons: {
                'overview': 'el-icon-s-home',
                'assignments': 'el-icon-s-order',
                'exams': 'el-icon-s-claim',
                'resources': 'el-icon-document',
                'students': 'el-icon-user'
            },
            // 触摸滑动相关
            touchStartX: 0,
            touchEndX: 0,
            slideDistance: 0,
            isSliding: false,
            slideStyle: {}
        }
    },
    created() {
        const id = this.$route.params.id || this.$route.query.id
        if (id && parseInt(id) !== 0) {
            this.loadCourse(id)
        }

        // 检测移动设备视图
        this.checkMobileView()
        // 监听窗口大小改变
        window.addEventListener('resize', this.checkMobileView)
    },
    beforeDestroy() {
        // 移除事件监听器
        window.removeEventListener('resize', this.checkMobileView)
    },
    methods: {
        loadCourse(id) {
            this.formLoading = true
            teacherCourseApi.getCourse(id).then(data => {
                const re = data.response
                this.course = re
                this.formLoading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取课程信息失败')
                this.formLoading = false
            })
        },
        statusFormatter(status) {
            return status === 1 ? '启用' : '禁用'
        },
        statusTagFormatter(status) {
            return status === 1 ? 'success' : 'danger'
        },
        handleMenuSelect(key) {
            this.activeMenu = key
            // 在移动设备上，选择菜单后关闭抽屉
            if (this.isMobileView) {
                this.showMobileMenu = false
            }
        },
        goBack() {
            this.$router.push('/teacher/course/list')
        },

        // 新增的响应式和滑动方法
        checkMobileView() {
            this.isMobileView = window.innerWidth < 768
        },

        // 触摸事件处理
        touchStart(event) {
            if (!this.isMobileView) return
            this.touchStartX = event.touches[0].clientX
            this.slideDistance = 0
            this.isSliding = true
        },
        touchMove(event) {
            if (!this.isMobileView || !this.isSliding) return
            const currentX = event.touches[0].clientX
            this.slideDistance = currentX - this.touchStartX

            // 限制滑动距离
            const maxSlide = 100
            if (Math.abs(this.slideDistance) > maxSlide) {
                this.slideDistance = this.slideDistance > 0 ? maxSlide : -maxSlide
            }

            this.slideStyle = {
                transform: `translateX(${this.slideDistance}px)`,
                transition: 'none'
            }
        },
        touchEnd() {
            if (!this.isMobileView) return
            this.touchEndX = this.touchStartX + this.slideDistance

            // 判断滑动方向和距离是否足够切换页面
            const minSlideDistance = 50
            const menuKeys = Object.keys(this.menuLabels)
            const currentIndex = menuKeys.indexOf(this.activeMenu)

            if (this.slideDistance < -minSlideDistance && currentIndex < menuKeys.length - 1) {
                // 向左滑，显示下一个页面
                this.activeMenu = menuKeys[currentIndex + 1]
            } else if (this.slideDistance > minSlideDistance && currentIndex > 0) {
                // 向右滑，显示上一个页面
                this.activeMenu = menuKeys[currentIndex - 1]
            }

            // 重置滑动状态
            this.slideStyle = {
                transform: 'translateX(0)',
                transition: 'transform 0.3s ease'
            }

            setTimeout(() => {
                this.isSliding = false
                this.slideDistance = 0
                this.slideStyle = {}
            }, 300)
        }
    }
}
</script>

<style lang="scss" scoped>
.course-hub {
    .course-info-card {
        margin-bottom: 20px;
    }

    .course-brief-info {
        display: flex;
        flex-wrap: wrap;

        .info-item {
            width: 25%;
            margin-bottom: 15px;

            strong {
                margin-right: 5px;
            }

            @media (max-width: 768px) {
                width: 50%;
            }

            @media (max-width: 480px) {
                width: 100%;
            }
        }
    }

    // 移动设备菜单栏
    .mobile-menu-bar {
        display: flex;
        align-items: center;
        background-color: #fff;
        padding: 10px 15px;
        margin-bottom: 15px;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

        .current-section {
            margin-left: 15px;
            font-weight: bold;
        }
    }

    // 移动设备抽屉菜单
    .mobile-drawer-menu {
        border-right: none;
    }

    .course-content {
        display: flex;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        min-height: 500px;
        position: relative;
        overflow: hidden;

        .course-sidebar {
            width: 200px;
            border-right: 1px solid #e6e6e6;

            .course-menu {
                height: 100%;
                border-right: none;
            }

            @media (max-width: 768px) {
                display: none;
            }
        }

        .course-main-content {
            flex: 1;
            padding: 20px;
            position: relative;

            &.sliding {
                will-change: transform;
            }
        }

        // 滑动指示器
        .slide-indicator {
            display: flex;
            justify-content: center;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 5px 0;

            .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #dcdfe6;
                margin: 0 5px;
                transition: background-color 0.3s;

                &.active {
                    background-color: #409eff;
                }
            }
        }
    }
}
</style>