<template>
    <div class="course-discussion">
        <!-- 页面头部 -->
        <div class="discussion-header">
            <el-row :gutter="20">
                <el-col :span="16">
                    <h2 class="page-title">
                        <i class="el-icon-chat-dot-round"></i>
                        课程讨论区
                    </h2>
                </el-col>
                <el-col :span="8" class="text-right">
                    <el-button type="primary" @click="showCreateDialog = true">
                        <i class="el-icon-edit"></i>
                        发起讨论
                    </el-button>
                </el-col>
            </el-row>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-card shadow="never">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                            <el-tab-pane label="全部讨论" name="all"></el-tab-pane>
                            <el-tab-pane label="置顶讨论" name="top"></el-tab-pane>
                            <el-tab-pane label="精华讨论" name="essence"></el-tab-pane>
                        </el-tabs>
                    </el-col>
                </el-row>
            </el-card>
        </div>

        <!-- 讨论列表 -->
        <el-card class="discussion-list">
            <div v-loading="loading">
                <div v-if="discussions.length === 0" class="no-data">
                    <el-empty description="暂无讨论">
                        <el-button type="primary" @click="showCreateDialog = true">
                            发起第一个讨论
                        </el-button>
                    </el-empty>
                </div>

                <div v-else>
                    <div v-for="discussion in discussions" :key="discussion.id" class="discussion-item"
                        @click="viewDiscussion(discussion)">
                        <div class="discussion-content">
                            <div class="discussion-title">
                                <div class="title-tags">
                                    <el-tag v-if="discussion.isTop" type="danger" size="mini">置顶</el-tag>
                                    <el-tag v-if="discussion.isEssence" type="warning" size="mini">精华</el-tag>
                                    <el-tag :type="discussion.creatorType === 2 ? 'success' : 'info'" size="mini">
                                        {{ discussion.creatorType === 2 ? '教师' : '学生' }}
                                    </el-tag>
                                </div>
                                <h3 class="title">{{ discussion.title }}</h3>
                            </div>

                            <div class="discussion-summary">
                                {{ getContentSummary(discussion.content) }}
                            </div>

                            <div class="discussion-meta">
                                <div class="meta-left">
                                    <span class="creator">
                                        <i class="el-icon-user"></i>
                                        {{ discussion.creatorName }}
                                    </span>
                                    <span class="create-time">
                                        <i class="el-icon-time"></i>
                                        {{ formatTime(discussion.createTime) }}
                                    </span>
                                </div>
                                <div class="meta-right">
                                    <span class="view-count">
                                        <i class="el-icon-view"></i>
                                        {{ discussion.viewCount || 0 }}
                                    </span>
                                    <span class="reply-count">
                                        <i class="el-icon-chat-dot-round"></i>
                                        {{ discussion.replyCount || 0 }}
                                    </span>
                                    <!-- 教师操作按钮 -->
                                    <div class="teacher-actions" @click.stop>
                                        <el-dropdown trigger="click" placement="bottom-end">
                                            <el-button size="mini" type="text">
                                                <i class="el-icon-more"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item @click.native="toggleTop(discussion)">
                                                    {{ discussion.isTop ? '取消置顶' : '设为置顶' }}
                                                </el-dropdown-item>
                                                <el-dropdown-item @click.native="toggleEssence(discussion)">
                                                    {{ discussion.isEssence ? '取消精华' : '设为精华' }}
                                                </el-dropdown-item>
                                                <el-dropdown-item divided @click.native="deleteDiscussion(discussion)">
                                                    删除讨论
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="total > 0">
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="pageIndex" :page-sizes="[10, 20, 50]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="total" />
            </div>
        </el-card>

        <!-- 创建讨论对话框 -->
        <el-dialog title="发起讨论" :visible.sync="showCreateDialog" width="60%" :close-on-click-modal="false">
            <el-form :model="discussionForm" :rules="discussionRules" ref="discussionForm" label-width="80px">
                <el-form-item label="讨论标题" prop="title">
                    <el-input v-model="discussionForm.title" placeholder="请输入讨论标题" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="讨论内容" prop="content">
                    <el-input type="textarea" v-model="discussionForm.content" placeholder="请详细描述您的问题或观点..." :rows="8"
                        maxlength="2000" show-word-limit />
                </el-form-item>
                <el-form-item label="设置选项">
                    <el-checkbox v-model="discussionForm.isTop">设为置顶</el-checkbox>
                    <el-checkbox v-model="discussionForm.isEssence" style="margin-left: 20px;">设为精华</el-checkbox>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="showCreateDialog = false">取 消</el-button>
                <el-button type="primary" @click="submitDiscussion" :loading="submitting">
                    发 布
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { teacherDiscussionApi } from '@/api/discussion'
import { formatDate } from '@/utils/index'

export default {
    name: 'TeacherCourseDiscussion',
    props: {
        courseId: {
            type: [String, Number],
            default: null
        }
    },
    data() {
        return {
            activeTab: 'all',
            loading: false,
            discussions: [],
            total: 0,
            pageIndex: 1,
            pageSize: 10,
            showCreateDialog: false,
            submitting: false,
            discussionForm: {
                title: '',
                content: '',
                courseId: null,
                isTop: false,
                isEssence: false
            },
            discussionRules: {
                title: [
                    { required: true, message: '请输入讨论标题', trigger: 'blur' },
                    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
                ],
                content: [
                    { required: true, message: '请输入讨论内容', trigger: 'blur' },
                    { min: 10, max: 2000, message: '内容长度在 10 到 2000 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        currentCourseId() {
            return this.courseId || this.$route.params.id
        }
    },
    created() {
        // 设置表单中的courseId
        this.discussionForm.courseId = this.currentCourseId
        this.loadDiscussions()
    },
    methods: {
        async loadDiscussions() {
            this.loading = true
            try {
                let response

                if (this.activeTab === 'top') {
                    response = await teacherDiscussionApi.getTopDiscussions(this.currentCourseId)
                    this.discussions = response.response || []
                    this.total = this.discussions.length
                } else if (this.activeTab === 'essence') {
                    response = await teacherDiscussionApi.getEssenceDiscussions(this.currentCourseId)
                    this.discussions = response.response || []
                    this.total = this.discussions.length
                } else {
                    response = await teacherDiscussionApi.getDiscussionList(this.currentCourseId, {
                        pageIndex: this.pageIndex,
                        pageSize: this.pageSize
                    })
                    this.discussions = response.response.list || []
                    this.total = response.response.total || 0
                }
            } catch (error) {
                this.$message.error('加载讨论列表失败')
                console.error(error)
            } finally {
                this.loading = false
            }
        },

        handleTabClick(tab) {
            this.activeTab = tab.name
            this.pageIndex = 1
            this.loadDiscussions()
        },

        handleSizeChange(val) {
            this.pageSize = val
            this.pageIndex = 1
            this.loadDiscussions()
        },

        handleCurrentChange(val) {
            this.pageIndex = val
            this.loadDiscussions()
        },

        viewDiscussion(discussion) {
            this.$router.push(`/teacher/course/${this.currentCourseId}/discussion/${discussion.id}`)
        },

        async submitDiscussion() {
            this.$refs.discussionForm.validate(async (valid) => {
                if (valid) {
                    this.submitting = true
                    try {
                        await teacherDiscussionApi.createDiscussion(this.discussionForm)
                        this.$message.success('讨论发布成功')
                        this.showCreateDialog = false
                        this.resetForm()
                        this.loadDiscussions()
                    } catch (error) {
                        this.$message.error('发布讨论失败')
                        console.error(error)
                    } finally {
                        this.submitting = false
                    }
                }
            })
        },

        async toggleTop(discussion) {
            try {
                await teacherDiscussionApi.toggleTop(discussion.id)
                const action = discussion.isTop ? '取消置顶' : '置顶'
                this.$message.success(`${action}成功`)
                this.loadDiscussions()
            } catch (error) {
                this.$message.error('操作失败')
                console.error(error)
            }
        },

        async toggleEssence(discussion) {
            try {
                await teacherDiscussionApi.toggleEssence(discussion.id)
                const action = discussion.isEssence ? '取消精华' : '设为精华'
                this.$message.success(`${action}成功`)
                this.loadDiscussions()
            } catch (error) {
                this.$message.error('操作失败')
                console.error(error)
            }
        },

        deleteDiscussion(discussion) {
            this.$confirm('确定要删除这个讨论吗？删除后无法恢复。', '确认删除', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await teacherDiscussionApi.deleteDiscussion(discussion.id)
                    this.$message.success('讨论删除成功')
                    this.loadDiscussions()
                } catch (error) {
                    this.$message.error('删除讨论失败')
                    console.error(error)
                }
            })
        },

        resetForm() {
            this.$refs.discussionForm.resetFields()
            this.discussionForm = {
                title: '',
                content: '',
                courseId: this.currentCourseId,
                isTop: false,
                isEssence: false
            }
        },

        getContentSummary(content) {
            if (!content) return ''
            return content.length > 100 ? content.substring(0, 100) + '...' : content
        },

        formatTime(time) {
            return formatDate(time, 'yyyy-MM-dd HH:mm')
        }
    }
}
</script>

<style scoped>
.course-discussion {
    padding: 20px;
}

.discussion-header {
    margin-bottom: 20px;
}

.page-title {
    color: #303133;
    margin: 0;
    font-size: 24px;
    font-weight: 500;
}

.page-title i {
    margin-right: 8px;
    color: #409EFF;
}

.text-right {
    text-align: right;
}

.search-bar {
    margin-bottom: 20px;
}

.discussion-list {
    min-height: 400px;
}

.no-data {
    text-align: center;
    padding: 60px 0;
}

.discussion-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 20px 0;
    cursor: pointer;
    transition: all 0.3s;
}

.discussion-item:hover {
    background-color: #F5F7FA;
    padding: 20px 15px;
    margin: 0 -15px;
    border-radius: 4px;
}

.discussion-item:last-child {
    border-bottom: none;
}

.discussion-title {
    margin-bottom: 10px;
}

.title-tags {
    margin-bottom: 8px;
}

.title-tags .el-tag {
    margin-right: 8px;
}

.title {
    margin: 0;
    font-size: 18px;
    color: #303133;
    font-weight: 500;
    line-height: 1.4;
}

.discussion-summary {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 15px;
    font-size: 14px;
}

.discussion-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #909399;
}

.meta-left span,
.meta-right span {
    margin-right: 15px;
}

.meta-left span:last-child,
.meta-right span:last-child {
    margin-right: 0;
}

.meta-left i,
.meta-right i {
    margin-right: 4px;
}

.teacher-actions {
    display: inline-block;
    margin-left: 15px;
}

.pagination-wrapper {
    text-align: center;
    margin-top: 30px;
}

.dialog-footer {
    text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .course-discussion {
        padding: 10px;
    }

    .discussion-item {
        padding: 15px 0;
    }

    .discussion-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>