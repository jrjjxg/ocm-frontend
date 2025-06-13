<template>
    <div class="discussion-detail">
        <div v-loading="loading">
            <!-- 返回按钮 -->
            <div class="back-button">
                <el-button @click="goBack" icon="el-icon-arrow-left">
                    返回讨论列表
                </el-button>
            </div>

            <!-- 讨论主题 -->
            <el-card class="discussion-card" v-if="discussion">
                <div class="discussion-header">
                    <div class="title-section">
                        <div class="title-tags">
                            <el-tag v-if="discussion.isTop" type="danger" size="small">置顶</el-tag>
                            <el-tag v-if="discussion.isEssence" type="warning" size="small">精华</el-tag>
                            <el-tag :type="discussion.creatorType === 2 ? 'success' : 'info'" size="small">
                                {{ discussion.creatorType === 2 ? '教师' : '学生' }}
                            </el-tag>
                        </div>
                        <h1 class="discussion-title">{{ discussion.title }}</h1>
                    </div>

                    <div class="discussion-meta">
                        <div class="meta-info">
                            <span class="creator">
                                <i class="el-icon-user"></i>
                                {{ discussion.creatorName }}
                            </span>
                            <span class="create-time">
                                <i class="el-icon-time"></i>
                                {{ formatTime(discussion.createTime) }}
                            </span>
                            <span class="view-count">
                                <i class="el-icon-view"></i>
                                浏览 {{ discussion.viewCount || 0 }}
                            </span>
                            <span class="reply-count">
                                <i class="el-icon-chat-dot-round"></i>
                                回复 {{ discussion.replyCount || 0 }}
                            </span>
                        </div>

                        <div class="action-buttons" v-if="isOwner">
                            <el-button size="mini" @click="showEditDialog = true">编辑</el-button>
                            <el-button size="mini" type="danger" @click="deleteDiscussion">删除</el-button>
                        </div>
                    </div>
                </div>

                <div class="discussion-content">
                    <div class="content-text" v-html="formatContent(discussion.content)"></div>
                </div>
            </el-card>

            <!-- 回复列表 -->
            <el-card class="replies-card">
                <div slot="header">
                    <span class="replies-title">
                        <i class="el-icon-chat-dot-round"></i>
                        全部回复 ({{ total }})
                    </span>
                </div>

                <!-- 发表回复 -->
                <div class="reply-form">
                    <el-input type="textarea" v-model="replyContent" placeholder="写下你的回复..." :rows="4" maxlength="1000"
                        show-word-limit />
                    <div class="reply-actions">
                        <el-button type="primary" @click="submitReply" :disabled="!replyContent.trim()"
                            :loading="submittingReply">
                            发表回复
                        </el-button>
                    </div>
                </div>

                <!-- 回复列表 -->
                <div class="replies-list" v-if="replies.length > 0">
                    <div v-for="reply in replies" :key="reply.id" class="reply-item">
                        <div class="reply-content">
                            <div class="reply-header">
                                <div class="replier-info">
                                    <span class="replier-name">{{ reply.replierName }}</span>
                                    <el-tag :type="reply.replierType === 2 ? 'success' : 'info'" size="mini">
                                        {{ reply.replierType === 2 ? '教师' : '学生' }}
                                    </el-tag>
                                    <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                                </div>

                                <div class="reply-actions" v-if="isReplyOwner(reply)">
                                    <el-button size="mini" type="text" @click="deleteReply(reply)">删除</el-button>
                                </div>
                            </div>

                            <div class="reply-text">
                                <div v-if="reply.parentId" class="parent-reply">
                                    回复 @{{ reply.parentReplierName }}:
                                </div>
                                <div v-html="formatContent(reply.content)"></div>
                            </div>

                            <div class="reply-footer">
                                <el-button size="mini" type="text" @click="replyToReply(reply)">
                                    <i class="el-icon-chat-dot-round"></i>
                                    回复
                                </el-button>
                            </div>
                        </div>

                        <!-- 子回复 -->
                        <div v-if="reply.childReplies && reply.childReplies.length > 0" class="child-replies">
                            <div v-for="childReply in reply.childReplies" :key="childReply.id" class="child-reply">
                                <div class="reply-header">
                                    <div class="replier-info">
                                        <span class="replier-name">{{ childReply.replierName }}</span>
                                        <el-tag :type="childReply.replierType === 2 ? 'success' : 'info'" size="mini">
                                            {{ childReply.replierType === 2 ? '教师' : '学生' }}
                                        </el-tag>
                                        <span class="reply-time">{{ formatTime(childReply.createTime) }}</span>
                                    </div>

                                    <div class="reply-actions" v-if="isReplyOwner(childReply)">
                                        <el-button size="mini" type="text"
                                            @click="deleteReply(childReply)">删除</el-button>
                                    </div>
                                </div>

                                <div class="reply-text">
                                    <div class="parent-reply">
                                        回复 @{{ childReply.parentReplierName }}:
                                    </div>
                                    <div v-html="formatContent(childReply.content)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="!loadingReplies" class="no-replies">
                    <el-empty description="暂无回复">
                        <div class="empty-tip">成为第一个回复的人吧！</div>
                    </el-empty>
                </div>

                <!-- 回复分页 -->
                <div class="pagination-wrapper" v-if="total > pageSize">
                    <el-pagination @current-change="handlePageChange" :current-page="pageIndex" :page-size="pageSize"
                        layout="prev, pager, next" :total="total" />
                </div>
            </el-card>
        </div>

        <!-- 编辑讨论对话框 -->
        <el-dialog title="编辑讨论" :visible.sync="showEditDialog" width="60%" :close-on-click-modal="false">
            <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="80px">
                <el-form-item label="讨论标题" prop="title">
                    <el-input v-model="editForm.title" placeholder="请输入讨论标题" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="讨论内容" prop="content">
                    <el-input type="textarea" v-model="editForm.content" placeholder="请详细描述您的问题或观点..." :rows="8"
                        maxlength="2000" show-word-limit />
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="showEditDialog = false">取 消</el-button>
                <el-button type="primary" @click="updateDiscussion" :loading="updatingDiscussion">
                    保 存
                </el-button>
            </div>
        </el-dialog>

        <!-- 回复对话框 -->
        <el-dialog :title="replyDialogTitle" :visible.sync="showReplyDialog" width="50%" :close-on-click-modal="false">
            <el-input type="textarea" v-model="replyDialogContent" :placeholder="replyDialogPlaceholder" :rows="6"
                maxlength="1000" show-word-limit />

            <div slot="footer" class="dialog-footer">
                <el-button @click="showReplyDialog = false">取 消</el-button>
                <el-button type="primary" @click="submitDialogReply" :loading="submittingDialogReply">
                    发表回复
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { studentDiscussionApi } from '@/api/discussion'
import { formatDate } from '@/utils/index'

export default {
    name: 'StudentDiscussionDetail',
    data() {
        return {
            courseId: null,
            discussionId: null,
            loading: false,
            loadingReplies: false,
            discussion: null,
            replies: [],
            total: 0,
            pageIndex: 1,
            pageSize: 20,
            replyContent: '',
            submittingReply: false,
            showEditDialog: false,
            updatingDiscussion: false,
            showReplyDialog: false,
            submittingDialogReply: false,
            replyDialogContent: '',
            currentReplyTarget: null,
            editForm: {
                title: '',
                content: ''
            },
            editRules: {
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
        isOwner() {
            const user = this.$store.getters.user
            return this.discussion && user && this.discussion.creatorId === user.id
        },
        replyDialogTitle() {
            return this.currentReplyTarget
                ? `回复 @${this.currentReplyTarget.replierName}`
                : '发表回复'
        },
        replyDialogPlaceholder() {
            return this.currentReplyTarget
                ? `回复 @${this.currentReplyTarget.replierName}...`
                : '写下你的回复...'
        }
    },
    created() {
        // 从路由参数中获取课程ID和讨论ID
        // 路由格式: /student/course/:courseId/discussion/:discussionId
        // 父路由参数通过$route.params获取，子路由参数也通过$route.params获取

        // 正确解析路由参数
        const pathParts = this.$route.path.split('/')
        const courseIndex = pathParts.indexOf('course')
        const discussionIndex = pathParts.indexOf('discussion')

        if (courseIndex !== -1 && courseIndex + 1 < pathParts.length) {
            this.courseId = pathParts[courseIndex + 1]
        }
        if (discussionIndex !== -1 && discussionIndex + 1 < pathParts.length) {
            this.discussionId = pathParts[discussionIndex + 1]
        }

        // 备用方案：直接从路由参数获取
        if (!this.discussionId) {
            this.discussionId = this.$route.params.discussionId
        }

        console.log('Course ID:', this.courseId, 'Discussion ID:', this.discussionId)

        this.loadDiscussion()
        this.loadReplies()
    },
    methods: {
        async loadDiscussion() {
            this.loading = true
            try {
                // 使用与教师端一致的API调用方式
                const response = await studentDiscussionApi.getDiscussionDetail(this.discussionId)
                // 与教师端保持一致，使用response.response格式
                this.discussion = response.response

                // 初始化编辑表单
                this.editForm = {
                    title: this.discussion.title,
                    content: this.discussion.content
                }
            } catch (error) {
                this.$message.error('加载讨论详情失败')
                console.error(error)
            } finally {
                this.loading = false
            }
        },

        async loadReplies() {
            this.loadingReplies = true
            try {
                // 使用与教师端一致的API调用方式
                const response = await studentDiscussionApi.getReplies(this.discussionId, {
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize
                })
                // 与教师端保持一致，使用response.response格式
                this.replies = response.response.list || []
                this.total = response.response.total || 0
            } catch (error) {
                this.$message.error('加载回复列表失败')
                console.error(error)
            } finally {
                this.loadingReplies = false
            }
        },

        async submitReply() {
            if (!this.replyContent.trim()) {
                this.$message.warning('请输入回复内容')
                return
            }

            this.submittingReply = true
            try {
                await studentDiscussionApi.createReply({
                    discussionId: this.discussionId,
                    content: this.replyContent.trim()
                })
                this.$message.success('回复发表成功')
                this.replyContent = ''
                this.loadReplies()
                this.loadDiscussion() // 更新回复数
            } catch (error) {
                this.$message.error('发表回复失败')
                console.error(error)
            } finally {
                this.submittingReply = false
            }
        },

        replyToReply(reply) {
            this.currentReplyTarget = reply
            this.replyDialogContent = ''
            this.showReplyDialog = true
        },

        async submitDialogReply() {
            if (!this.replyDialogContent.trim()) {
                this.$message.warning('请输入回复内容')
                return
            }

            this.submittingDialogReply = true
            try {
                await studentDiscussionApi.createReply({
                    discussionId: this.discussionId,
                    content: this.replyDialogContent.trim(),
                    parentId: this.currentReplyTarget ? this.currentReplyTarget.id : null
                })
                this.$message.success('回复发表成功')
                this.showReplyDialog = false
                this.currentReplyTarget = null
                this.replyDialogContent = ''
                this.loadReplies()
                this.loadDiscussion() // 更新回复数
            } catch (error) {
                this.$message.error('发表回复失败')
                console.error(error)
            } finally {
                this.submittingDialogReply = false
            }
        },

        async updateDiscussion() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    this.updatingDiscussion = true
                    try {
                        await studentDiscussionApi.updateDiscussion(this.discussionId, this.editForm)
                        this.$message.success('讨论更新成功')
                        this.showEditDialog = false
                        this.loadDiscussion()
                    } catch (error) {
                        this.$message.error('更新讨论失败')
                        console.error(error)
                    } finally {
                        this.updatingDiscussion = false
                    }
                }
            })
        },

        async deleteDiscussion() {
            this.$confirm('确定要删除这个讨论吗？删除后无法恢复。', '确认删除', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await studentDiscussionApi.deleteDiscussion(this.discussionId)
                    this.$message.success('讨论删除成功')
                    this.goBack()
                } catch (error) {
                    this.$message.error('删除讨论失败')
                    console.error(error)
                }
            })
        },

        async deleteReply(reply) {
            this.$confirm('确定要删除这条回复吗？', '确认删除', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await studentDiscussionApi.deleteReply(reply.id)
                    this.$message.success('回复删除成功')
                    this.loadReplies()
                    this.loadDiscussion() // 更新回复数
                } catch (error) {
                    this.$message.error('删除回复失败')
                    console.error(error)
                }
            })
        },

        isReplyOwner(reply) {
            const user = this.$store.getters.user
            return reply && user && reply.replierId === user.id
        },

        handlePageChange(page) {
            this.pageIndex = page
            this.loadReplies()
        },

        goBack() {
            this.$router.go(-1)
        },

        formatTime(time) {
            return formatDate(time, 'yyyy-MM-dd HH:mm')
        },

        formatContent(content) {
            // 简单的内容格式化，保留换行
            return content.replace(/\n/g, '<br>')
        }
    }
}
</script>

<style scoped>
.discussion-detail {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

.back-button {
    margin-bottom: 20px;
}

.discussion-card {
    margin-bottom: 20px;
}

.discussion-header {
    border-bottom: 1px solid #EBEEF5;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.title-section {
    margin-bottom: 15px;
}

.title-tags {
    margin-bottom: 10px;
}

.title-tags .el-tag {
    margin-right: 8px;
}

.discussion-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    line-height: 1.4;
}

.discussion-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.meta-info {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 14px;
    color: #909399;
}

.meta-info i {
    margin-right: 4px;
}

.discussion-content {
    line-height: 1.8;
    color: #606266;
    font-size: 16px;
}

.content-text {
    white-space: pre-wrap;
    word-break: break-word;
}

.replies-card {
    margin-top: 20px;
}

.replies-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
}

.reply-form {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #FAFAFA;
    border-radius: 8px;
}

.reply-actions {
    text-align: right;
    margin-top: 15px;
}

.replies-list {
    margin-top: 20px;
}

.reply-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 20px 0;
}

.reply-item:last-child {
    border-bottom: none;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.replier-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.replier-name {
    font-weight: 500;
    color: #303133;
}

.reply-time {
    color: #909399;
    font-size: 13px;
}

.reply-text {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 10px;
}

.parent-reply {
    color: #909399;
    font-size: 14px;
    margin-bottom: 5px;
}

.reply-footer {
    text-align: right;
}

.child-replies {
    margin-left: 40px;
    margin-top: 15px;
    padding-left: 20px;
    border-left: 2px solid #EBEEF5;
}

.child-reply {
    padding: 15px 0;
    border-bottom: 1px solid #F5F7FA;
}

.child-reply:last-child {
    border-bottom: none;
}

.no-replies {
    text-align: center;
    padding: 40px 0;
}

.empty-tip {
    color: #909399;
    margin-top: 10px;
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
    .discussion-detail {
        padding: 10px;
    }

    .discussion-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .meta-info {
        flex-wrap: wrap;
        gap: 10px;
    }

    .child-replies {
        margin-left: 20px;
    }
}
</style>