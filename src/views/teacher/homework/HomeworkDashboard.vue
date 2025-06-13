<template>
    <div class="homework-dashboard">
        <!-- 顶部统计卡片 -->
        <div class="stats-container">
            <el-row :gutter="20">
                <el-col :xs="12" :sm="6">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.totalHomework }}</div>
                            <div class="stat-label">总作业数</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <div class="stat-card active">
                        <div class="stat-icon">
                            <i class="el-icon-time"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.ongoingHomework }}</div>
                            <div class="stat-label">进行中</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <div class="stat-card pending">
                        <div class="stat-icon">
                            <i class="el-icon-document-checked"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.pendingGrade }}</div>
                            <div class="stat-label">待批改</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <div class="stat-card completed">
                        <div class="stat-icon">
                            <i class="el-icon-circle-check"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.completedHomework }}</div>
                            <div class="stat-label">已完成</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
            <h3 class="section-title">
                <i class="el-icon-lightning"></i>
                快速操作
            </h3>
            <div class="action-cards">
                <div class="action-card" @click="handleCreateHomework">
                    <div class="action-icon create">
                        <i class="el-icon-plus"></i>
                    </div>
                    <div class="action-content">
                        <div class="action-title">创建作业</div>
                        <div class="action-desc">新建课程作业</div>
                    </div>
                </div>
                <div class="action-card" @click="handleManageQuestions">
                    <div class="action-icon manage">
                        <i class="el-icon-s-order"></i>
                    </div>
                    <div class="action-content">
                        <div class="action-title">题库管理</div>
                        <div class="action-desc">管理题目资源</div>
                    </div>
                </div>
                <div class="action-card" @click="handleGradeHomework">
                    <div class="action-icon grade">
                        <i class="el-icon-edit"></i>
                    </div>
                    <div class="action-content">
                        <div class="action-title">批改作业</div>
                        <div class="action-desc">查看待批改作业</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 最近作业 -->
        <div class="recent-homework">
            <div class="section-header">
                <h3 class="section-title">
                    <i class="el-icon-document"></i>
                    最近作业
                </h3>
                <el-button type="text" @click="handleViewAll">查看全部</el-button>
            </div>

            <div class="homework-tabs">
                <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                    <el-tab-pane label="进行中" name="ongoing">
                        <div class="homework-grid">
                            <div v-for="homework in ongoingHomework" :key="homework.id" class="homework-card"
                                @click="handleHomeworkDetail(homework)">
                                <div class="homework-header">
                                    <div class="homework-title">{{ homework.title }}</div>
                                    <el-dropdown @command="handleHomeworkAction">
                                        <span class="dropdown-trigger">
                                            <i class="el-icon-more"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item
                                                :command="{ action: 'edit', homework }">编辑</el-dropdown-item>
                                            <el-dropdown-item
                                                :command="{ action: 'end', homework }">结束</el-dropdown-item>
                                            <el-dropdown-item
                                                :command="{ action: 'stats', homework }">统计</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                                <div class="homework-info">
                                    <div class="info-row">
                                        <span class="label">课程：</span>
                                        <span class="value">{{ homework.courseName }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">截止：</span>
                                        <span class="value time">{{ homework.endTime | parseTime('{m}-{d} {h}:{i}')
                                        }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">提交：</span>
                                        <span class="value">{{ homework.submitCount || 0 }}/{{ homework.totalStudents ||
                                            0 }}</span>
                                    </div>
                                </div>
                                <div class="homework-status">
                                    <el-tag type="success" size="small">进行中</el-tag>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="待批改" name="pending">
                        <div class="homework-grid">
                            <div v-for="homework in pendingHomework" :key="homework.id" class="homework-card"
                                @click="handleGradeDetail(homework)">
                                <div class="homework-header">
                                    <div class="homework-title">{{ homework.title }}</div>
                                    <el-dropdown @command="handleHomeworkAction">
                                        <span class="dropdown-trigger">
                                            <i class="el-icon-more"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item
                                                :command="{ action: 'grade', homework }">批改</el-dropdown-item>
                                            <el-dropdown-item
                                                :command="{ action: 'stats', homework }">统计</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                                <div class="homework-info">
                                    <div class="info-row">
                                        <span class="label">课程：</span>
                                        <span class="value">{{ homework.courseName }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">已提交：</span>
                                        <span class="value">{{ homework.submitCount || 0 }}份</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">待批改：</span>
                                        <span class="value pending-count">{{ homework.pendingCount || 0 }}份</span>
                                    </div>
                                </div>
                                <div class="homework-status">
                                    <el-tag type="warning" size="small">待批改</el-tag>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="已完成" name="completed">
                        <div class="homework-grid">
                            <div v-for="homework in completedHomework" :key="homework.id" class="homework-card"
                                @click="handleHomeworkDetail(homework)">
                                <div class="homework-header">
                                    <div class="homework-title">{{ homework.title }}</div>
                                    <el-dropdown @command="handleHomeworkAction">
                                        <span class="dropdown-trigger">
                                            <i class="el-icon-more"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item
                                                :command="{ action: 'stats', homework }">统计</el-dropdown-item>
                                            <el-dropdown-item
                                                :command="{ action: 'export', homework }">导出</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                                <div class="homework-info">
                                    <div class="info-row">
                                        <span class="label">课程：</span>
                                        <span class="value">{{ homework.courseName }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">平均分：</span>
                                        <span class="value score">{{ homework.avgScore || '--' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">完成率：</span>
                                        <span class="value">{{ homework.completionRate || '--' }}%</span>
                                    </div>
                                </div>
                                <div class="homework-status">
                                    <el-tag type="info" size="small">已完成</el-tag>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script>
import { homeworkPage, homeworkEnd, homeworkDelete, homeworkDashboardStatistics, homeworkPendingPage } from '@/api/teacher/homework'

export default {
    name: 'HomeworkDashboard',
    data() {
        return {
            activeTab: 'ongoing',
            stats: {
                totalHomework: 0,
                ongoingHomework: 0,
                pendingGrade: 0,
                completedHomework: 0
            },
            ongoingHomework: [],
            pendingHomework: [],
            completedHomework: []
        }
    },
    created() {
        this.loadDashboardData()
    },
    methods: {
        async loadDashboardData() {
            try {
                // 加载统计数据
                await this.loadStats()
                // 加载各类作业
                await this.loadHomeworkByStatus()
            } catch (error) {
                this.$message.error('加载数据失败')
            }
        },

        async loadStats() {
            try {
                const response = await homeworkDashboardStatistics()
                this.stats = response.response || {
                    totalHomework: 0,
                    ongoingHomework: 0,
                    pendingGrade: 0,
                    completedHomework: 0
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
                // 使用默认值
                this.stats = {
                    totalHomework: 0,
                    ongoingHomework: 0,
                    pendingGrade: 0,
                    completedHomework: 0
                }
            }
        },

        async loadHomeworkByStatus() {
            const params = { pageIndex: 1, pageSize: 6 }

            // 加载进行中的作业
            const ongoingResponse = await homeworkPage({ ...params, status: 2 })
            this.ongoingHomework = ongoingResponse.response?.list || []

            // 加载待批改的作业
            try {
                const pendingResponse = await homeworkPendingPage(params)
                this.pendingHomework = pendingResponse.response?.list || []
            } catch (error) {
                console.error('加载待批改作业失败:', error)
                this.pendingHomework = []
            }

            // 加载已完成的作业
            const completedResponse = await homeworkPage({ ...params, status: 3 })
            this.completedHomework = completedResponse.response?.list || []
        },

        handleTabClick(tab) {
            this.activeTab = tab.name
        },

        handleCreateHomework() {
            this.$router.push('/teacher/homework/create')
        },

        handleManageQuestions() {
            this.$router.push('/teacher/question/list')
        },

        handleGradeHomework() {
            this.$router.push('/teacher/homework/grade')
        },

        handleViewAll() {
            this.$router.push('/teacher/homework/list')
        },

        handleHomeworkDetail(homework) {
            this.$router.push(`/teacher/homework/detail/${homework.id}`)
        },

        handleGradeDetail(homework) {
            this.$router.push(`/teacher/homework/grade/${homework.id}`)
        },

        handleHomeworkAction({ action, homework }) {
            switch (action) {
                case 'edit':
                    this.$router.push(`/teacher/homework/edit/${homework.id}`)
                    break
                case 'end':
                    this.handleEndHomework(homework)
                    break
                case 'stats':
                    this.$router.push(`/teacher/homework/statistics/${homework.id}`)
                    break
                case 'grade':
                    this.$router.push(`/teacher/homework/grade/${homework.id}`)
                    break
                case 'export':
                    this.handleExportHomework(homework)
                    break
            }
        },

        async handleEndHomework(homework) {
            try {
                await this.$confirm('确定要结束这个作业吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                await homeworkEnd(homework.id)
                this.$message.success('作业已结束')
                this.loadDashboardData()
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('操作失败')
                }
            }
        },

        handleExportHomework(homework) {
            // 导出成绩逻辑
            this.$message.info('导出功能开发中...')
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-dashboard {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.stats-container {
    margin-bottom: 30px;

    .stat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        transition: all 0.3s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin-right: 15px;
        }

        .stat-content {
            .stat-number {
                font-size: 28px;
                font-weight: bold;
                color: #303133;
                line-height: 1;
            }

            .stat-label {
                font-size: 14px;
                color: #909399;
                margin-top: 5px;
            }
        }

        &.active .stat-icon {
            background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
        }

        &.pending .stat-icon {
            background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
        }

        &.completed .stat-icon {
            background: linear-gradient(135deg, #409EFF 0%, #73b9ff 100%);
        }
    }
}

.quick-actions {
    margin-bottom: 30px;

    .section-title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 15px;

        i {
            margin-right: 8px;
            color: #409EFF;
        }
    }

    .action-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;

        .action-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
            }

            .action-icon {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: white;
                margin-right: 15px;

                &.create {
                    background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
                }

                &.manage {
                    background: linear-gradient(135deg, #409EFF 0%, #73b9ff 100%);
                }

                &.grade {
                    background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
                }
            }

            .action-content {
                .action-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #303133;
                    line-height: 1;
                }

                .action-desc {
                    font-size: 12px;
                    color: #909399;
                    margin-top: 5px;
                }
            }
        }
    }
}

.recent-homework {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
            display: flex;
            align-items: center;
            font-size: 18px;
            font-weight: bold;
            color: #303133;
            margin: 0;

            i {
                margin-right: 8px;
                color: #409EFF;
            }
        }
    }

    .homework-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 15px;

        .homework-card {
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                border-color: #409EFF;
                box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.2);
            }

            .homework-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;

                .homework-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #303133;
                    flex: 1;
                    line-height: 1.4;
                }

                .dropdown-trigger {
                    color: #909399;
                    cursor: pointer;
                    padding: 5px;

                    &:hover {
                        color: #409EFF;
                    }
                }
            }

            .homework-info {
                margin-bottom: 10px;

                .info-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                    font-size: 14px;

                    .label {
                        color: #909399;
                        margin-right: 5px;
                        min-width: 50px;
                    }

                    .value {
                        color: #606266;

                        &.time {
                            color: #E6A23C;
                            font-weight: 500;
                        }

                        &.score {
                            color: #67C23A;
                            font-weight: 500;
                        }

                        &.pending-count {
                            color: #F56C6C;
                            font-weight: 500;
                        }
                    }
                }
            }

            .homework-status {
                display: flex;
                justify-content: flex-end;
            }
        }
    }
}

@media (max-width: 768px) {
    .homework-dashboard {
        padding: 15px;
    }

    .stats-container .stat-card {
        padding: 15px;

        .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 20px;
        }

        .stat-content .stat-number {
            font-size: 24px;
        }
    }

    .action-cards {
        grid-template-columns: 1fr;
    }

    .homework-grid {
        grid-template-columns: 1fr;
    }
}
</style>
