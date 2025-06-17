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
                    <!-- 显示试卷题目详情 -->
                    <div v-if="paper && paper.titleItems && paper.titleItems.length > 0">
                        <div v-for="(titleItem, titleIndex) in paper.titleItems" :key="titleIndex"
                            class="title-section">
                            <h3 class="section-title">{{ titleItem.name }}</h3>
                            <div v-for="(question, qIndex) in titleItem.questionItems" :key="qIndex"
                                class="question-item">
                                <div class="question-header">
                                    <h4 class="question-title">
                                        {{ titleIndex + 1 }}.{{ qIndex + 1 }} {{ question.title }}
                                        <span class="question-score">({{ question.score }}分)</span>
                                    </h4>
                                    <span class="question-type-tag">{{ formatQuestionType(question.questionType)
                                    }}</span>
                                </div>

                                <!-- 选择题选项 -->
                                <div v-if="question.questionType === 1 || question.questionType === 2"
                                    class="question-options">
                                    <div v-for="(item, itemIndex) in question.questionItemObjects" :key="itemIndex"
                                        class="option-item">
                                        <span class="option-prefix">{{ String.fromCharCode(65 + itemIndex) }}.</span>
                                        <span>{{ item.content }}</span>
                                        <el-tag v-if="item.correct" type="success" size="mini"
                                            style="margin-left: 10px">正确答案</el-tag>
                                    </div>
                                </div>

                                <!-- 判断题 -->
                                <div v-else-if="question.questionType === 3" class="question-judge">
                                    <el-tag :type="question.correct === 'true' ? 'success' : 'danger'" size="small">
                                        正确答案: {{ question.correct === 'true' ? '正确' : '错误' }}
                                    </el-tag>
                                </div>

                                <!-- 填空题 -->
                                <div v-else-if="question.questionType === 4" class="question-fill">
                                    <div class="correct-answer">
                                        <span>参考答案: </span>
                                        <el-tag type="success" size="small">{{ question.correct }}</el-tag>
                                    </div>
                                </div>

                                <!-- 简答题 -->
                                <div v-else-if="question.questionType === 5" class="question-essay">
                                    <div class="answer-analysis">
                                        <p><strong>答案要点:</strong></p>
                                        <div class="answer-content">{{ question.correct || '请教师根据学生答案酌情给分' }}</div>
                                    </div>
                                </div>

                                <!-- 题目统计信息（如果有的话） -->
                                <div v-if="getQuestionStats(question.id)" class="question-stats">
                                    <div class="stats-row">
                                        <span class="stat-label">平均得分:</span>
                                        <span class="stat-value">{{
                                            getQuestionStats(question.id).averageScore.toFixed(1) }}分</span>
                                        <span class="stat-label" style="margin-left: 20px;">正确率:</span>
                                        <span class="stat-value">{{ (getQuestionStats(question.id).correctRate *
                                            100).toFixed(1)
                                        }}%</span>
                                    </div>
                                    <el-progress :percentage="getQuestionStats(question.id).correctRate * 100"
                                        :format="percentFormat" style="margin-top: 5px;">
                                    </el-progress>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 如果没有试卷题目信息，显示统计数据 -->
                    <div v-else-if="questionStats.length > 0">
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
        }
    },

    data() {
        return {
            activeTab: 'scores',
            loading: false,
            statsLoading: false,
            questionsLoading: false,
            exam: null,
            isExamReady: false,
            paper: null,
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
        examId() {
            return this.$route.params.examId
        },
        ...mapState('enumItem', {
            questionTypeEnum: state => state.exam.question.typeEnum
        })
    },
    watch: {
        '$route.params.examId': {
            immediate: true,
            handler(newExamId) {
                if (newExamId && newExamId !== 'undefined') {
                    // 路由参数变化时重新加载数据
                    this.fetchExamInfo().then(() => {
                        if (this.isExamReady) {
                            this.fetchStatistics()
                            this.fetchAnswers()
                        }
                    })
                }
            }
        }
    },
    created() {
        // watch已经处理了数据加载，这里只做错误检查
        if (!this.examId || this.examId === 'undefined') {
            this.$message.error('测验ID参数错误')
            this.goBack()
        }
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
            if (!this.examId || this.examId === 'undefined') {
                this.$message.error('测验ID参数错误')
                return Promise.reject(new Error('测验ID参数错误'))
            }
            this.isExamReady = false
            return teacherExamApi.getExam(this.courseId, this.examId).then(res => {
                if (res.code === 1) {
                    this.exam = res.response
                    this.isExamReady = true
                    // 获取试卷题目信息
                    this.fetchPaperInfo()
                } else {
                    this.$message.error(res.message || '获取测验信息失败')
                }
            }).catch(error => {
                console.error('获取测验信息出错:', error)
                this.$message.error('网络错误，请稍后重试')
            })
        },
        fetchPaperInfo() {
            if (!this.isExamReady || !this.examId) return

            teacherExamApi.getExamPaper(this.courseId, this.examId).then(res => {
                if (res.code === 1) {
                    this.paper = res.response
                } else {
                    console.warn('获取试卷题目信息失败:', res.message)
                }
            }).catch(error => {
                console.error('获取试卷题目信息出错:', error)
            })
        },
        fetchStatistics() {
            if (!this.isExamReady) return;
            if (!this.examId || this.examId === 'undefined') {
                this.$message.error('测验ID参数错误')
                return
            }
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
            if (!this.isExamReady) return;
            if (!this.examId || this.examId === 'undefined') {
                this.$message.error('测验ID参数错误')
                return
            }
            
            console.log('开始获取答卷列表，参数:', {
                courseId: this.courseId,
                examId: this.examId,
                queryParam: this.queryParam
            })
            
            this.loading = true
            teacherExamApi.getExamAnswers(this.courseId, this.examId, this.queryParam).then(res => {
                console.log('获取答卷列表响应:', res)
                
                if (res.code === 1) {
                    const data = res.response
                    this.answers = data.list || []
                    this.total = data.total || 0
                    
                    console.log('答卷数据处理结果:', {
                        answersCount: this.answers.length,
                        total: this.total,
                        answers: this.answers
                    })
                    
                    if (this.answers.length === 0) {
                        console.warn('答卷列表为空，可能原因：1.无学生提交答卷 2.数据查询问题 3.权限问题')
                    }
                } else {
                    console.error('获取答卷列表失败:', res.message)
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
            if (!this.examId || this.examId === 'undefined') {
                this.$message.error('测验ID参数错误')
                return
            }
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
        },
        getQuestionStats(questionId) {
            return this.questionStats.find(q => q.id === questionId)
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
        padding: 20px;
    }

    .question-stat-item {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background-color: #fafafa;
    }

    .question-info h4 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 16px;
    }

    .question-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
    }

    .question-type {
        background-color: #e1f3ff;
        color: #409eff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .question-score {
        background-color: #f0f9ff;
        color: #67c23a;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .question-stat-data {
        background-color: white;
        padding: 15px;
        border-radius: 6px;
    }

    .stat-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .stat-label {
        font-weight: bold;
        margin-right: 10px;
        color: #606266;
    }

    .stat-value {
        color: #409eff;
        font-weight: bold;
    }

    .no-data {
        text-align: center;
        color: #909399;
        padding: 50px;
        font-size: 14px;
    }

    /* 新增：试卷题目详情样式 */
    .title-section {
        margin-bottom: 30px;
    }

    .section-title {
        color: #303133;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #409eff;
    }

    .question-item {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background-color: #fafafa;
    }

    .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }

    .question-title {
        margin: 0;
        color: #303133;
        font-size: 16px;
        flex: 1;
    }

    .question-score {
        color: #67c23a;
        font-weight: normal;
        font-size: 14px;
        margin-left: 10px;
    }

    .question-type-tag {
        background-color: #e1f3ff;
        color: #409eff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
    }

    .question-options {
        background-color: white;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 15px;
    }

    .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .option-item:hover {
        background-color: #f5f7fa;
    }

    .option-prefix {
        font-weight: bold;
        margin-right: 8px;
        color: #606266;
        min-width: 20px;
    }

    .question-judge,
    .question-fill,
    .question-essay {
        background-color: white;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 15px;
    }

    .correct-answer {
        display: flex;
        align-items: center;
    }

    .answer-analysis p {
        margin: 0 0 10px 0;
        color: #606266;
    }

    .answer-content {
        background-color: #f5f7fa;
        padding: 10px;
        border-radius: 4px;
        color: #303133;
        line-height: 1.6;
    }

    .question-stats {
        background-color: white;
        padding: 15px;
        border-radius: 6px;
        border-top: 1px solid #e4e7ed;
    }

    .stats-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }
}
</style>