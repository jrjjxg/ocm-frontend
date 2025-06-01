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

        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                    <div slot="header" class="clearfix">
                        <span>学生数量</span>
                    </div>
                    <div class="stat-value">
                        <i class="el-icon-user"></i>
                        <span>{{ stats.studentCount || 0 }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                    <div slot="header" class="clearfix">
                        <span>作业数量</span>
                    </div>
                    <div class="stat-value">
                        <i class="el-icon-s-order"></i>
                        <span>{{ stats.assignmentCount || 0 }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover" class="stat-card">
                    <div slot="header" class="clearfix">
                        <span>测验数量</span>
                    </div>
                    <div class="stat-value">
                        <i class="el-icon-s-claim"></i>
                        <span>{{ stats.examCount || 0 }}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="activity-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>最近活动</span>
            </div>
            <div v-if="activities.length === 0" class="empty-data">
                暂无活动记录
            </div>
            <el-timeline v-else>
                <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.time"
                    :type="activity.type">
                    {{ activity.content }}
                </el-timeline-item>
            </el-timeline>
        </el-card>

        <el-card class="announcement-card" style="margin-top: 20px;">
            <div slot="header" class="clearfix">
                <span>课程公告</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="handleAddAnnouncement">
                    发布公告
                </el-button>
            </div>
            <div v-if="announcements.length === 0" class="empty-data">
                暂无公告
            </div>
            <div v-else>
                <div v-for="(announcement, index) in announcements" :key="index" class="announcement-item">
                    <div class="announcement-title">
                        <h4>{{ announcement.title }}</h4>
                        <span class="announcement-time">{{ announcement.time }}</span>
                    </div>
                    <div class="announcement-content">{{ announcement.content }}</div>
                </div>
            </div>
        </el-card>

        <!-- 添加公告对话框 -->
        <el-dialog title="发布公告" :visible.sync="dialogVisible" width="50%">
            <el-form :model="announcementForm" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="announcementForm.title"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input type="textarea" :rows="4" v-model="announcementForm.content"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAnnouncement">确 定</el-button>
            </span>
        </el-dialog>
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
            stats: {
                studentCount: 0,
                assignmentCount: 0,
                examCount: 0
            },
            activities: [],
            announcements: [],
            dialogVisible: false,
            announcementForm: {
                title: '',
                content: ''
            },
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
        this.fetchCourseStats()
        this.fetchActivities()
        this.fetchAnnouncements()
        this.fetchCourseInfo()
    },
    methods: {
        fetchCourseStats() {
            // 这里应该调用API获取课程统计数据
            // 暂时使用模拟数据
            this.stats = {
                studentCount: 35,
                assignmentCount: 5,
                examCount: 3
            }
        },
        fetchActivities() {
            // 这里应该调用API获取课程活动
            // 暂时使用模拟数据
            this.activities = [
                {
                    content: '发布了新作业《第五章习题》',
                    time: '2023-05-30 14:30',
                    type: 'primary'
                },
                {
                    content: '更新了课程资料《高等数学公式表》',
                    time: '2023-05-28 09:15',
                    type: 'success'
                },
                {
                    content: '发布了期中考试',
                    time: '2023-05-25 16:00',
                    type: 'warning'
                }
            ]
        },
        fetchAnnouncements() {
            // 这里应该调用API获取课程公告
            // 暂时使用模拟数据
            this.announcements = [
                {
                    title: '关于期末考试安排的通知',
                    content: '各位同学，本课程期末考试将于6月30日下午2:00在教学楼301教室进行，请务必携带学生证和考试用具准时参加。',
                    time: '2023-05-29 10:00'
                },
                {
                    title: '第五章作业截止日期延长',
                    content: '由于部分同学反映时间紧张，第五章作业的截止日期延长至6月5日晚上23:59。',
                    time: '2023-05-27 15:30'
                }
            ]
        },
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
        handleAddAnnouncement() {
            this.dialogVisible = true
            this.announcementForm = {
                title: '',
                content: ''
            }
        },
        submitAnnouncement() {
            // 实际应用中应调用API提交公告
            if (!this.announcementForm.title || !this.announcementForm.content) {
                this.$message.warning('标题和内容不能为空')
                return
            }

            // 模拟添加
            const newAnnouncement = {
                title: this.announcementForm.title,
                content: this.announcementForm.content,
                time: new Date().toLocaleString()
            }
            this.announcements.unshift(newAnnouncement)
            this.dialogVisible = false
            this.$message.success('公告发布成功')
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
    .stat-card {
        .stat-value {
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            i {
                margin-right: 10px;
                font-size: 30px;
                color: #409EFF;
            }
        }
    }

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

    .announcement-item {
        padding: 10px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
            border-bottom: none;
        }

        .announcement-title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
            }

            .announcement-time {
                color: #909399;
                font-size: 12px;
            }
        }

        .announcement-content {
            margin-top: 10px;
            color: #606266;
        }
    }
}
</style>