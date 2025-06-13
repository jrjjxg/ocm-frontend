<template>
    <div class="homework-statistics">
        <!-- 页面头部 -->
        <div class="stats-header">
            <div class="header-left">
                <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
                <h1>作业统计</h1>
            </div>
            <div class="header-actions">
                <el-button icon="el-icon-refresh" @click="loadStatistics">刷新</el-button>
                <el-button type="primary" icon="el-icon-download">导出数据</el-button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="8" animated />
        </div>

        <!-- 统计内容 -->
        <div v-else class="stats-content">
            <!-- 概览卡片 -->
            <el-row :gutter="20" class="overview-cards">
                <el-col :span="6">
                    <el-card class="stats-card" shadow="hover">
                        <div class="stats-item">
                            <div class="stats-icon submit">
                                <i class="el-icon-user"></i>
                            </div>
                            <div class="stats-info">
                                <div class="stats-number">{{ statistics.submitCount || 0 }}</div>
                                <div class="stats-label">已提交人数</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stats-card" shadow="hover">
                        <div class="stats-item">
                            <div class="stats-icon average">
                                <i class="el-icon-data-line"></i>
                            </div>
                            <div class="stats-info">
                                <div class="stats-number">{{ statistics.averageScore || 0 }}</div>
                                <div class="stats-label">平均分</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stats-card" shadow="hover">
                        <div class="stats-item">
                            <div class="stats-icon highest">
                                <i class="el-icon-trophy"></i>
                            </div>
                            <div class="stats-info">
                                <div class="stats-number">{{ statistics.highestScore || 0 }}</div>
                                <div class="stats-label">最高分</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stats-card" shadow="hover">
                        <div class="stats-item">
                            <div class="stats-icon lowest">
                                <i class="el-icon-bottom"></i>
                            </div>
                            <div class="stats-info">
                                <div class="stats-number">{{ statistics.lowestScore || 0 }}</div>
                                <div class="stats-label">最低分</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 分数分布图表 -->
            <el-card class="chart-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-pie-chart"></i>
                        分数分布
                    </span>
                </div>
                <div class="chart-content">
                    <div class="score-distribution">
                        <div v-for="range in scoreRanges" :key="range.label" class="score-range">
                            <div class="range-label">{{ range.label }}</div>
                            <div class="range-bar">
                                <div class="range-fill" :style="{ width: range.percentage + '%' }"></div>
                            </div>
                            <div class="range-count">{{ range.count }}人</div>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 学生提交情况 -->
            <el-card class="submissions-card" shadow="never">
                <div slot="header">
                    <span class="card-title">
                        <i class="el-icon-user-solid"></i>
                        学生提交情况
                    </span>
                    <el-input v-model="searchKeyword" placeholder="搜索学生姓名" prefix-icon="el-icon-search"
                        style="width: 200px" @input="handleSearch" />
                </div>

                <el-table :data="filteredSubmissions" style="width: 100%" stripe>
                    <el-table-column prop="studentName" label="学生姓名" width="150" />
                    <el-table-column prop="studentNumber" label="学号" width="120" />
                    <el-table-column label="提交状态" width="100" align="center">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.submitted ? 'success' : 'danger'" size="small">
                                {{ scope.row.submitted ? '已提交' : '未提交' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="得分" width="80" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.submitted">{{ scope.row.score || '-' }}</span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="submitTime" label="提交时间" width="180">
                        <template slot-scope="scope">
                            <span v-if="scope.row.submitTime">
                                {{ scope.row.submitTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="timeTaken" label="用时" width="80" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.timeTaken">{{ scope.row.timeTaken }}分钟</span>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.submitted" type="text" size="small"
                                @click="handleViewAnswers(scope.row)">
                                查看答题
                            </el-button>
                            <span v-else class="no-action">-</span>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
                        layout="total, prev, pager, next" :total="totalStudents" />
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import { homeworkStatistics } from '@/api/teacher/homework'

export default {
    name: 'HomeworkStatistics',
    data() {
        return {
            loading: true,
            searchKeyword: '',
            currentPage: 1,
            pageSize: 20,
            statistics: {},
            submissions: [],
            totalStudents: 0
        }
    },
    computed: {
        filteredSubmissions() {
            if (!this.searchKeyword) {
                return this.submissions
            }
            return this.submissions.filter(item =>
                item.studentName.includes(this.searchKeyword) ||
                item.studentNumber.includes(this.searchKeyword)
            )
        },
        scoreRanges() {
            const totalCount = this.statistics.submitCount || 0
            if (totalCount === 0) return []

            const ranges = [
                { label: '90-100分', count: this.statistics.scoreRange90_100 || 0 },
                { label: '80-89分', count: this.statistics.scoreRange80_89 || 0 },
                { label: '70-79分', count: this.statistics.scoreRange70_79 || 0 },
                { label: '60-69分', count: this.statistics.scoreRange60_69 || 0 },
                { label: '60分以下', count: this.statistics.scoreRangeBelow60 || 0 }
            ]

            return ranges.map(range => ({
                ...range,
                percentage: totalCount > 0 ? Math.round((range.count / totalCount) * 100) : 0
            }))
        }
    },
    created() {
        this.loadStatistics()
    },
    methods: {
        async loadStatistics() {
            try {
                this.loading = true
                const homeworkId = this.$route.params.id

                const response = await homeworkStatistics(homeworkId)
                this.statistics = response.data?.statistics || {}
                this.submissions = response.data?.submissions || []
                this.totalStudents = response.data?.total || 0

            } catch (error) {
                this.$message.error('加载统计数据失败')
                // 模拟数据用于演示
                this.mockData()
            } finally {
                this.loading = false
            }
        },

        mockData() {
            this.statistics = {
                submitCount: 45,
                averageScore: 78.5,
                highestScore: 98,
                lowestScore: 45,
                scoreRange90_100: 8,
                scoreRange80_89: 15,
                scoreRange70_79: 12,
                scoreRange60_69: 7,
                scoreRangeBelow60: 3
            }

            this.submissions = Array.from({ length: 50 }, (_, index) => ({
                id: index + 1,
                studentName: `学生${index + 1}`,
                studentNumber: `2023${String(index + 1).padStart(4, '0')}`,
                submitted: index < 45,
                score: index < 45 ? Math.floor(Math.random() * 60) + 40 : null,
                submitTime: index < 45 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
                timeTaken: index < 45 ? Math.floor(Math.random() * 60) + 10 : null
            }))

            this.totalStudents = 50
        },

        handleBack() {
            this.$router.go(-1)
        },

        handleSearch() {
            // 搜索逻辑已在计算属性中实现
        },

        handlePageChange(page) {
            this.currentPage = page
            // 如果有后端分页，在这里调用API
        },

        handleViewAnswers(student) {
            this.$router.push(`/teacher/homework/grade/${this.$route.params.id}/student/${student.id}`)
        }
    }
}
</script>

<style lang="scss" scoped>
.homework-statistics {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
        display: flex;
        align-items: center;
        gap: 15px;

        h1 {
            margin: 0;
            color: #303133;
            font-size: 24px;
            font-weight: 600;
        }
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }
}

.loading-container {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-content {
    .overview-cards {
        margin-bottom: 20px;
    }

    .stats-card {
        .stats-item {
            display: flex;
            align-items: center;
            padding: 10px 0;

            .stats-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;

                i {
                    font-size: 24px;
                    color: white;
                }

                &.submit {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                &.average {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }

                &.highest {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                &.lowest {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                }
            }

            .stats-info {
                flex: 1;

                .stats-number {
                    font-size: 28px;
                    font-weight: bold;
                    color: #303133;
                    line-height: 1;
                    margin-bottom: 5px;
                }

                .stats-label {
                    color: #909399;
                    font-size: 14px;
                }
            }
        }
    }

    .chart-card,
    .submissions-card {
        margin-bottom: 20px;

        .card-title {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: bold;
            color: #303133;

            i {
                margin-right: 8px;
                color: #409EFF;
            }
        }
    }

    .score-distribution {
        padding: 20px 0;

        .score-range {
            display: flex;
            align-items: center;
            margin-bottom: 15px;

            .range-label {
                width: 80px;
                color: #606266;
                font-size: 14px;
            }

            .range-bar {
                flex: 1;
                height: 20px;
                background-color: #f5f7fa;
                border-radius: 10px;
                overflow: hidden;
                margin: 0 15px;

                .range-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #409EFF, #67C23A);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }
            }

            .range-count {
                width: 50px;
                text-align: right;
                color: #303133;
                font-weight: 500;
            }
        }
    }

    .pagination-container {
        display: flex;
        justify-content: center;
        padding: 20px 0;
    }

    .no-action {
        color: #C0C4CC;
    }
}

@media (max-width: 768px) {
    .homework-statistics {
        padding: 15px;
    }

    .stats-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .overview-cards {
        .el-col {
            margin-bottom: 15px;
        }
    }
}
</style>