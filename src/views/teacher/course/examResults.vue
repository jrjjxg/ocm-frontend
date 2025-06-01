<template>
    <div class="exam-results-container">
        <div class="page-header">
            <h2>{{ exam ? exam.title + ' - 成绩统计' : '成绩统计' }}</h2>
            <div>
                <el-button type="primary" @click="exportResults">导出成绩</el-button>
                <el-button @click="goBack">返回</el-button>
            </div>
        </div>

        <el-card class="stats-card" v-loading="statsLoading">
            <div class="stats-header">
                <h3>测验概况</h3>
            </div>
            <div class="stats-content" v-if="statistics">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <div class="stat-item">
                            <div class="stat-title">总人数</div>
                            <div class="stat-value">{{ statistics.totalCount }}</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="stat-item">
                            <div class="stat-title">已交卷</div>
                            <div class="stat-value">{{ statistics.submitCount }}</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="stat-item">
                            <div class="stat-title">平均分</div>
                            <div class="stat-value">{{ statistics.averageScore.toFixed(1) }}</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="stat-item">
                            <div class="stat-title">最高分</div>
                            <div class="stat-value">{{ statistics.maxScore }}</div>
                        </div>
                    </el-col>
                </el-row>

                <div class="chart-container">
                    <div id="score-distribution-chart" style="width: 100%; height: 300px;"></div>
                </div>
            </div>
        </el-card>

        <el-tabs v-model="activeTab" class="results-tabs">
            <el-tab-pane label="学生成绩" name="scores">
                <el-form :model="queryParam" ref="queryForm" :inline="true">
                    <el-form-item label="学生姓名：">
                        <el-input v-model="queryParam.studentName" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="分数范围：">
                        <el-input-number v-model="queryParam.scoreFrom" :min="0" :max="100"
                            placeholder="最低分"></el-input-number>
                        <span class="range-separator">-</span>
                        <el-input-number v-model="queryParam.scoreTo" :min="0" :max="100"
                            placeholder="最高分"></el-input-number>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="searchAnswers">查询</el-button>
                        <el-button @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>

                <el-table v-loading="loading" :data="answers" border style="width: 100%">
                    <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
                    <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
                    <el-table-column prop="score" label="得分" width="100"></el-table-column>
                    <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
                    <el-table-column prop="answerCompleted" label="完成状态" width="100">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.answerCompleted ? 'success' : 'warning'">
                                {{ scope.row.answerCompleted ? '已完成' : '未完成' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="120">
                        <template slot-scope="scope">
                            <el-tag :type="getStatusType(scope.row.status)">
                                {{ getStatusText(scope.row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" @click="viewAnswer(scope.row)">查看答卷</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex"
                    :limit.sync="queryParam.pageSize" @pagination="fetchAnswers" />
            </el-tab-pane>
            <el-tab-pane label="题目分析" name="questions">
                <div class="question-analysis" v-loading="questionsLoading">
                    <div v-if="questionStats.length > 0">
                        <div v-for="(question, index) in questionStats" :key="index" class="question-stat-item">
                            <div class="question-info">
                                <h4>{{ index + 1 }}. {{ question.title }}</h4>
                                <div class="question-meta">
                                    <span class="question-type">{{ formatQuestionType(question.questionType) }}</span>
                                    <span class="question-score">满分: {{ question.score }}分</span>
                                </div>
                            </div>
                            <div class="question-stat-data">
                                <div class="stat-row">
                                    <span class="stat-label">平均得分:</span>
                                    <span class="stat-value">{{ question.averageScore.toFixed(1) }}分</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">正确率:</span>
                                    <span class="stat-value">{{ (question.correctRate * 100).toFixed(1) }}%</span>
                                </div>
                                <div class="stat-row">
                                    <el-progress :percentage="question.correctRate * 100"
                                        :format="percentFormat"></el-progress>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-data">
                        暂无题目分析数据
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import * as echarts from 'echarts'
import Pagination from '@/components/Pagination'
import teacherExamApi from '@/api/teacherExam'
import { mapState } from 'vuex'

export default {
    components: { Pagination },
    props: {
        courseId: {
            type: [Number, String],
            required: true
        },
        examId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            activeTab: 'scores',
            loading: false,
            statsLoading: false,
            questionsLoading: false,
            exam: null,
            statistics: null,
            answers: [],
            total: 0,
            questionStats: [],
            scoreChart: null,
            queryParam: {
                studentName: '',
                scoreFrom: null,
                scoreTo: null,
                pageIndex: 1,
                pageSize: 10
            }
        }
    },
    computed: {
        ...mapState('enumItem', {
            questionTypeEnum: state => state.exam.question.typeEnum
        })
    },
    created() {
        this.fetchExamInfo()
        this.fetchStatistics()
        this.fetchAnswers()
    },
    mounted() {
        window.addEventListener('resize', this.resizeChart)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeChart)
        if (this.scoreChart) {
            this.scoreChart.dispose()
        }
    },
    methods: {
        fetchExamInfo() {
            teacherExamApi.getExam(this.courseId, this.examId).then(res => {
                if (res.code === 1) {
                    this.exam = res.response
                } else {
                    this.$message.error(res.message || '获取测验信息失败')
                }
            }).catch(error => {
                console.error('获取测验信息出错:', error)
                this.$message.error('网络错误，请稍后重试')
            })
        },
        fetchStatistics() {
            this.statsLoading = true
            teacherExamApi.getStatistics(this.courseId, this.examId).then(res => {
                if (res.code === 1) {
                    this.statistics = res.response
                    this.questionStats = res.response.questionStats || []
                    this.$nextTick(() => {
                        this.initScoreChart()
                    })
                } else {
                    this.$message.error(res.message || '获取统计数据失败')
                }
                this.statsLoading = false
                this.questionsLoading = false
            }).catch(error => {
                console.error('获取统计数据出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.statsLoading = false
                this.questionsLoading = false
            })
        },
        initScoreChart() {
            if (!this.statistics || !this.statistics.scoreDistribution) return

            const chartDom = document.getElementById('score-distribution-chart')
            if (!chartDom) return

            this.scoreChart = echarts.init(chartDom)

            const option = {
                title: {
                    text: '分数分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: this.statistics.scoreDistribution.map(item => item.scoreRange)
                },
                yAxis: {
                    type: 'value',
                    name: '人数'
                },
                series: [
                    {
                        name: '人数',
                        type: 'bar',
                        data: this.statistics.scoreDistribution.map(item => item.count),
                        itemStyle: {
                            color: function (params) {
                                const colorList = [
                                    '#F56C6C', '#F56C6C', '#E6A23C', '#E6A23C',
                                    '#67C23A', '#67C23A', '#409EFF', '#409EFF'
                                ];
                                return colorList[params.dataIndex];
                            }
                        }
                    }
                ]
            };

            this.scoreChart.setOption(option)
        },
        resizeChart() {
            if (this.scoreChart) {
                this.scoreChart.resize()
            }
        },
        searchAnswers() {
            this.queryParam.pageIndex = 1
            this.fetchAnswers()
        },
        resetQuery() {
            this.queryParam = {
                studentName: '',
                scoreFrom: null,
                scoreTo: null,
                pageIndex: 1,
                pageSize: 10
            }
            this.fetchAnswers()
        },
        fetchAnswers() {
            this.loading = true
            teacherExamApi.getExamAnswers(this.courseId, this.examId, this.queryParam).then(res => {
                if (res.code === 1) {
                    const data = res.response
                    this.answers = data.list
                    this.total = data.total
                } else {
                    this.$message.error(res.message || '获取答卷列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error('获取答卷列表出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.loading = false
            })
        },
        getStatusType(status) {
            switch (status) {
                case 1: return 'success' // 已批改
                case 2: return 'warning' // 待批改
                case 0: return 'info'    // 未提交
                default: return 'info'
            }
        },
        getStatusText(status) {
            switch (status) {
                case 1: return '已批改'
                case 2: return '待批改'
                case 0: return '未提交'
                default: return '未知'
            }
        },
        formatQuestionType(type) {
            const found = this.questionTypeEnum.find(item => item.key === type)
            return found ? found.value : '未知类型'
        },
        percentFormat(percent) {
            return percent.toFixed(1) + '%'
        },
        viewAnswer(row) {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exam/${this.examId}/answer/${row.id}`
            })
        },
        exportResults() {
            // 调用导出成绩API
            this.$message.success('成绩导出功能即将完成')
        },
        goBack() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/exams`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.exam-results-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .stats-card {
        margin-bottom: 20px;

        .stats-header {
            margin-bottom: 20px;

            h3 {
                margin: 0;
                border-left: 4px solid #409EFF;
                padding-left: 10px;
            }
        }

        .stats-content {
            .stat-item {
                text-align: center;
                padding: 15px;
                background-color: #f5f7fa;
                border-radius: 4px;

                .stat-title {
                    font-size: 14px;
                    color: #606266;
                    margin-bottom: 10px;
                }

                .stat-value {
                    font-size: 24px;
                    color: #303133;
                    font-weight: bold;
                }
            }

            .chart-container {
                margin-top: 30px;
            }
        }
    }

    .results-tabs {
        margin-top: 20px;
    }

    .range-separator {
        margin: 0 10px;
    }

    .question-analysis {
        .question-stat-item {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #EBEEF5;
            border-radius: 4px;

            .question-info {
                margin-bottom: 15px;

                h4 {
                    margin-top: 0;
                    margin-bottom: 10px;
                }

                .question-meta {
                    display: flex;
                    gap: 15px;

                    .question-type {
                        background-color: #E6A23C;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                    }

                    .question-score {
                        color: #606266;
                    }
                }
            }

            .question-stat-data {
                .stat-row {
                    margin-bottom: 10px;

                    .stat-label {
                        display: inline-block;
                        width: 80px;
                        color: #606266;
                    }

                    .stat-value {
                        font-weight: bold;
                    }
                }
            }
        }

        .no-data {
            text-align: center;
            padding: 30px;
            color: #909399;
        }
    }
}
</style>