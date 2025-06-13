<template>
    <div class="homework-list">
        <!-- 页面头部 -->
        <div class="list-header">
            <div class="header-left">
                <h1>我的作业</h1>
                <p class="header-desc">创建和管理您的课程作业</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
                    创建作业
                </el-button>
            </div>
        </div>

        <!-- 搜索筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <div class="filter-container">
                <div class="filter-left">
                    <el-input v-model="listQuery.title" placeholder="搜索作业标题" prefix-icon="el-icon-search"
                        style="width: 250px; margin-right: 15px;" @keyup.enter.native="handleFilter" />
                    <el-select v-model="listQuery.status" placeholder="作业状态" clearable
                        style="width: 150px; margin-right: 15px;">
                        <el-option label="草稿" value="1" />
                        <el-option label="已发布" value="2" />
                        <el-option label="已结束" value="3" />
                    </el-select>
                    <el-button type="primary" icon="el-icon-search" @click="handleFilter">
                        搜索
                    </el-button>
                </div>
                <div class="filter-right">
                    <el-radio-group v-model="viewMode" @change="handleViewModeChange">
                        <el-radio-button label="card">卡片视图</el-radio-button>
                        <el-radio-button label="list">列表视图</el-radio-button>
                    </el-radio-group>
                </div>
            </div>
        </el-card>

        <!-- 作业状态选项卡 -->
        <div class="homework-tabs">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="全部" name="all">
                    <template #label>
                        <span class="custom-tab">
                            <i class="el-icon-document"></i>
                            全部 ({{ allHomework.length }})
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="进行中" name="ongoing">
                    <template #label>
                        <span class="custom-tab active">
                            <i class="el-icon-time"></i>
                            进行中 ({{ ongoingHomework.length }})
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="草稿" name="draft">
                    <template #label>
                        <span class="custom-tab draft">
                            <i class="el-icon-edit-outline"></i>
                            草稿 ({{ draftHomework.length }})
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="已结束" name="ended">
                    <template #label>
                        <span class="custom-tab ended">
                            <i class="el-icon-circle-check"></i>
                            已结束 ({{ endedHomework.length }})
                        </span>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </div>

        <!-- 加载状态 -->
        <div v-if="listLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
            <el-skeleton :rows="3" animated />
            <el-skeleton :rows="3" animated />
        </div>

        <!-- 空状态 -->
        <div v-else-if="getCurrentHomeworkList().length === 0" class="empty-container">
            <el-empty description="暂无作业">
                <el-button type="primary" @click="handleCreate">创建第一个作业</el-button>
            </el-empty>
        </div>

        <!-- 作业列表 -->
        <div v-else class="homework-content">
            <!-- 卡片视图 -->
            <div v-if="viewMode === 'card'" class="homework-grid">
                <div v-for="homework in getCurrentHomeworkList()" :key="homework.id" class="homework-card"
                    @click="handleHomeworkDetail(homework)">
                    <div class="card-header">
                        <div class="homework-title">{{ homework.title }}</div>
                        <el-dropdown @command="handleHomeworkAction" trigger="click" @click.native.stop>
                            <span class="dropdown-trigger">
                                <i class="el-icon-more"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item :command="{ action: 'edit', homework }">
                                    <i class="el-icon-edit"></i>编辑
                                </el-dropdown-item>
                                <el-dropdown-item v-if="homework.status === 1"
                                    :command="{ action: 'publish', homework }">
                                    <i class="el-icon-upload"></i>发布
                                </el-dropdown-item>
                                <el-dropdown-item v-if="homework.status === 2" :command="{ action: 'end', homework }">
                                    <i class="el-icon-finished"></i>结束
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ action: 'stats', homework }">
                                    <i class="el-icon-data-analysis"></i>统计
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ action: 'grade', homework }">
                                    <i class="el-icon-edit-outline"></i>批改
                                </el-dropdown-item>
                                <el-dropdown-item v-if="homework.status === 1" :command="{ action: 'delete', homework }"
                                    divided>
                                    <i class="el-icon-delete" style="color: #F56C6C;"></i>
                                    <span style="color: #F56C6C;">删除</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>

                    <div class="card-content">
                        <div class="homework-meta">
                            <div class="meta-item">
                                <i class="el-icon-notebook-1"></i>
                                <span>{{ homework.courseName || '未指定课程' }}</span>
                            </div>
                            <div class="meta-item">
                                <i class="el-icon-trophy"></i>
                                <span>{{ homework.totalScore / 10 }}分</span>
                            </div>
                        </div>

                        <div class="homework-time">
                            <div class="time-item" v-if="homework.startTime">
                                <span class="time-label">开始:</span>
                                <span class="time-value">{{ homework.startTime | parseTime('{m}-{d} {h}:{i}') }}</span>
                            </div>
                            <div class="time-item" v-if="homework.endTime">
                                <span class="time-label">截止:</span>
                                <span class="time-value">{{ homework.endTime | parseTime('{m}-{d} {h}:{i}') }}</span>
                            </div>
                        </div>

                        <div class="homework-progress" v-if="homework.status === 2">
                            <div class="progress-info">
                                <span>提交进度: {{ homework.submitCount || 0 }}/{{ homework.totalStudents || 0 }}</span>
                                <span class="progress-percent">{{ getSubmitPercent(homework) }}%</span>
                            </div>
                            <el-progress :percentage="getSubmitPercent(homework)" :show-text="false"
                                :stroke-width="6" />
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="homework-status">
                            <el-tag :type="getStatusTagType(homework.status)" size="small">
                                {{ getStatusText(homework.status) }}
                            </el-tag>
                        </div>
                        <div class="card-actions">
                            <el-button type="text" size="small" @click.stop="handleEdit(homework)">
                                编辑
                            </el-button>
                            <el-button type="text" size="small" @click.stop="handleStatistics(homework)">
                                统计
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 列表视图 -->
            <div v-else class="homework-table">
                <el-table :data="getCurrentHomeworkList()" style="width: 100%" stripe>
                    <el-table-column prop="title" label="作业标题" min-width="200">
                        <template slot-scope="scope">
                            <div class="table-title" @click="handleEdit(scope.row)">
                                <span class="title-text">{{ scope.row.title }}</span>
                                <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
                                    {{ getStatusText(scope.row.status) }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="courseName" label="课程" width="150" />

                    <el-table-column label="总分" width="80" align="center">
                        <template slot-scope="scope">
                            {{ scope.row.totalScore / 10 }}
                        </template>
                    </el-table-column>

                    <el-table-column label="开始时间" width="160" align="center">
                        <template slot-scope="scope">
                            {{ scope.row.startTime | parseTime('{m}-{d} {h}:{i}') }}
                        </template>
                    </el-table-column>

                    <el-table-column label="结束时间" width="160" align="center">
                        <template slot-scope="scope">
                            {{ scope.row.endTime | parseTime('{m}-{d} {h}:{i}') }}
                        </template>
                    </el-table-column>

                    <el-table-column label="提交情况" width="120" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status === 2">
                                {{ scope.row.submitCount || 0 }}/{{ scope.row.totalStudents || 0 }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" align="center" width="250">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">
                                编辑
                            </el-button>
                            <el-button v-if="scope.row.status === 1" type="success" size="mini"
                                @click="handlePublish(scope.row)">
                                发布
                            </el-button>
                            <el-button v-if="scope.row.status === 2" type="warning" size="mini"
                                @click="handleEnd(scope.row)">
                                结束
                            </el-button>
                            <el-button type="info" size="mini" @click="handleStatistics(scope.row)">
                                统计
                            </el-button>
                            <el-button v-if="scope.row.status === 1" type="danger" size="mini"
                                @click="handleDelete(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <!-- 分页 -->
        <div v-if="!listLoading && getCurrentHomeworkList().length > 0" class="pagination-container">
            <el-pagination @current-change="handlePageChange" :current-page="listQuery.pageIndex"
                :page-size="listQuery.pageSize" layout="total, prev, pager, next, sizes" :total="total" />
        </div>
    </div>
</template>

<script>
import { homeworkPage, homeworkDelete, homeworkPublish, homeworkEnd } from '@/api/teacher/homework'

export default {
    name: 'HomeworkList',
    data() {
        return {
            list: [],
            total: 0,
            listLoading: true,
            activeTab: 'all',
            viewMode: 'card',
            listQuery: {
                pageIndex: 1,
                pageSize: 20,
                title: '',
                status: ''
            }
        }
    },
    computed: {
        allHomework() {
            return this.list
        },
        ongoingHomework() {
            return this.list.filter(item => item.status === 2)
        },
        draftHomework() {
            return this.list.filter(item => item.status === 1)
        },
        endedHomework() {
            return this.list.filter(item => item.status === 3)
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            homeworkPage(this.listQuery).then(response => {
                this.list = response.response?.list || []
                this.total = response.response?.total || 0
                this.listLoading = false
            }).catch(() => {
                this.listLoading = false
            })
        },

        getCurrentHomeworkList() {
            switch (this.activeTab) {
                case 'ongoing':
                    return this.ongoingHomework
                case 'draft':
                    return this.draftHomework
                case 'ended':
                    return this.endedHomework
                default:
                    return this.allHomework
            }
        },

        handleTabClick(tab) {
            this.activeTab = tab.name
        },

        handleViewModeChange() {
            // 视图模式切换
        },

        handleFilter() {
            this.listQuery.pageIndex = 1
            this.getList()
        },

        handlePageChange(page) {
            this.listQuery.pageIndex = page
            this.getList()
        },

        handleCreate() {
            this.$router.push('/teacher/homework/create')
        },

        handleEdit(row) {
            this.$router.push(`/teacher/homework/edit/${row.id}`)
        },

        handleHomeworkDetail(homework) {
            this.$router.push(`/teacher/homework/detail/${homework.id}`)
        },

        handleHomeworkAction({ action, homework }) {
            switch (action) {
                case 'edit':
                    this.handleEdit(homework)
                    break
                case 'publish':
                    this.handlePublish(homework)
                    break
                case 'end':
                    this.handleEnd(homework)
                    break
                case 'stats':
                    this.handleStatistics(homework)
                    break
                case 'grade':
                    this.handleGrade(homework)
                    break
                case 'delete':
                    this.handleDelete(homework)
                    break
            }
        },

        handlePublish(row) {
            this.$confirm('确定要发布这个作业吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                homeworkPublish(row.id).then(() => {
                    this.$message.success('发布成功')
                    this.getList()
                })
            }).catch(() => { })
        },

        handleEnd(row) {
            this.$confirm('确定要结束这个作业吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                homeworkEnd(row.id).then(() => {
                    this.$message.success('作业已结束')
                    this.getList()
                })
            }).catch(() => { })
        },

        handleDelete(row) {
            this.$confirm('确定要删除这个作业吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                homeworkDelete(row.id).then(() => {
                    this.$message.success('删除成功')
                    this.getList()
                })
            }).catch(() => { })
        },

        handleStatistics(row) {
            this.$router.push(`/teacher/homework/statistics/${row.id}`)
        },

        handleGrade(row) {
            this.$router.push(`/teacher/homework/grade/${row.id}`)
        },

        getStatusText(status) {
            const statusMap = {
                1: '草稿',
                2: '进行中',
                3: '已结束'
            }
            return statusMap[status] || '未知'
        },

        getStatusTagType(status) {
            const typeMap = {
                1: 'info',
                2: 'success',
                3: 'warning'
            }
            return typeMap[status] || 'info'
        },

        getSubmitPercent(homework) {
            if (!homework.totalStudents || homework.totalStudents === 0) return 0
            return Math.round((homework.submitCount || 0) / homework.totalStudents * 100)
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-list {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;

    .header-left {
        h1 {
            margin: 0 0 5px 0;
            color: #303133;
            font-size: 28px;
            font-weight: 600;
        }

        .header-desc {
            margin: 0;
            color: #606266;
            font-size: 14px;
        }
    }

    .header-actions {
        .el-button {
            padding: 12px 24px;
            font-size: 14px;
        }
    }
}

.filter-card {
    margin-bottom: 20px;

    .filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .filter-left {
            display: flex;
            align-items: center;
        }
    }
}

.homework-tabs {
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);

    .custom-tab {
        display: flex;
        align-items: center;
        gap: 5px;

        i {
            font-size: 14px;
        }

        &.active i {
            color: #67C23A;
        }

        &.draft i {
            color: #909399;
        }

        &.ended i {
            color: #E6A23C;
        }
    }
}

.loading-container,
.empty-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.homework-content {
    margin-bottom: 20px;
}

.homework-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;

    .homework-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.15);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;

            .homework-title {
                font-size: 18px;
                font-weight: 600;
                color: #303133;
                line-height: 1.4;
                flex: 1;
                margin-right: 10px;
            }

            .dropdown-trigger {
                color: #C0C4CC;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: all 0.3s;

                &:hover {
                    color: #409EFF;
                    background-color: #f5f7fa;
                }
            }
        }

        .card-content {
            margin-bottom: 15px;

            .homework-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 12px;

                .meta-item {
                    display: flex;
                    align-items: center;
                    color: #606266;
                    font-size: 14px;

                    i {
                        margin-right: 5px;
                        color: #409EFF;
                    }
                }
            }

            .homework-time {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;

                .time-item {
                    font-size: 13px;

                    .time-label {
                        color: #909399;
                        margin-right: 5px;
                    }

                    .time-value {
                        color: #606266;
                        font-weight: 500;
                    }
                }
            }

            .homework-progress {
                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: #606266;

                    .progress-percent {
                        font-weight: 500;
                        color: #409EFF;
                    }
                }
            }
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .card-actions {
                .el-button {
                    padding: 0;
                    font-size: 13px;
                    margin-left: 15px;
                }
            }
        }
    }
}

.homework-table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .table-title {
        cursor: pointer;

        .title-text {
            color: #409EFF;
            margin-right: 10px;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .homework-list {
        padding: 15px;
    }

    .list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .filter-container {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .homework-grid {
        grid-template-columns: 1fr;
    }
}
</style>