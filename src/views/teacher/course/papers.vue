<template>
    <div class="papers-container">
        <div class="page-header">
            <h2>试卷管理</h2>
            <el-button type="primary" @click="createPaper">创建新试卷</el-button>
        </div>

        <el-form :model="queryParam" ref="queryForm" :inline="true">
            <el-form-item label="试卷ID：">
                <el-input v-model="queryParam.id" clearable></el-input>
            </el-form-item>
            <el-form-item label="试卷名称：">
                <el-input v-model="queryParam.name" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchPapers">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="papers" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="试卷名称"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="questionCount" label="题目数量" width="100"></el-table-column>
            <el-table-column prop="score" label="总分" width="80"></el-table-column>
            <el-table-column label="操作" width="250" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="previewPaper(scope.row)">预览</el-button>
                    <el-button size="mini" type="primary" @click="editPaper(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="deletePaper(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex"
            :limit.sync="queryParam.pageSize" @pagination="fetchPapers" />

        <!-- 预览试卷对话框 -->
        <el-dialog title="试卷预览" :visible.sync="previewDialog.visible" width="70%">
            <div v-loading="previewDialog.loading">
                <div v-if="previewDialog.paper">
                    <h2 class="paper-title">{{ previewDialog.paper.name }}</h2>
                    <div class="paper-info">
                        <p><strong>总分：</strong>{{ previewDialog.paper.score }}分</p>
                        <p><strong>建议时长：</strong>{{ previewDialog.paper.suggestTime }}分钟</p>
                    </div>

                    <div v-for="(titleItem, titleIndex) in previewDialog.paper.titleItems" :key="'title-' + titleIndex"
                        class="paper-section">
                        <h3 class="section-title">{{ titleIndex + 1 }}. {{ titleItem.name }}</h3>

                        <div v-for="(questionItem, questionIndex) in titleItem.questionItems"
                            :key="'question-' + titleIndex + '-' + questionIndex" class="question-item">
                            <h4 class="question-title">{{ questionIndex + 1 }}. {{ questionItem.title }} <span
                                    class="question-score">({{ questionItem.score }}分)</span></h4>

                            <!-- 选择题选项 -->
                            <div v-if="[1, 3].includes(questionItem.questionType)" class="question-options">
                                <div v-for="(item, index) in questionItem.items" :key="index" class="option-item">
                                    <span>{{ String.fromCharCode(65 + index) }}. </span>
                                    <span v-html="item.content"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import teacherExamApi from '@/api/teacherExam'

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
            loading: false,
            papers: [],
            total: 0,
            queryParam: {
                id: null,
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            previewDialog: {
                visible: false,
                loading: false,
                paper: null
            }
        }
    },
    created() {
        this.fetchPapers()
    },
    methods: {
        searchPapers() {
            this.queryParam.pageIndex = 1
            this.fetchPapers()
        },
        fetchPapers() {
            this.loading = true
            teacherExamApi.getPaperPage(this.courseId, this.queryParam).then(res => {
                if (res.code === 1) {
                    const data = res.response
                    this.papers = data.list
                    this.total = data.total
                } else {
                    this.$message.error(res.message || '获取试卷列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error('获取试卷列表出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.loading = false
            })
        },
        previewPaper(row) {
            this.previewDialog.visible = true
            this.previewDialog.loading = true

            teacherExamApi.selectPaper(this.courseId, row.id).then(res => {
                if (res.code === 1) {
                    this.previewDialog.paper = res.response
                } else {
                    this.$message.error(res.message || '获取试卷详情失败')
                }
                this.previewDialog.loading = false
            }).catch(error => {
                console.error('获取试卷详情出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.previewDialog.loading = false
            })
        },
        editPaper(row) {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/paper/edit`,
                query: { id: row.id }
            })
        },
        createPaper() {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/paper/edit`
            })
        },
        deletePaper(row) {
            this.$confirm('确定删除该试卷吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                teacherExamApi.deletePaper(this.courseId, row.id).then(res => {
                    if (res.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchPapers()
                    } else {
                        this.$message.error(res.message || '删除失败')
                    }
                }).catch(error => {
                    console.error('删除试卷出错:', error)
                    this.$message.error('网络错误，请稍后重试')
                })
            }).catch(() => {
                // 取消删除
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.papers-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .paper-title {
        text-align: center;
        margin-bottom: 20px;
    }

    .paper-info {
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
        padding: 10px;
        background-color: #f5f7fa;
        border-radius: 4px;
    }

    .paper-section {
        margin-bottom: 30px;

        .section-title {
            border-left: 4px solid #409EFF;
            padding-left: 10px;
            margin-bottom: 15px;
        }
    }

    .question-item {
        margin-bottom: 25px;
        padding-left: 10px;

        .question-title {
            margin-bottom: 10px;

            .question-score {
                color: #E6A23C;
                font-size: 0.9em;
            }
        }
    }

    .option-item {
        margin-bottom: 10px;
        padding-left: 20px;
    }
}
</style>