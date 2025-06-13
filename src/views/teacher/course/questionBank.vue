<template>
    <div class="question-bank-container">
        <div class="page-header">
            <h2>题库管理</h2>
            <el-dropdown @command="handleAddQuestion" split-button type="primary">
                添加题目
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="singleChoice">单选题</el-dropdown-item>
                    <el-dropdown-item command="multipleChoice">多选题</el-dropdown-item>
                    <el-dropdown-item command="trueFalse">判断题</el-dropdown-item>
                    <el-dropdown-item command="shortAnswer">简答题</el-dropdown-item>
                    <el-dropdown-item command="gapFilling">填空题</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>

        <el-form :model="queryParam" ref="queryForm" :inline="true">
            <el-form-item label="题目ID：">
                <el-input v-model="queryParam.id" clearable></el-input>
            </el-form-item>
            <el-form-item label="题目内容：">
                <el-input v-model="queryParam.content" clearable></el-input>
            </el-form-item>
            <el-form-item label="题型：">
                <el-select v-model="queryParam.questionType" clearable>
                    <el-option v-for="item in questionTypeEnum" :key="item.key" :value="item.key"
                        :label="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchQuestions">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="questions" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="questionType" label="题型" width="100">
                <template slot-scope="scope">
                    {{ formatQuestionType(scope.row.questionType) }}
                </template>
            </el-table-column>
            <el-table-column prop="shortTitle" label="题干" show-overflow-tooltip></el-table-column>
            <el-table-column prop="score" label="分数" width="80"></el-table-column>
            <el-table-column prop="difficult" label="难度" width="80"></el-table-column>
            <el-table-column label="操作" width="250" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="previewQuestion(scope.row)">预览</el-button>
                    <el-button size="mini" type="primary" @click="editQuestion(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="deleteQuestion(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex"
            :limit.sync="queryParam.pageSize" @pagination="fetchQuestions" />

        <!-- 预览题目对话框 -->
        <el-dialog title="题目预览" :visible.sync="previewDialog.visible" width="60%">
            <div v-loading="previewDialog.loading">
                <div v-if="previewDialog.question">
                    <h3>{{ formatQuestionType(previewDialog.question.questionType) }}</h3>
                    <div class="question-content" v-html="previewDialog.question.title"></div>

                    <!-- 选择题选项 -->
                    <div v-if="[1, 2, 3].includes(previewDialog.question.questionType)" class="question-options">
                        <div v-for="(item, index) in previewDialog.question.items" :key="index" class="option-item">
                            <span>{{ String.fromCharCode(65 + index) }}. </span>
                            <span v-html="item.content"></span>
                        </div>
                    </div>

                    <div class="question-answer">
                        <h4>正确答案</h4>
                        <div v-html="previewDialog.question.correct"></div>
                    </div>

                    <div class="question-analysis" v-if="previewDialog.question.analyze">
                        <h4>题目解析</h4>
                        <div v-html="previewDialog.question.analyze"></div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex'
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
            questions: [],
            total: 0,
            queryParam: {
                id: null,
                content: '',
                questionType: null,
                pageIndex: 1,
                pageSize: 10
            },
            previewDialog: {
                visible: false,
                loading: false,
                question: null
            },
            editTypeMap: {
                1: 'singleChoice',  // 单选题
                2: 'multipleChoice', // 多选题
                3: 'trueFalse',     // 判断题
                4: 'gapFilling',    // 填空题
                5: 'shortAnswer'    // 简答题
            }
        }
    },
    computed: {
        ...mapState('enumItem', {
            questionTypeEnum: state => state.exam.question.typeEnum
        })
    },
    created() {
        this.fetchQuestions()
    },
    methods: {
        formatQuestionType(type) {
            const found = this.questionTypeEnum.find(item => item.key === type)
            return found ? found.value : '未知类型'
        },
        searchQuestions() {
            this.queryParam.pageIndex = 1
            this.fetchQuestions()
        },
        fetchQuestions() {
            this.loading = true
            teacherExamApi.getQuestionList(this.courseId, this.queryParam).then(res => {
                if (res.code === 1) {
                    const data = res.response
                    this.questions = data.list
                    this.total = data.total
                } else {
                    this.$message.error(res.message || '获取题目列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error('获取题目列表出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.loading = false
            })
        },
        previewQuestion(row) {
            this.previewDialog.visible = true
            this.previewDialog.loading = true

            teacherExamApi.getQuestion(this.courseId, row.id).then(res => {
                if (res.code === 1) {
                    this.previewDialog.question = res.response
                } else {
                    this.$message.error(res.message || '获取题目详情失败')
                }
                this.previewDialog.loading = false
            }).catch(error => {
                console.error('获取题目详情出错:', error)
                this.$message.error('网络错误，请稍后重试')
                this.previewDialog.loading = false
            })
        },
        editQuestion(row) {
            const questionType = this.editTypeMap[row.questionType]
            if (questionType) {
                this.$router.push({
                    path: `/teacher/course/${this.courseId}/question/edit/${questionType}`,
                    query: { id: row.id }
                })
            } else {
                this.$message.error('不支持的题目类型')
            }
        },
        deleteQuestion(row) {
            this.$confirm('确定删除该题目吗？删除后将无法恢复。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                teacherExamApi.deleteQuestion(this.courseId, row.id).then(res => {
                    if (res.code === 1) {
                        this.$message.success('删除成功')
                        this.fetchQuestions()
                    } else {
                        this.$message.error(res.message || '删除失败')
                    }
                }).catch(error => {
                    console.error('删除题目出错:', error)
                    this.$message.error('网络错误，请稍后重试')
                })
            }).catch(() => {
                // 取消删除
            })
        },
        handleAddQuestion(command) {
            this.$router.push({
                path: `/teacher/course/${this.courseId}/question/edit/${command}`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.question-bank-container {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .question-content,
    .question-answer,
    .question-analysis {
        margin-bottom: 15px;
    }

    .option-item {
        margin-bottom: 10px;
    }
}
</style>