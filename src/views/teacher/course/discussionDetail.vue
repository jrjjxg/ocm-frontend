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

                        <!-- 教师管理操作 -->
                        <div class="action-buttons">
                            <el-button v-if="isOwner" size="mini" @click="showEditDialog = true">编辑</el-button>
                            <el-button size="mini" @click="toggleTop" :type="discussion.isTop ? 'warning' : 'success'">
                                {{ discussion.isTop ? '取消置顶' : '设为置顶' }}
                            </el-button>
                            <el-button size="mini" @click="toggleEssence"
                                :type="discussion.isEssence ? 'warning' : 'primary'">
                                {{ discussion.isEssence ? '取消精华' : '设为精华' }}
                            </el-button>
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

                                <!-- 教师可以删除任何回复 -->
                                <div class="reply-actions">
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

                                    <!-- 教师可以删除任何回复 -->
                                    <div class="reply-actions">
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
import { teacherDiscussionApi } from '@/api/discussion'
import { formatDate } from '@/utils/index'

export default {
    name: 'TeacherDiscussionDetail',
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
            pageSize: 10,
            replyContent: '',
            submittingReply: false,
            showEditDialog: false,
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
            },
            updatingDiscussion: false,
            showReplyDialog: false,
            replyDialogContent: '',
            replyDialogTitle: '',
            replyDialogPlaceholder: '',
            replyTarget: null,
            submittingDialogReply: false
        }
    },
    computed: {
        isOwner() {
            const userInfo = this.$store.getters.userInfo
            return this.discussion && userInfo && this.discussion.creatorId === userInfo.id
        }
    },
    created() {
        this.courseId = this.$route.params.courseId
        this.discussionId = this.$route.params.discussionId
        this.loadDiscussion()
        this.loadReplies()
    },
    methods: {
        async loadDiscussion() {
            this.loading = true
            try {
                const response = await teacherDiscussionApi.getDiscussionDetail(this.discussionId)
                this.discussion = response.response
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
                const response = await teacherDiscussionApi.getReplies(this.discussionId, {
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize
                })
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
                await teacherDiscussionApi.createReply({
                    discussionId: this.discussionId,
                    content: this.replyContent,
                    parentId: null
                })
                this.$message.success('回复发表成功')
                this.replyContent = ''
                this.loadReplies()
                this.loadDiscussion() // 刷新回复数量
            } catch (error) {
                this.$message.error('发表回复失败')
                console.error(error)
            } finally {
                this.submittingReply = false
            }
        },

        async updateDiscussion() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    this.updatingDiscussion = true
                    try {
                        await teacherDiscussionApi.updateDiscussion(this.discussionId, this.editForm)
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
                    await teacherDiscussionApi.deleteDiscussion(this.discussionId)
                    this.$message.success('讨论删除成功')
                    this.goBack()
                } catch (error) {
                    this.$message.error('删除讨论失败')
                    console.error(error)
                }
            })
        },

        async toggleTop() {
            try {
                await teacherDiscussionApi.toggleTop(this.discussionId)
                const action = this.discussion.isTop ? '取消置顶' : '置顶'
                this.$message.success(`${action}成功`)
                this.loadDiscussion()
            } catch (error) {
                this.$message.error('操作失败')
                console.error(error)
            }
        },

        async toggleEssence() {
            try {
                await teacherDiscussionApi.toggleEssence(this.discussionId)
                const action = this.discussion.isEssence ? '取消精华' : '设为精华'
                this.$message.success(`${action}成功`)
                this.loadDiscussion()
            } catch (error) {
                this.$message.error('操作失败')
                console.error(error)
            }
        },

        async deleteReply(reply) {
            this.$confirm('确定要删除这条回复吗？', '确认删除', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await teacherDiscussionApi.deleteReply(reply.id)
                    this.$message.success('回复删除成功')
                    this.loadReplies()
                    this.loadDiscussion() // 刷新回复数量
                } catch (error) {
                    this.$message.error('删除回复失败')
                    console.error(error)
                }
            })
        },

        replyToReply(reply) {
            this.replyTarget = reply
            this.replyDialogTitle = `回复 @${reply.replierName}`
            this.replyDialogPlaceholder = `回复 @${reply.replierName}...`
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
                await teacherDiscussionApi.createReply({
                    discussionId: this.discussionId,
                    content: this.replyDialogContent,
                    parentId: this.replyTarget.id
                })
                this.$message.success('回复发表成功')
                this.showReplyDialog = false
                this.loadReplies()
                this.loadDiscussion() // 刷新回复数量
            } catch (error) {
                this.$message.error('发表回复失败')
                console.error(error)
            } finally {
                this.submittingDialogReply = false
            }
        },

        handlePageChange(page) {
            this.pageIndex = page
            this.loadReplies()
        },

        goBack() {
            this.$router.push(`/teacher/course/${this.courseId}/discussion`)
        },

        formatContent(content) {
            if (!content) return ''
            // 将换行符转换为 <br> 标签
            return content.replace(/\n/g, '<br>')
        },

        formatTime(time) {
            return formatDate(time, 'yyyy-MM-dd HH:mm')
        }
    }
}
</script>

<style scoped>
.discussion-detail {
    padding: 20px;
}

.back-button {
    margin-bottom: 20px;
}

.discussion-card {
    margin-bottom: 20px;
}

.discussion-header {
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
    color: #303133;
    margin: 0;
    line-height: 1.4;
}

.discussion-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #909399;
    font-size: 14px;
}

.meta-info span {
    margin-right: 20px;
}

.meta-info i {
    margin-right: 4px;
}

.action-buttons .el-button {
    margin-left: 8px;
}

.discussion-content {
    padding: 20px 0;
    border-top: 1px solid #EBEEF5;
}

.content-text {
    line-height: 1.8;
    color: #303133;
    font-size: 15px;
}

.replies-card {
    margin-top: 20px;
}

.replies-title {
    font-size: 16px;
    font-weight: 500;
}

.reply-form {
    margin-bottom: 30px;
}

.reply-actions {
    text-align: right;
    margin-top: 10px;
}

.replies-list {
    margin-top: 20px;
}

.reply-item {
    border-bottom: 1px solid #F0F0F0;
    padding: 20px 0;
}

.reply-item:last-child {
    border-bottom: none;
}

.reply-content {
    margin-bottom: 15px;
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
    gap: 8px;
    font-size: 14px;
}

.replier-name {
    font-weight: 500;
    color: #303133;
}

.reply-time {
    color: #909399;
    font-size: 12px;
}

.reply-text {
    line-height: 1.6;
    color: #303133;
    margin-bottom: 10px;
}

.parent-reply {
    color: #909399;
    font-size: 13px;
    margin-bottom: 5px;
}

.reply-footer {
    font-size: 12px;
}

.child-replies {
    margin-left: 40px;
    margin-top: 15px;
}

.child-reply {
    background: #F8F9FA;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 10px;
}

.child-reply:last-child {
    margin-bottom: 0;
}

.no-replies {
    text-align: center;
    padding: 40px 0;
}

.empty-tip {
    color: #909399;
    font-size: 14px;
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

    .child-replies {
        margin-left: 20px;
    }
}
</style>